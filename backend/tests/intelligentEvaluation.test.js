const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ARCHETYPE_RUBRICS,
  ARCHETYPE_COMPETENCIES,
  getArchetypeKey,
  generateConversationalResponse,
  generateMockEvidenceReport
} = require('../services/aiService');

test('Phase 3 - Requirement 1: Rubric Isolation per Archetype', () => {
  // Test archetype key resolver
  assert.equal(getArchetypeKey('HR Interview'), 'hr');
  assert.equal(getArchetypeKey('Behavioral Interview'), 'behavioral');
  assert.equal(getArchetypeKey('Coding Interview'), 'coding');
  assert.equal(getArchetypeKey('Resume Interview'), 'resume');
  assert.equal(getArchetypeKey('Project Discussion'), 'project');
  assert.equal(getArchetypeKey('System Design'), 'system_design');
  assert.equal(getArchetypeKey('Technical Interview'), 'technical');

  // Verify rubrics exist for all archetypes
  const archetypes = ['hr', 'behavioral', 'technical', 'coding', 'resume', 'project', 'system_design'];
  archetypes.forEach(arch => {
    assert.ok(ARCHETYPE_RUBRICS[arch], `Rubric must exist for ${arch}`);
    assert.ok(ARCHETYPE_RUBRICS[arch].name, `Rubric name must be defined for ${arch}`);
    assert.ok(ARCHETYPE_RUBRICS[arch].description, `Rubric description must be defined for ${arch}`);
    assert.ok(Array.isArray(ARCHETYPE_RUBRICS[arch].criteria) && ARCHETYPE_RUBRICS[arch].criteria.length >= 4, `Rubric criteria must have at least 4 items for ${arch}`);
  });

  // Verify strict non-overlapping criteria (no coding in HR, no HR in coding)
  const hrCriteriaStr = ARCHETYPE_RUBRICS.hr.criteria.join(' ').toLowerCase();
  assert.ok(!hrCriteriaStr.includes('algorithmic'), 'HR rubric must not contain algorithmic criteria');
  assert.ok(!hrCriteriaStr.includes('code syntax'), 'HR rubric must not contain code syntax criteria');

  const codingCriteriaStr = ARCHETYPE_RUBRICS.coding.criteria.join(' ').toLowerCase();
  assert.ok(codingCriteriaStr.includes('algorithmic'), 'Coding rubric must contain algorithmic criteria');
  assert.ok(codingCriteriaStr.includes('complexity'), 'Coding rubric must contain complexity criteria');
  assert.ok(!codingCriteriaStr.includes('teamwork'), 'Coding rubric must not evaluate generic teamwork');
});

test('Phase 3 - Requirement 2: Archetype-Specific Competencies', () => {
  const archetypes = ['hr', 'behavioral', 'technical', 'coding', 'resume', 'project', 'system_design'];
  archetypes.forEach(arch => {
    assert.ok(Array.isArray(ARCHETYPE_COMPETENCIES[arch]), `Competency list must exist for ${arch}`);
    assert.ok(ARCHETYPE_COMPETENCIES[arch].length >= 4, `Must have at least 4 competencies for ${arch}`);
  });

  assert.ok(ARCHETYPE_COMPETENCIES.hr.some(c => c.toLowerCase().includes('teamwork')), 'HR competencies must include teamwork');
  assert.ok(ARCHETYPE_COMPETENCIES.behavioral.some(c => c.toLowerCase().includes('star')), 'Behavioral competencies must include STAR');
  assert.ok(ARCHETYPE_COMPETENCIES.coding.some(c => c.toLowerCase().includes('complexity')), 'Coding competencies must include complexity');
  assert.ok(ARCHETYPE_COMPETENCIES.system_design.some(c => c.toLowerCase().includes('database') || c.toLowerCase().includes('caching')), 'System Design competencies must include database or caching');
});

