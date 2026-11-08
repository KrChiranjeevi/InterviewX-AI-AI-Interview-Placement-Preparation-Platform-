const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const interviewRoutes = require('../routes/interviewRoutes');
const { validateInterviewConfig, VALID_ARCHETYPES, VALID_DIFFICULTIES } = interviewRoutes;
const {
  generateQuestion,
  generateConversationalResponse,
  generateMockEvidenceReport,
  getArchetypeKey,
  ARCHETYPE_RUBRICS,
  ARCHETYPE_COMPETENCIES
} = require('../services/aiService');

test('Phase 4 - Requirement 1: Archetype Isolation & Selection', () => {
  const supportedArchetypes = [
    'Technical Interview',
    'Coding Interview',
    'Resume Interview',
    'HR Interview',
    'Behavioral Interview',
    'Project Discussion',
    'System Design Interview',
    'Extempore Round',
    'Group Discussion'
  ];

  supportedArchetypes.forEach(arch => {
    assert.ok(VALID_ARCHETYPES.includes(arch), `VALID_ARCHETYPES must include ${arch}`);
  });

  // Rejection of invalid archetype
  const invalidResult = validateInterviewConfig({
    interviewType: 'Unrelated Generic Chat',
    duration: '30 Minutes'
  });
  assert.equal(invalidResult.valid, false);
  assert.equal(invalidResult.status, 400);
  assert.match(invalidResult.message, /Invalid interview archetype/);
});

test('Phase 4 - Requirement 2: Resume Interview Prerequisites', () => {
  // Missing resume text
  const missingResume = validateInterviewConfig({
    interviewType: 'Resume Interview',
    difficulty: 'Medium',
    duration: '30 Minutes'
  });
  assert.equal(missingResume.valid, false);
  assert.equal(missingResume.status, 400);
  assert.match(missingResume.message, /at least 50 characters/);

  // Resume text too short (< 50 chars)
  const shortResume = validateInterviewConfig({
    interviewType: 'Resume Interview',
    resumeText: 'Frontend engineer with React experience.',
    difficulty: 'Medium',
    duration: '30 Minutes'
  });
  assert.equal(shortResume.valid, false);
  assert.equal(shortResume.status, 400);
  assert.match(shortResume.message, /at least 50 characters/);

  // Valid resume (>= 50 chars)
  const validResume = validateInterviewConfig({
    interviewType: 'Resume Interview',
    resumeText: 'Full Stack Software Engineer with 3 years building React, Node.js, and Redis microservices.',
    difficulty: 'Medium',
    duration: '30 Minutes'
  });
  assert.equal(validResume.valid, true);
});

test('Phase 4 - Requirement 3: Difficulty Selection (Easy, Medium, Hard)', async () => {
  // Validate accepted difficulties
  assert.ok(VALID_DIFFICULTIES.includes('Easy'));
  assert.ok(VALID_DIFFICULTIES.includes('Medium'));
  assert.ok(VALID_DIFFICULTIES.includes('Hard'));

  // Invalid difficulty rejected
  const invalidDiff = validateInterviewConfig({
    interviewType: 'HR Interview',
    difficulty: 'SuperImpossible',
    duration: '20 Minutes'
  });
  assert.equal(invalidDiff.valid, false);
  assert.equal(invalidDiff.status, 400);
  assert.match(invalidDiff.message, /Invalid difficulty/);

  // Fallback question generation branches by difficulty
  const easyResp = await generateConversationalResponse({
    userAnswer: 'I have some basic experience.',
    questionAsked: 'Tell me about React hooks.',
    type: 'Technical Interview',
    technicalTrack: 'Frontend Developer',
    selectedTopics: ['React'],
    difficulty: 'Easy',
    questionNumber: 2
  });

  const hardResp = await generateConversationalResponse({
    userAnswer: 'I have production experience with distributed caching.',
    questionAsked: 'Explain Redis concurrency.',
    type: 'Technical Interview',
    technicalTrack: 'Backend Developer',
    selectedTopics: ['Caching (Redis)'],
    difficulty: 'Hard',
    questionNumber: 2
  });

  assert.ok(easyResp.nextQuestion, 'Easy response must have nextQuestion');
  assert.ok(hardResp.nextQuestion, 'Hard response must have nextQuestion');
  assert.notEqual(easyResp.nextQuestion, hardResp.nextQuestion, 'Easy and Hard must generate different questions');
});

test('Phase 4 - Requirement 4 & 5: Duration Options & Dynamic Question Planning', async () => {
  const durations = ['10 Minutes', '20 Minutes', '30 Minutes', '40 Minutes', '60 Minutes'];
  durations.forEach(dur => {
    const res = validateInterviewConfig({
      interviewType: 'HR Interview',
      difficulty: 'Medium',
      duration: dur
    });
    assert.equal(res.valid, true, `Duration ${dur} must be valid`);
  });

  // Zero duration rejected
  const zeroDur = validateInterviewConfig({
    interviewType: 'HR Interview',
    difficulty: 'Medium',
    duration: '0 Minutes'
  });
  assert.equal(zeroDur.valid, false);
  assert.equal(zeroDur.status, 400);

  // Question count adaptation based on duration
  const plan10 = await generateConversationalResponse({
    userAnswer: 'I prioritize team collaboration.',
    questionAsked: 'Intro question',
    type: 'HR Interview',
    duration: '10 Minutes',
    questionNumber: 1
  });

  const plan60 = await generateConversationalResponse({
    userAnswer: 'I prioritize team collaboration.',
    questionAsked: 'Intro question',
    type: 'HR Interview',
    duration: '60 Minutes',
    questionNumber: 1
  });

  assert.equal(plan10.adaptiveState.interviewPlan.totalPlannedQuestions, 4, '10 min interview plans 4 questions');
  assert.equal(plan60.adaptiveState.interviewPlan.totalPlannedQuestions, 14, '60 min interview plans 14 questions');
});

