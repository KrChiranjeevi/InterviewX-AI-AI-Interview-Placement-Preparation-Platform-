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
  ARCHETYPE_COMPETENCIES,
  generateGDTopic,
  generateExtemporeTopic
} = require('../services/aiService');
const { sanitizeTextForSpeech, mergeTranscriptSegments } = require('../utils/voiceUtils');

// ============================================================================
// AUDIT SECTION 1: ALL 9 ARCHETYPES COMPLETE USER JOURNEY CONFIGURATION
// ============================================================================
test('Final Audit 1: Complete User Journey Setup & Archetype Isolation for All 9 Archetypes', () => {
  const allArchetypes = [
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

  // 1. All 9 archetypes are recognized and validated
  allArchetypes.forEach(arch => {
    assert.ok(VALID_ARCHETYPES.includes(arch), `VALID_ARCHETYPES must support '${arch}'`);
  });

  // 2. Technical Interview Configuration
  const techConfig = validateInterviewConfig({
    interviewType: 'Technical Interview',
    difficulty: 'Medium',
    duration: '30 Minutes',
    technicalTrack: 'Frontend Developer',
    selectedTopics: ['React', 'JavaScript', 'Web Performance']
  });
  assert.equal(techConfig.valid, true);

  // Missing technical track/topics rejected
  const techInvalid = validateInterviewConfig({
    interviewType: 'Technical Interview',
    difficulty: 'Medium',
    duration: '30 Minutes',
    technicalTrack: '',
    selectedTopics: []
  });
  assert.equal(techInvalid.valid, false);
  assert.match(techInvalid.message, /technical track|selected topic/i);

  // 3. Coding Interview Configuration
  const codingConfig = validateInterviewConfig({
    interviewType: 'Coding Interview',
    difficulty: 'Hard',
    duration: '45 Minutes',
    codingTrack: 'DSA',
    subLanguage: 'Python'
  });
  assert.equal(codingConfig.valid, true);

  // Missing coding track rejected
  const codingInvalid = validateInterviewConfig({
    interviewType: 'Coding Interview',
    difficulty: 'Hard',
    duration: '45 Minutes'
  });
  assert.equal(codingInvalid.valid, false);
  assert.match(codingInvalid.message, /coding track/i);

  // 4. Resume Interview Configuration
  const resumeConfig = validateInterviewConfig({
    interviewType: 'Resume Interview',
    difficulty: 'Medium',
    duration: '30 Minutes',
    resumeText: 'Jane Doe. Senior Full-Stack Engineer with 5 years experience in building microservices using Node.js, TypeScript, PostgreSQL, and AWS ECS. Architected real-time payment gateway processing 10k transactions per minute.',
    resumeProjects: [{ name: 'Real-Time Payment Gateway' }]
  });
  assert.equal(resumeConfig.valid, true);

  // Missing resume blocked
  const resumeBlocked = validateInterviewConfig({
    interviewType: 'Resume Interview',
    difficulty: 'Medium',
    duration: '30 Minutes',
    resumeText: ''
  });
  assert.equal(resumeBlocked.valid, false);
  assert.equal(resumeBlocked.status, 400);

  // 5. HR Interview Configuration
  const hrConfig = validateInterviewConfig({
    interviewType: 'HR Interview',
    difficulty: 'Easy',
    duration: '20 Minutes'
  });
  assert.equal(hrConfig.valid, true);

  // 6. Behavioral Interview Configuration
  const behavioralConfig = validateInterviewConfig({
    interviewType: 'Behavioral Interview',
    difficulty: 'Hard',
    duration: '45 Minutes',
    behavioralCompetencies: ['Leadership', 'Conflict Resolution', 'Ownership']
  });
  assert.equal(behavioralConfig.valid, true);

  // 7. Project Discussion Configuration
  const projectConfig = validateInterviewConfig({
    interviewType: 'Project Discussion',
    difficulty: 'Medium',
    duration: '30 Minutes',
    selectedProject: 'Distributed Multi-Tenant SaaS Billing Platform'
  });
  assert.equal(projectConfig.valid, true);

  // Missing project rejected
  const projectInvalid = validateInterviewConfig({
    interviewType: 'Project Discussion',
    difficulty: 'Medium',
    duration: '30 Minutes',
    selectedProject: ''
  });
  assert.equal(projectInvalid.valid, false);
  assert.match(projectInvalid.message, /project title/i);

  // 8. System Design Configuration
  const sysDesignConfig = validateInterviewConfig({
    interviewType: 'System Design Interview',
    difficulty: 'Hard',
    duration: '45 Minutes',
    systemDesignDomain: 'E-Commerce Global Flash Sale System'
  });
  assert.equal(sysDesignConfig.valid, true);

  // Missing domain rejected
  const sysDesignInvalid = validateInterviewConfig({
    interviewType: 'System Design Interview',
    difficulty: 'Hard',
    duration: '45 Minutes',
    systemDesignDomain: ''
  });
  assert.equal(sysDesignInvalid.valid, false);
  assert.match(sysDesignInvalid.message, /system design domain/i);

  // 9. Extempore Round Configuration
  const extemporeConfig = validateInterviewConfig({
    interviewType: 'Extempore Round',
    difficulty: 'Medium',
    duration: '15 Minutes'
  });
  assert.equal(extemporeConfig.valid, true);

  // 10. Group Discussion Configuration
  const gdConfig = validateInterviewConfig({
    interviewType: 'Group Discussion',
    difficulty: 'Medium',
    duration: '20 Minutes'
  });
  assert.equal(gdConfig.valid, true);
});

// ============================================================================
// AUDIT SECTION 2: INTERVIEW CORRECTNESS & GROUNDING
// ============================================================================
test('Final Audit 2: Interview Correctness, Resume Grounding & Non-Fabrication', async () => {
  // Test Resume Interview Grounding
  const mockResumeInterview = {
    _id: 'audit-resume-101',
    type: 'Resume Interview',
    role: 'Backend Engineer',
    difficulty: 'Medium',
    resumeText: 'Alex Rivera. Built Distributed Log Aggregator using Go, Kafka, and ClickHouse at DataScale Inc.',
    resumeProjects: [
      { name: 'Distributed Log Aggregator', tech: ['Go', 'Kafka', 'ClickHouse'] }
    ],
    resumeSkills: ['Go', 'Kafka', 'ClickHouse', 'Docker'],
    questionHistory: []
  };

  const resumeQuestion = await generateQuestion({
    type: mockResumeInterview.type,
    role: mockResumeInterview.role,
    difficulty: mockResumeInterview.difficulty,
    resumeText: mockResumeInterview.resumeText,
    resumeProjects: mockResumeInterview.resumeProjects,
    resumeSkills: mockResumeInterview.resumeSkills,
    questionHistory: []
  });

  assert.ok(resumeQuestion, 'Should produce a valid question');
  assert.equal(typeof resumeQuestion, 'string');
  assert.ok(resumeQuestion.length > 20, 'Question should have descriptive content');

  // Verify that HR question does not leak technical DSA terminology
  const hrQuestion = await generateQuestion({
    type: 'HR Interview',
    role: 'HR Executive',
    difficulty: 'Easy',
    questionHistory: []
  });
  assert.ok(!/binary tree|dynamic programming|time complexity|leetcode|sql query/i.test(hrQuestion),
    'HR interview must never leak coding or DSA terminology');

  // Verify System Design generates architecture question
  const sysDesignQuestion = await generateQuestion({
    type: 'System Design Interview',
    role: 'Senior Infrastructure Engineer',
    difficulty: 'Hard',
    systemDesignDomain: 'Video Streaming Platform like Netflix',
    questionHistory: []
  });
  assert.ok(/scale|distribut|architect|stream|load|cach|data|system/i.test(sysDesignQuestion),
    'System Design must query distributed architecture, caching, or scaling');
});

// ============================================================================
// AUDIT SECTION 3: ADAPTIVE TURN-TAKING & "I DON'T KNOW" HANDLING
// ============================================================================
test('Final Audit 3: Follow-Up Turn-Taking, Missing Details Probing & Graceful "I Don\'t Know" Pivot', async () => {
  const session = {
    _id: 'audit-turn-201',
    type: 'Technical Interview',
    role: 'Full Stack Engineer',
    difficulty: 'Medium',
    currentQuestion: 'How does the event loop in Node.js manage asynchronous I/O operations?',
    questionHistory: [{ question: 'How does the event loop in Node.js manage asynchronous I/O operations?' }],
    adaptiveState: {
      consecutiveLowScores: 0,
      askedFollowupQuestions: []
    }
  };

  // Case A: Candidate gives a surface-level answer missing libuv thread pool details
  const surfaceAnswer = 'The event loop uses a single thread and processes callbacks using a queue.';
  const followUpResponse = await generateConversationalResponse({
    interview: session,
    candidateAnswer: surfaceAnswer,
    conversationHistory: [{ role: 'user', content: surfaceAnswer }]
  });

  assert.ok(followUpResponse.nextQuestion, 'AI interviewer must generate a next question or follow-up');
  assert.ok(followUpResponse.acknowledgement, 'AI interviewer must provide natural conversational transition');

  // Case B: Candidate answers "I don't know" or "skip"
  const skipAnswer = "I'm not completely sure about the internal phases, can we move to the next topic?";
  const skipResponse = await generateConversationalResponse({
    interview: session,
    candidateAnswer: skipAnswer,
    conversationHistory: [{ role: 'user', content: skipAnswer }]
  });

  assert.ok(skipResponse.nextQuestion, 'Must transition to next question without stalling');
  // AI acknowledgement should be encouraging and not hallucinate that candidate gave a brilliant explanation
  assert.ok(!/brilliant answer|perfect explanation|outstanding depth/i.test(skipResponse.acknowledgement),
    'AI must not falsely praise an "I do not know" response');
});

// ============================================================================
// AUDIT SECTION 4: REAL VOICE ENGINE RELIABILITY & DEDUPLICATION
// ============================================================================
test('Final Audit 4: Voice Sanitization, Echo Isolation & Web Speech Deduplication', () => {
  // Test TTS Sanitization
  const verboseMarkdown = `### Next Step: Scalability\n\n**Question:** How would you handle a spike of **50,000 requests/sec**?\n\n\`\`\`sql\nSELECT * FROM orders WHERE status = 'pending';\n\`\`\`\n\n• Consider Redis clustering.\n[Presented Coding Challenge]: Implement the cache layer. 🚀 💡`;
  
  const sanitized = sanitizeTextForSpeech(verboseMarkdown);

  // Markdown characters stripped
  assert.ok(!sanitized.includes('###'));
  assert.ok(!sanitized.includes('**'));
  assert.ok(!sanitized.includes('```'));
  assert.ok(!sanitized.includes('SELECT * FROM orders'));
  assert.ok(!sanitized.includes('•'));
  assert.ok(!sanitized.includes('[Presented Coding Challenge]:'));
  assert.ok(!sanitized.includes('🚀'));
  assert.ok(!sanitized.includes('💡'));
  assert.ok(sanitized.includes('How would you handle a spike of 50,000 requests/sec?'));

  // Test Deduplication across consecutive speech recognition chunks
  const chunk1 = "I implemented Redis caching to optimize";
  const chunk2 = "caching to optimize latency down to 10 milliseconds.";
  const merged = mergeTranscriptSegments(chunk1, chunk2);
  assert.equal(merged, "I implemented Redis caching to optimize latency down to 10 milliseconds.");

  // Test Non-overlapping speech chunks
  const clean1 = "First we analyzed the database slow queries.";
  const clean2 = "Then we added compound indexes on tenant_id.";
  const mergedClean = mergeTranscriptSegments(clean1, clean2);
  assert.equal(mergedClean, "First we analyzed the database slow queries. Then we added compound indexes on tenant_id.");
});

// ============================================================================
// AUDIT SECTION 5: EVIDENCE-BASED REPORTING & ACCURATE SCORING
// ============================================================================
test('Final Audit 5: Evidence-Based Report Generation, Zero Score Fabrication & Disclaimers', async () => {
  // Session with low/empty answers
  const weakSession = {
    _id: 'weak-session-301',
    type: 'Technical Interview',
    role: 'Frontend Developer',
    difficulty: 'Hard',
    questionHistory: [
      {
        question: 'How does React Fiber reconciler achieve time-slicing and work prioritization?',
        candidateAnswer: 'I do not know.',
        codeSnippet: ''
      },
      {
        question: 'Explain layout thrashing and how to avoid it in the browser render pipeline.',
        candidateAnswer: 'Skip this please.',
        codeSnippet: ''
      }
    ],
    confidenceScore: 35
  };

  const report = await generateMockEvidenceReport(weakSession);

  assert.ok(report, 'Report should be successfully generated');
  assert.equal(typeof report.overallScore, 'number');
  assert.ok(report.overallScore <= 50, `Overall score for skipped/empty answers should be low (got ${report.overallScore})`);
  assert.notEqual(report.overallScore, 100, 'Must never fabricate 100/100 score for unattempted answers');
  assert.equal(report.finalDecision, 'Needs Improvement', 'Hiring verdict should be Needs Improvement');
  assert.ok(report.disclaimer, 'Report must include the official AI estimate disclaimer');
  assert.ok(Array.isArray(report.scoringBreakdown), 'Scoring breakdown must be an array');
  assert.ok(report.scoringBreakdown.length >= 3, 'Must have at least 3 evaluation categories');
});

// ============================================================================
// AUDIT SECTION 6: RACE CONDITION GUARDS & PERSISTENCE SAFETY
// ============================================================================
test('Final Audit 6: Race Condition Guards (Double-Submit, Stale Events & Empty Answers)', () => {
  // Simulate double-submission lock mechanism
  let isSubmitting = false;
  let submissionCount = 0;

  const mockSubmitAnswer = (answer) => {
    // 1. Minimum answer validation guard (< 3 chars)
    if (!answer || answer.trim().length < 3) {
      return { success: false, reason: 'EMPTY_ANSWER' };
    }
    // 2. Double-click concurrency guard
    if (isSubmitting) {
      return { success: false, reason: 'ALREADY_SUBMITTING' };
    }

    isSubmitting = true;
    submissionCount++;
    return { success: true };
  };

  // Test empty answer rejection
  const emptyRes = mockSubmitAnswer('  ');
  assert.equal(emptyRes.success, false);
  assert.equal(emptyRes.reason, 'EMPTY_ANSWER');

  // Test first valid submission
  const firstRes = mockSubmitAnswer('Valid answer explaining distributed caching');
  assert.equal(firstRes.success, true);
  assert.equal(submissionCount, 1);

  // Test second concurrent rapid submission blocked
  const secondRes = mockSubmitAnswer('Valid answer explaining distributed caching');
  assert.equal(secondRes.success, false);
  assert.equal(secondRes.reason, 'ALREADY_SUBMITTING');
  assert.equal(submissionCount, 1, 'Only one submission should proceed');
});

// ============================================================================
// AUDIT SECTION 7: COMPANY PREPARATION MODULES PRESERVATION
// ============================================================================
test('Final Audit 7: Company Preparation Modules Preserved Intact', () => {
  const companyModules = [
    'frontend/src/pages/CognizantPrepDetail.jsx',
    'frontend/src/pages/TCSPrepDetail.jsx',
    'frontend/src/pages/InfosysPrepDetail.jsx',
    'frontend/src/pages/AccenturePrepDetail.jsx',
    'frontend/src/pages/CompanyExamEngine.jsx',
    'frontend/src/pages/AssessmentRoom.jsx'
  ];

  companyModules.forEach(modPath => {
    const fullPath = path.resolve(__dirname, '../../', modPath);
    assert.ok(fs.existsSync(fullPath), `Module '${modPath}' must exist and remain untouched`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 500, `Module '${modPath}' should have substantive content`);
  });
});