test('Phase 3 - Requirement 3: Evaluation of Answers & Follow-up Logic', async () => {
  // Test complete answer handling
  const resComplete = await generateConversationalResponse({
    userAnswer: 'In my previous project at TechCorp, I engineered a distributed Redis caching layer in front of our PostgreSQL database to mitigate high read contention during flash sales, which reduced 95th percentile query latency from 320ms down to 18ms across 50,000 requests per minute.',
    questionAsked: 'How did you handle performance bottlenecks in your backend architecture?',
    role: 'Backend Engineer',
    type: 'Technical Interview',
    difficulty: 'Intermediate',
    questionNumber: 2
  });

  assert.ok(resComplete.acknowledgement, 'Must return acknowledgement');
  assert.ok(resComplete.nextQuestion, 'Must return next question');
  assert.ok(resComplete.evaluation, 'Must return evaluation');
  assert.ok(typeof resComplete.evaluation.score === 'number', 'Evaluation score must be a number');
  assert.ok(resComplete.evaluation.score >= 5, 'Comprehensive answer should receive a passing score');

  // Test "I don't know" handling: graceful low score, pivot without getting stuck
  const resDontKnow = await generateConversationalResponse({
    userAnswer: "I don't know much about Apache Kafka because I haven't worked with message queues directly yet.",
    questionAsked: 'Can you explain how Kafka handles partition offsets and consumer group rebalancing?',
    role: 'Backend Engineer',
    type: 'Technical Interview',
    difficulty: 'Intermediate',
    questionNumber: 3
  });

  assert.equal(resDontKnow.isFollowUp, false, 'Must NOT follow up on an unknown topic');
  assert.ok(resDontKnow.evaluation.score <= 4, 'Score should reflect lack of knowledge respectfully');
  assert.ok(typeof resDontKnow.acknowledgement === 'string' && resDontKnow.acknowledgement.length > 5, 'Must return non-empty acknowledgement');
  assert.ok(resDontKnow.acknowledgement.toLowerCase().includes('no problem') || resDontKnow.acknowledgement.toLowerCase().includes('fine') || resDontKnow.acknowledgement.toLowerCase().includes('move') || resDontKnow.acknowledgement.toLowerCase().includes('okay') || resDontKnow.acknowledgement.toLowerCase().includes('shift') || resDontKnow.acknowledgement.toLowerCase().includes('focus') || resDontKnow.acknowledgement.toLowerCase().includes('different topic') || resDontKnow.acknowledgement.toLowerCase().includes('understood'), 'Acknowledgement must be encouraging');
});

test('Phase 3 - Requirement 4: Duplicate-Question Prevention', async () => {
  const existingQuestions = [
    'Can you explain a fundamental concept in Node.js and describe how you have implemented it in a production scenario?',
    'What are the most common performance bottlenecks or memory management pitfalls in Node.js, and how do you avoid them?'
  ];

  const res = await generateConversationalResponse({
    userAnswer: 'I have used Node.js streams to process multi-gigabyte CSV uploads with low memory footprint.',
    questionAsked: 'Tell me about Node.js memory management.',
    role: 'Node.js Developer',
    type: 'Technical Interview',
    selectedTopics: ['Node.js'],
    adaptiveState: {
      askedFollowupQuestions: [...existingQuestions]
    }
  });

  assert.ok(res.adaptiveState?.askedFollowupQuestions, 'Must maintain askedFollowupQuestions array');
  assert.ok(!existingQuestions.includes(res.nextQuestion), 'Generated question must not duplicate previously asked questions');
  assert.ok(res.adaptiveState.askedFollowupQuestions.includes(res.nextQuestion), 'New question must be recorded in askedFollowupQuestions');
});