test('Phase 4 - Requirement 6: Coding Track & SubLanguage Persistence', () => {
  const dsaConfig = validateInterviewConfig({
    interviewType: 'Coding Interview',
    codingTrack: 'DSA',
    subLanguage: 'Java',
    difficulty: 'Hard',
    duration: '45 Minutes'
  });
  assert.equal(dsaConfig.valid, true);

  const sqlConfig = validateInterviewConfig({
    interviewType: 'Coding Interview',
    codingTrack: 'SQL',
    subLanguage: 'SQL',
    difficulty: 'Medium',
    duration: '30 Minutes'
  });
  assert.equal(sqlConfig.valid, true);
});

test('Phase 4 - Requirement 7: Archetype-Specific Input Validations', () => {
  // Technical requires track & topics
  const techMissingTopics = validateInterviewConfig({
    interviewType: 'Technical Interview',
    technicalTrack: 'Frontend Developer',
    selectedTopics: [],
    duration: '30 Minutes'
  });
  assert.equal(techMissingTopics.valid, false);
  assert.match(techMissingTopics.message, /at least one selected topic/);

  // Coding requires track/subLanguage
  const codingMissingTrack = validateInterviewConfig({
    interviewType: 'Coding Interview',
    duration: '30 Minutes'
  });
  assert.equal(codingMissingTrack.valid, false);
  assert.match(codingMissingTrack.message, /coding track or programming language/);

  // Project Discussion requires project title
  const projMissingTitle = validateInterviewConfig({
    interviewType: 'Project Discussion',
    duration: '30 Minutes'
  });
  assert.equal(projMissingTitle.valid, false);
  assert.match(projMissingTitle.message, /project title/);

  // System Design requires domain
  const sdMissingDomain = validateInterviewConfig({
    interviewType: 'System Design Interview',
    duration: '45 Minutes'
  });
  assert.equal(sdMissingDomain.valid, false);
  assert.match(sdMissingDomain.message, /system design domain/);
});

test('Phase 4 - Requirement 8: Time Expiry & Report Generation', async () => {
  const mockInterviewSession = {
    type: 'Technical Interview',
    role: 'Full Stack Developer',
    technicalTrack: 'Full Stack Developer',
    selectedTopics: ['React', 'Node.js'],
    difficulty: 'Medium',
    duration: '30 Minutes',
    questions: [
      {
        question: 'Explain React useEffect lifecycle.',
        userAnswer: 'It runs after render to synchronize side effects with state changes.',
        score: 8,
        aiFeedback: 'Good understanding of side effect execution.'
      },
      {
        question: 'Explain Node.js event loop phases.',
        userAnswer: 'skipped',
        score: 0,
        aiFeedback: 'Question skipped.'
      }
    ]
  };

  const report = await generateMockEvidenceReport(mockInterviewSession);
  assert.ok(report, 'Report must be generated');
  assert.ok(typeof report.overallScore === 'number', 'Overall score must be numeric');
  assert.equal(report.observedEvidence.totalQuestions, 2);
  assert.equal(report.observedEvidence.answeredCount, 1);
  assert.equal(report.observedEvidence.skippedCount, 1);
  assert.ok(report.codeAnalysis.staticallyAnalyzed);
  assert.ok(report.disclaimer);
});

test('Phase 4 - Requirement 9: Behavioral Competencies Configuration', async () => {
  const hrCompetenciesConfig = validateInterviewConfig({
    interviewType: 'Behavioral Interview',
    difficulty: 'Medium',
    duration: '30 Minutes',
    behavioralCompetencies: ['Teamwork & Collaboration', 'Conflict Resolution', 'Ownership & Accountability']
  });
  assert.equal(hrCompetenciesConfig.valid, true);

  const hrResp = await generateConversationalResponse({
    userAnswer: 'When a teammate and I disagreed on code structure, we reviewed unit test coverage and decided on a modular compromise.',
    questionAsked: 'Describe a disagreement with a colleague.',
    type: 'Behavioral Interview',
    difficulty: 'Medium',
    questionNumber: 2
  });

  assert.ok(hrResp.evaluation, 'Must evaluate behavioral answer');
  assert.equal(hrResp.evaluation.rubric, 'behavioral');
  assert.ok(hrResp.adaptiveState.interviewPlan.targetCompetencies.length >= 4);
});

test('Phase 4 - Requirement 10: Company Preparation Modules Preserved', () => {
  // Verify company prep modules remain untouched in codebase
  const companyPages = [
    path.join(__dirname, '../../frontend/src/pages/CognizantPrepDetail.jsx'),
    path.join(__dirname, '../../frontend/src/pages/TCSPrepDetail.jsx'),
    path.join(__dirname, '../../frontend/src/pages/InfosysPrepDetail.jsx'),
    path.join(__dirname, '../../frontend/src/pages/AccenturePrepDetail.jsx'),
    path.join(__dirname, '../../frontend/src/pages/CompanyExamEngine.jsx'),
    path.join(__dirname, '../../frontend/src/pages/AssessmentRoom.jsx')
  ];

  companyPages.forEach(filePath => {
    assert.ok(fs.existsSync(filePath), `Company prep module must exist: ${filePath}`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 500, `Company prep module must not be empty or truncated: ${filePath}`);
  });
});

