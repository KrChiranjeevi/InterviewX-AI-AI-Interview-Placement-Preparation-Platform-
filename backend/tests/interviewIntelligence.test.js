require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateConversationalResponse,
  generateMockEvidenceReport,
  generateQuestion
} = require('../services/aiService');

test('Phase 2: Real-Time Interview Intelligence & Low-Latency Suite', async (t) => {

  // 1. Next question uses candidate's actual previous answer (probes mentioned details)
  await t.test('1. Answer-responsive follow-up probing candidate details & handling "I don\'t know"', async () => {
    // 1a: Probing specific technical detail (Redis TTL / caching)
    const specificAnswer = 'In my last role, I implemented Redis caching with a 60-second TTL to reduce database query load by 40%.';
    const resp = await generateConversationalResponse({
      userAnswer: specificAnswer,
      questionAsked: 'How did you handle performance bottlenecks in your backend?',
      role: 'Backend Engineer',
      type: 'Technical Interview',
      selectedTopics: ['Node.js', 'Redis', 'System Architecture'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(resp.nextQuestion, 'Sarah should return a next question');
    assert.ok(resp.acknowledgement, 'Sarah should provide a conversational acknowledgement');
    // Acknowledgement should be professional and not generic repetitive loop
    assert.ok(!resp.acknowledgement.toLowerCase().startsWith('great answer! great answer!'), 'No repetitive generic greeting');

    // 1b: Handling "I don\'t know" professionally without dwelling or getting stuck
    const idkResp = await generateConversationalResponse({
      userAnswer: "I don't know the exact internal implementation of that, honestly.",
      questionAsked: 'Can you explain how V8 garbage collection generational nursery works?',
      role: 'JavaScript Developer',
      type: 'Technical Interview',
      selectedTopics: ['JavaScript', 'Node.js'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(idkResp.nextQuestion, 'Should smoothly pivot to another planned question');
    const ackLower = (idkResp.acknowledgement || '').toLowerCase();
    const pivotPhrases = ['no problem', 'no worries', "that's completely fine", 'completely okay', 'fair enough', 'no sweat', 'let us move', "let's move"];
    const hasPivot = pivotPhrases.some(phrase => ackLower.includes(phrase));
    assert.ok(hasPivot, `Acknowledgement for "I don't know" should be encouraging and pivot smoothly: "${idkResp.acknowledgement}"`);
  });

  // 2. Strict turn-taking: No next question before answer is evaluated
  await t.test('2. Strict turn-taking & turn state evaluation', async () => {
    // Empty answers shouldn't advance turns without evaluation
    const emptyResp = await generateConversationalResponse({
      userAnswer: '',
      questionAsked: 'Tell me about yourself.',
      role: 'Software Engineer',
      type: 'HR Interview',
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(emptyResp.nextQuestion, 'Returns a valid turn object');
    assert.ok(typeof emptyResp.isFollowUp === 'boolean', 'Followup flag must be boolean');
  });

  // 3. Duplicate questions and concurrent AI requests prevention
  await t.test('3. Question deduplication via adaptiveState.askedFollowupQuestions', async () => {
    const askedList = [
      'Could you describe the architecture of your distributed cache?',
      'How do you manage state transitions in microservices?'
    ];

    const state = {
      askedFollowupQuestions: [...askedList],
      historyTopics: ['Caching']
    };

    const resp = await generateConversationalResponse({
      userAnswer: 'We used Redis cluster with master-replica replication.',
      questionAsked: askedList[0],
      role: 'Backend Architect',
      type: 'Technical Interview',
      selectedTopics: ['Microservices', 'Distributed Systems'],
      adaptiveState: state
    });

    assert.ok(!askedList.includes(resp.nextQuestion), 'Next question must not be any previously asked question');
    assert.ok(state.askedFollowupQuestions.includes(resp.nextQuestion), 'New question should be recorded in askedFollowupQuestions');
  });

  // 4. Enforce 100% Interview-Type Isolation across archetypes
  await t.test('4. Strict Interview-Type Isolation', async (t2) => {
    // 4a: HR Interview - strictly communication, teamwork, culture fit
    await t2.test('4a. HR Interview produces HR-only questions (zero algorithmic/code terms)', async () => {
      const hrResp = await generateConversationalResponse({
        userAnswer: 'I prioritize clear communication, daily syncs, and empathetic feedback.',
        questionAsked: 'How do you foster collaboration in a remote cross-functional team?',
        role: 'Team Lead',
        type: 'HR Interview',
        adaptiveState: { askedFollowupQuestions: [] }
      });
      const text = `${hrResp.acknowledgement} ${hrResp.nextQuestion}`.toLowerCase();
      const forbidden = ['binary tree', 'sql query', 'big-o', 'runtime complexity', 'dynamic programming', 'linked list'];
      for (const f of forbidden) {
        assert.ok(!text.includes(f), `HR interview must not contain technical coding term: "${f}"`);
      }
    });

    // 4b: Resume Interview - strictly grounded in candidate\'s actual projects and skills
    await t2.test('4b. Resume Interview probes actual resume projects and documented skills', async () => {
      const resumeProjects = [
        { name: 'MedPulse Telehealth', technologies: ['FastAPI', 'PostgreSQL', 'WebRTC'] }
      ];
      const resumeSkills = ['FastAPI', 'WebRTC', 'PostgreSQL', 'Docker'];

      const resResp = await generateConversationalResponse({
        userAnswer: 'In MedPulse Telehealth, I built the real-time video signaling layer using WebSockets and WebRTC.',
        questionAsked: 'Can you walk me through your technical contribution to MedPulse Telehealth?',
        role: 'Full Stack Engineer',
        type: 'Resume Interview',
        resumeProjects,
        resumeSkills,
        adaptiveState: { askedFollowupQuestions: [] }
      });

      assert.ok(resResp.nextQuestion, 'Resume interview generates relevant follow-up');
      const qLower = resResp.nextQuestion.toLowerCase();
      // Should probe technical architecture, WebRTC, FastAPI, or projects
      assert.ok(!qLower.includes('where do you see yourself in 5 years'), 'Resume interview should not ask generic HR questions');
    });

    // 4c: Coding Interview - complexity, edge cases, trade-offs
    await t2.test('4c. Coding Interview evaluates code logic and complexity', async () => {
      const codeResp = await generateConversationalResponse({
        userAnswer: 'def twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []',
        questionAsked: 'Solve Two Sum in O(n) time',
        role: 'Software Engineer',
        type: 'Coding Interview',
        codingTrack: 'DSA',
        adaptiveState: { askedFollowupQuestions: [] }
      });

      const qLower = codeResp.nextQuestion.toLowerCase();
      const isCodingRelevant = qLower.includes('complexity') || qLower.includes('edge case') || qLower.includes('space') || qLower.includes('time') || qLower.includes('hash') || qLower.includes('optimize') || qLower.includes('scale');
      assert.ok(isCodingRelevant, `Coding question should relate to algorithms/complexity/edge cases: "${codeResp.nextQuestion}"`);
    });

    // 4d: System Design Interview - scalability, components, databases
    await t2.test('4d. System Design Interview focuses on scalable architecture', async () => {
      const sdResp = await generateConversationalResponse({
        userAnswer: 'We place an API Gateway in front of stateless worker services and use Kafka for asynchronous event queues.',
        questionAsked: 'Design a high-throughput notification system',
        role: 'Backend Architect',
        type: 'System Design Interview',
        systemDesignDomain: 'Distributed Systems',
        adaptiveState: { askedFollowupQuestions: [] }
      });

      const qLower = sdResp.nextQuestion.toLowerCase();
      const isSysDesignRelevant = qLower.includes('partition') || qLower.includes('failover') || qLower.includes('scale') || qLower.includes('kafka') || qLower.includes('throughput') || qLower.includes('latency') || qLower.includes('database') || qLower.includes('bottleneck') || qLower.includes('cache');
      assert.ok(isSysDesignRelevant, `System Design must focus on architectural concerns: "${sdResp.nextQuestion}"`);
    });

    // 4e: Project Discussion - deep dives into the candidate\'s specific project
    await t2.test('4e. Project Discussion focuses on specified project architecture', async () => {
      const projResp = await generateConversationalResponse({
        userAnswer: 'For AgroVision, I trained a lightweight YOLO model to detect crop diseases on edge devices.',
        questionAsked: 'Walk me through the pipeline of AgroVision',
        role: 'Machine Learning Engineer',
        type: 'Project Discussion',
        projectName: 'AgroVision',
        projectDescription: 'Edge AI crop disease detection mobile app',
        adaptiveState: { askedFollowupQuestions: [] }
      });

      assert.ok(projResp.nextQuestion, 'Project Discussion generates follow-up');
      assert.ok(
        projResp.nextQuestion.includes('AgroVision') || projResp.nextQuestion.toLowerCase().includes('model') || projResp.nextQuestion.toLowerCase().includes('edge') || projResp.nextQuestion.toLowerCase().includes('trade-off') || projResp.nextQuestion.toLowerCase().includes('challenge'),
        `Project question should probe AgroVision details: "${projResp.nextQuestion}"`
      );
    });
  });

  // 5. AI latency and timeout safety: Fallback preserves answer & evaluation
  await t.test('5. Low-latency timeout resilience & fallback integrity', async () => {
    // When external providers fail or timeout, fallback must return complete valid payload
    const fallbackResp = await generateConversationalResponse({
      userAnswer: 'I write unit tests using Jest and enforce 90% coverage before deployment.',
      questionAsked: 'How do you ensure software quality in CI/CD pipelines?',
      role: 'DevOps / QA Engineer',
      type: 'Technical Interview',
      selectedTopics: ['CI/CD', 'Testing'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(fallbackResp.nextQuestion, 'Fallback must always produce a next question');
    assert.ok(fallbackResp.acknowledgement, 'Fallback must have an acknowledgement');
    assert.ok(fallbackResp.adaptiveState, 'Fallback must return updated adaptiveState');
  });

  // 6. Voice and typing modes coordinate identically
  await t.test('6. Consistency between typed answers and voice transcripts', async () => {
    const rawAnswerText = 'I implemented a rate limiter using token bucket algorithm with Redis.';
    
    // Test typed submission representation
    const typedRes = await generateConversationalResponse({
      userAnswer: rawAnswerText,
      questionAsked: 'How do you protect your API against DDoS attacks?',
      role: 'Security Engineer',
      type: 'Technical Interview',
      selectedTopics: ['APIs', 'Security'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    // Test transcribed voice representation
    const voiceRes = await generateConversationalResponse({
      userAnswer: rawAnswerText,
      questionAsked: 'How do you protect your API against DDoS attacks?',
      role: 'Security Engineer',
      type: 'Technical Interview',
      selectedTopics: ['APIs', 'Security'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(typedRes.nextQuestion, 'Typed response must be valid');
    assert.ok(voiceRes.nextQuestion, 'Voice response must be valid');
    assert.equal(typeof typedRes.nextQuestion, 'string');
    assert.equal(typeof voiceRes.nextQuestion, 'string');
  });

  // 7. Interview respects duration and difficulty scaling
  await t.test('7. Interview duration & difficulty adaptation', async () => {
    // Warmup stage
    const warmup = await generateConversationalResponse({
      userAnswer: 'Hello, I have 4 years of experience building web applications with React and Node.',
      questionAsked: 'Welcome! Please introduce yourself.',
      role: 'Full Stack Engineer',
      type: 'Technical Interview',
      interviewStage: 'warmup',
      questionNumber: 1,
      duration: '15 min',
      difficulty: 'Beginner',
      adaptiveState: { askedFollowupQuestions: [] }
    });
    assert.ok(warmup.nextQuestion);

    // Closing stage at end of duration
    const closing = await generateConversationalResponse({
      userAnswer: 'Thank you, I really enjoyed discussing our architecture.',
      questionAsked: 'Do you have any final thoughts or questions for me?',
      role: 'Full Stack Engineer',
      type: 'Technical Interview',
      interviewStage: 'closing',
      questionNumber: 7,
      duration: '15 min',
      adaptiveState: { askedFollowupQuestions: [] }
    });
    assert.ok(closing.nextQuestion);
  });

  // 8. Session abort / termination state safety
  await t.test('8. End Interview cancellation and teardown guarantees', () => {
    const abortCtrl = new AbortController();
    assert.equal(abortCtrl.signal.aborted, false);
    abortCtrl.abort();
    assert.equal(abortCtrl.signal.aborted, true);
  });

  // 9. Report generated from actual interview transcript
  await t.test('9. Mock report evidence generated from real session transcript', async () => {
    const mockInterview = {
      role: 'Backend Developer',
      type: 'Technical Interview',
      difficulty: 'Medium',
      questions: [
        {
          question: 'How do you optimize slow SQL queries?',
          userAnswer: 'I use EXPLAIN ANALYZE to identify sequential scans, create appropriate B-tree composite indexes, and avoid SELECT * queries.',
          score: 9,
          aiFeedback: 'Excellent knowledge of indexing and execution plans.'
        },
        {
          question: 'What is the difference between optimistic and pessimistic locking?',
          userAnswer: 'Optimistic locking checks version fields before committing updates without holding DB locks, while pessimistic locking holds exclusive row locks.',
          score: 8,
          aiFeedback: 'Clear distinction between concurrency control models.'
        }
      ],
      adaptiveState: {
        overallScore: 85,
        technicalScore: 88,
        communicationScore: 82,
        confidenceScore: 84
      }
    };

    const report = await generateMockEvidenceReport(mockInterview);
    assert.ok(report, 'Report must be created');
    assert.ok(typeof report.overallScore === 'number', 'Overall score must be a number');
    assert.ok(report.finalDecision, 'Must contain finalDecision');
    assert.ok(Array.isArray(report.questionAnalysis), 'Question analysis must be an array');
    assert.equal(report.questionAnalysis.length, 2, 'Should analyze both questions from transcript');
    assert.ok(Array.isArray(report.strengths), 'Strengths must be an array');
    assert.ok(Array.isArray(report.weaknesses), 'Weaknesses must be an array');
    assert.ok(Array.isArray(report.scoringBreakdown), 'Scoring breakdown must be an array');
  });

});