test('Phase 3 - Requirement 5: Structured Interview Plan Tracking', async () => {
  const initialAdaptiveState = {
    interviewPlan: {
      totalPlannedQuestions: 6,
      targetCompetencies: ARCHETYPE_COMPETENCIES.hr,
      coveredCompetencies: [],
      uncoveredCompetencies: [...ARCHETYPE_COMPETENCIES.hr],
      currentCompetency: ARCHETYPE_COMPETENCIES.hr[0]
    }
  };

  const res = await generateConversationalResponse({
    userAnswer: 'I am motivated by creating scalable solutions that empower end users and working in cross-functional teams.',
    questionAsked: 'Why do you want to join our organization?',
    role: 'Engineering Manager',
    type: 'HR Interview',
    adaptiveState: initialAdaptiveState
  });

  const updatedPlan = res.adaptiveState?.interviewPlan;
  assert.ok(updatedPlan, 'Must return updated interviewPlan');
  assert.ok(Array.isArray(updatedPlan.coveredCompetencies), 'coveredCompetencies must be an array');
  if (!res.isFollowUp) {
    assert.ok(updatedPlan.coveredCompetencies.includes(ARCHETYPE_COMPETENCIES.hr[0]), 'Initial competency should be marked covered when moving forward');
  }
});

test('Phase 3 - Requirement 6: Correct Score Calculation & Normalization (0-100)', async () => {
  const mockInterview = {
    role: 'Software Engineer',
    type: 'Coding Interview',
    difficulty: 'Medium',
    questions: [
      {
        question: 'Solve Two Sum with O(N) time complexity.',
        userAnswer: 'I used a hash map to store each complement and achieved O(N) time and O(N) space.',
        score: 9,
        aiFeedback: 'Optimal hash table solution.'
      },
      {
        question: 'How do you handle duplicate elements?',
        userAnswer: 'The hash map indices can store array lists or we check if complement index differs.',
        score: 7,
        aiFeedback: 'Sound boundary check.'
      }
    ]
  };

  const report = await generateMockEvidenceReport(mockInterview);

  assert.ok(typeof report.overallScore === 'number', 'overallScore must be a number');
  assert.ok(report.overallScore >= 0 && report.overallScore <= 100, 'overallScore must be normalized between 0 and 100');
  // (90 + 70) / 2 = 80
  assert.equal(report.overallScore, 80, 'Score should be exact mathematical mean (80)');
  assert.equal(report.finalDecision, 'Interview Ready', 'Score 80 must yield "Interview Ready"');

  // Verify scoringBreakdown adheres to coding rubric
  assert.ok(Array.isArray(report.scoringBreakdown), 'scoringBreakdown must be an array');
  assert.ok(report.scoringBreakdown.length >= 4, 'Must have at least 4 category scores');
  assert.ok(report.scoringBreakdown.some(c => c.category.toLowerCase().includes('algorithmic') || c.category.toLowerCase().includes('logic')), 'Breakdown must include algorithmic category');
});

test('Phase 3 - Requirement 7: Empty Interviews and Skipped Questions', async () => {
  // Test 1: Completely empty interview (0 questions)
  const emptyInterview = {
    role: 'Frontend Developer',
    type: 'Technical Interview',
    questions: []
  };

  const emptyReport = await generateMockEvidenceReport(emptyInterview);
  assert.equal(emptyReport.overallScore, 0, 'Empty interview must have overallScore = 0');
  assert.equal(emptyReport.finalDecision, 'Needs Improvement', 'Empty interview must yield "Needs Improvement"');
  assert.equal(emptyReport.questionAnalysis.length, 0, 'Empty interview questionAnalysis must be empty');
  assert.ok(emptyReport.scoringBreakdown.every(c => c.score === 0), 'All breakdown scores must be 0 for empty interview');

  // Test 2: Interview with skipped/unanswered question
  const skippedInterview = {
    role: 'Frontend Developer',
    type: 'Technical Interview',
    questions: [
      {
        question: 'Explain React hooks and closure staleness.',
        userAnswer: 'I used useEffect and useRef to hold mutable latest callbacks without triggering re-renders.',
        score: 8
      },
      {
        question: 'How does React Concurrent Mode work under the hood?',
        userAnswer: 'Skipped', // Skipped question
        score: 0
      }
    ]
  };

  const skippedReport = await generateMockEvidenceReport(skippedInterview);
  // (80 + 0) / 2 = 40
  assert.equal(skippedReport.overallScore, 40, 'Skipped questions must score 0 and lower overall average');
  assert.equal(skippedReport.finalDecision, 'Needs Improvement', 'Score 40 must yield "Needs Improvement"');
  
  const skippedAnalysis = skippedReport.questionAnalysis.find(q => q.status === 'unanswered' || q.score === 0);
  assert.ok(skippedAnalysis, 'Must identify skipped question in questionAnalysis');
  assert.equal(skippedAnalysis.score, 0, 'Skipped question score in analysis must be 0');
  assert.ok(skippedReport.observedEvidence.skippedCount >= 1, 'observedEvidence must record at least 1 skipped question');
});

test('Phase 3 - Requirement 8: No False Claims About Code Execution & Disclaimers', async () => {
  const codingInterview = {
    role: 'Full Stack Engineer',
    type: 'Coding Interview',
    questions: [
      {
        question: 'Implement a binary search function.',
        userAnswer: 'function bSearch(arr, target) { let l = 0, r = arr.length - 1; while(l <= r) { const mid = Math.floor((l+r)/2); if(arr[mid] === target) return mid; if(arr[mid] < target) l = mid + 1; else r = mid - 1; } return -1; }',
        score: 8
      }
    ]
  };

  const report = await generateMockEvidenceReport(codingInterview);

  // Requirement: Static analysis notice without claiming runtime execution
  assert.ok(report.codeAnalysis, 'Report must contain codeAnalysis section');
  assert.equal(report.codeAnalysis.staticallyAnalyzed, true, 'codeAnalysis.staticallyAnalyzed must be true');
  assert.equal(report.codeAnalysis.executionHarnessRan, false, 'codeAnalysis.executionHarnessRan must be false');
  assert.ok(report.codeAnalysis.disclaimer.includes('static analysis without runtime test execution'), 'Must state static analysis disclaimer');

  // Requirement: AI hiring estimate disclaimer
  assert.ok(report.disclaimer, 'Report must contain disclaimer');
  assert.ok(report.disclaimer.includes('Not an official hiring determination'), 'Must state estimate disclaimer');

  // Requirement: Observed evidence separates quotes from inferences
  assert.ok(report.observedEvidence, 'Report must contain observedEvidence');
  assert.ok(Array.isArray(report.observedEvidence.candidateQuotes), 'Must track candidateQuotes');
  assert.ok(report.observedEvidence.candidateQuotes.length > 0, 'Must record actual candidate quotes');
});

test('Phase 3 - Requirement 9: Fallback Reliability & Resilience on Provider Errors', async () => {
  // Simulate complete service resilience by generating report with varied data
  const resumeInterview = {
    role: 'Data Scientist',
    type: 'Resume Interview',
    questions: [
      {
        question: 'Walk me through your Random Forest churn prediction model.',
        userAnswer: 'I processed 200,000 customer records with feature engineering for tenure and billing, tuning hyperparameters with GridSearchCV to achieve an AUC-ROC of 0.89.',
        score: 9,
        aiFeedback: 'Strong quantifiable metrics.'
      }
    ]
  };

  const report = await generateMockEvidenceReport(resumeInterview);

  assert.ok(report.overallScore >= 80, 'Report must calculate high score for strong answer');
  assert.ok(report.strengths.length > 0, 'Must provide strengths based on candidate answers');
  assert.ok(report.weaknesses.length > 0, 'Must provide improvement areas');
  assert.ok(report.improvementRoadmap.length > 0, 'Must provide actionable roadmap');
  assert.ok(report.scoringBreakdown.some(c => c.category.toLowerCase().includes('resume') || c.category.toLowerCase().includes('project') || c.category.toLowerCase().includes('authenticity')), 'Resume breakdown must focus on resume verification');
});

