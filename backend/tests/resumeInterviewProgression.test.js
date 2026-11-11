const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RESUME_CATEGORIES,
  normalizeQuestionText,
  isDuplicateQuestion,
  extractStructuredResumeProfile,
  selectNextResumeQuestionFromPlan,
  buildClarificationForQuestion
} = require('../utils/resumeInterviewPlanner');
const aiService = require('../services/aiService');

const SAMPLE_RESUME_TEXT = `
Aarav Sharma
Software Engineer | Full-Stack & AI Developer
Email: aarav.sharma@example.com | Bengaluru, India

EDUCATION
B.Tech in Computer Science and Engineering — National Institute of Technology, Surathkal (2020 - 2024) | CGPA: 8.8/10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Tailwind CSS, Next.js
Backend & Databases: Node.js, Express, MongoDB, PostgreSQL, Redis
AI & Cloud: Gemini API, REST APIs, JWT Authentication, Docker, Vercel, Git

EXPERIENCE
Software Engineering Intern — CloudPulse Labs (May 2023 - July 2023)
- Built REST API endpoints in Node.js and Express reducing dashboard query latency by 35%.
- Implemented JWT authentication middleware and PostgreSQL indexing for analytics reports.

PROJECTS
1. FinPulse AI — AI-Powered Personal Finance & Portfolio Assistant
- Built with React, Node.js, MongoDB, and Gemini API to categorize expenses and generate investment summaries.
- Implemented Redis response caching and structured JSON schema validation for LLM outputs.

2. ShopEase E-Commerce Platform — Scalable Multi-Vendor Storefront
- Built using Next.js, TypeScript, PostgreSQL, and Docker with role-based checkout workflows.
- Integrated webhook idempotency and unit testing to prevent duplicate order charges.

CERTIFICATIONS
- AWS Certified Cloud Practitioner (2024)
`;

test('extractStructuredResumeProfile parses raw resumeText accurately without fabricating unlisted items', () => {
  const minimalResume = `
Priya Nair
B.E. Information Technology, Pune University (2024)
Skills: Python, Flask, SQLite, HTML, CSS
Projects:
Library Tracker — Student book lending portal built using Flask and SQLite.
  `;

  const extracted = extractStructuredResumeProfile({
    resumeText: minimalResume,
    resumeSkills: [],
    resumeProjects: [],
    resumeExperience: [],
    resumeEducation: []
  });

  assert.equal(extracted.candidateName, 'Priya Nair');
  assert.ok(extracted.skills.includes('Python'));
  assert.ok(extracted.skills.includes('Flask'));
  assert.ok(extracted.projects.some(p => /Library Tracker/i.test(p.name)));
  assert.ok(extracted.education.some(e => /Pune University|B\.E\./i.test(e)));

  // Ensure unlisted technologies/companies are NEVER invented
  assert.equal(extracted.skills.includes('Kubernetes'), false);
  assert.equal(extracted.skills.includes('GraphQL'), false);
  assert.equal(extracted.projects.some(p => /Netflix|Stripe|Amazon/i.test(p.name)), false);
  assert.equal(extracted.experience.length, 0);
});

test('extractStructuredResumeProfile enriches full sample resume when arrays are empty', () => {
  const profile = extractStructuredResumeProfile({
    resumeText: SAMPLE_RESUME_TEXT
  });

  assert.equal(profile.candidateName, 'Aarav Sharma');
  assert.ok(profile.skills.includes('React'));
  assert.ok(profile.skills.includes('Node.js'));
  assert.ok(profile.skills.includes('MongoDB'));
  assert.ok(profile.skills.includes('PostgreSQL'));
  assert.ok(profile.projects.some(p => /FinPulse AI/i.test(p.name)));
  assert.ok(profile.projects.some(p => /ShopEase/i.test(p.name)));
  assert.ok(profile.experience.length >= 1);
  assert.ok(profile.education.length >= 1);
  assert.equal(profile.flags.hasAI, true);
  assert.equal(profile.flags.hasAuth, true);
  assert.equal(profile.flags.hasDatabase, true);
  assert.equal(profile.flags.hasDeployment, true);
});

test('isDuplicateQuestion catches exact, preamble-wrapped, and semantic paraphrase duplicates', () => {
  const asked = [
    'Welcome Aarav! Could you walk me through the technical architecture behind FinPulse AI?',
    'How did you implement JWT authentication and route protection in your backend?'
  ];

  // Exact normalized duplicate with greeting stripped and different casing/punctuation
  assert.equal(
    isDuplicateQuestion('thank you! could you walk me through the technical architecture behind finpulse ai', asked),
    true
  );

  // Semantic paraphrase duplicate
  assert.equal(
    isDuplicateQuestion('Could you explain the architecture and technical design behind your FinPulse AI project?', asked),
    true
  );

  // Distinct question about a different project / topic must NOT be flagged
  assert.equal(
    isDuplicateQuestion('While building ShopEase E-Commerce Platform, what was the hardest bug you had to debug and resolve?', asked),
    false
  );
});

test('12 consecutive Resume Interview turns produce 12 distinct questions even when AI provider fails', async () => {
  const originalGenerate = aiService.ai.models.generateContent;
  // Force AI model calls to fail so fallback + planner progression is stressed across all 12 turns
  aiService.ai.models.generateContent = async () => {
    throw new Error('Simulated LLM API outage');
  };

  try {
    const profile = extractStructuredResumeProfile({ resumeText: SAMPLE_RESUME_TEXT });
    const openingQ = `Welcome Aarav Sharma! I've reviewed your resume including "FinPulse AI" and skills in React, Node.js, MongoDB. Could you introduce yourself and give me an overview of your work on "FinPulse AI"?`;

    let adaptiveState = { askedFollowupQuestions: [openingQ] };
    let conversationHistory = [{ sender: 'ai', text: openingQ }];
    let askedList = [openingQ];
    let currentQ = openingQ;
    let currentStage = 'warmup';

    const simulatedAnswers = [
      'Hi Sarah, I am Aarav Sharma, a Computer Science graduate from NIT Surathkal. In FinPulse AI, I built the React frontend, Node.js backend, and integrated the Gemini LLM with Redis caching.',
      'We used Gemini API with structured JSON schema validation so malformed model responses automatically retry or fall back safely without breaking the frontend UI.',
      'I chose MongoDB for flexible transaction tagging and Redis caching with a 15-minute TTL because portfolio queries were mostly read-heavy.',
      'My personal contribution was designing the full REST API layer, JWT auth middleware, and the expense categorization pipeline.',
      'I am not completely sure about Kubernetes horizontal pod autoscaling internals since we deployed via Vercel and Docker Compose.',
      'Skipped',
      'During FinPulse AI testing, async race conditions in Redis cache invalidation caused stale category totals until I added atomic key versioning.',
      'If traffic grew 10x, the single MongoDB cluster write throughput would bottleneck first, so I would add read replicas and queue background AI calls.',
      'At CloudPulse Labs, I built Node.js and Express reporting endpoints and added composite PostgreSQL indexes that cut latency by 35 percent.',
      'When a teammate fell behind on checkout webhook idempotency during ShopEase, I paired with them on test cases and database constraints so we shipped on time.',
      'My strongest skill is end-to-end TypeScript and Node.js backend architecture, and I am deepening distributed caching and automated load testing.',
      'Yes, I would love to know more about your engineering onboarding and architecture review process.'
    ];

    const generatedQuestions = [];
    const observedCategories = new Set();

    for (let turn = 0; turn < simulatedAnswers.length; turn++) {
      const qNum = turn + 1;
      if (qNum >= 11) currentStage = 'closing';
      else if (qNum >= 5) currentStage = 'deepdive';
      else if (qNum >= 2) currentStage = 'core';

      const res = await aiService.generateConversationalResponse({
        userAnswer: simulatedAnswers[turn],
        questionAsked: currentQ,
        conversationHistory,
        askedQuestions: askedList,
        role: 'Full Stack Developer',
        type: 'Resume Interview',
        difficulty: 'Medium',
        questionNumber: qNum,
        interviewStage: currentStage,
        adaptiveState,
        duration: '30 Minutes',
        resumeText: SAMPLE_RESUME_TEXT,
        resumeSkills: profile.skills,
        resumeProjects: profile.projects,
        resumeExperience: profile.experience,
        resumeEducation: profile.education
      });

      assert.ok(res && typeof res.nextQuestion === 'string' && res.nextQuestion.length > 15, `Turn ${qNum} must return a valid question`);
      assert.doesNotMatch(res.nextQuestion, /where do you see yourself in (?:5|five) years/i);

      if (!res.isClosing) {
        assert.equal(
          isDuplicateQuestion(res.nextQuestion, askedList),
          false,
          `Turn ${qNum} generated a duplicate question: "${res.nextQuestion}"`
        );
      }

      generatedQuestions.push(res.nextQuestion);
      if (res.questionCategory) observedCategories.add(res.questionCategory);

      adaptiveState = res.adaptiveState;
      askedList = Array.from(new Set([...askedList, res.nextQuestion]));
      conversationHistory.push(
        { sender: 'user', text: simulatedAnswers[turn] },
        { sender: 'ai', text: res.nextQuestion }
      );
      currentQ = res.nextQuestion;
    }

    // Verify at least 10 consecutive unique normalized questions and broad category coverage
    const normalizedSet = new Set(generatedQuestions.map(normalizeQuestionText));
    assert.equal(normalizedSet.size, generatedQuestions.length, 'Every generated turn question must have a unique normalized form');
    assert.ok(generatedQuestions.length >= 12, 'Must complete 12 consecutive turns');
    assert.ok(observedCategories.size >= 6, `Expected >= 6 distinct categories, got ${Array.from(observedCategories).join(', ')}`);
    assert.ok(
      askedList.some(q => /FinPulse|ShopEase|CloudPulse|NIT Surathkal|React|Node\.js|MongoDB|PostgreSQL/i.test(q)),
      'Questions must reference concrete entities from the resume'
    );
  } finally {
    aiService.ai.models.generateContent = originalGenerate;
  }
});

test('Server-side anti-repetition overrides LLM if LLM returns a repeated question or drops askedFollowupQuestions', async () => {
  const originalGenerate = aiService.ai.models.generateContent;
  const alreadyAsked = [
    'Could you tell me about yourself and give me an overview of FinPulse AI?',
    'What was the architecture of FinPulse AI and why did you choose MongoDB?'
  ];

  const duplicateLlmQuestion = 'Could you explain the architecture of FinPulse AI and why you picked MongoDB?';

  // Mock LLM deliberately returning a duplicate question and wiping adaptiveState.askedFollowupQuestions
  aiService.ai.models.generateContent = async () => ({
    text: JSON.stringify({
      acknowledgement: 'Thanks for explaining that.',
      transition: 'Moving forward,',
      nextQuestion: duplicateLlmQuestion,
      questionCategory: 'Project Architecture',
      isFollowUp: true,
      isClosing: false,
      evaluation: {
        score: 7.5, relevance: 8, technicalCorrectness: 8, clarity: 7,
        evidence: 8, problemSolving: 7, communication: 8, feedback: 'Solid explanation.',
        metrics: { technicalKnowledge: 8, problemSolving: 7, communication: 8, confidence: 8, accuracy: 8, logicalThinking: 7 }
      },
      adaptiveState: {
        knowledgeScore: 78,
        confidenceScore: 80,
        communicationScore: 82,
        technicalScore: 79,
        domainScore: 77,
        overallScore: 79,
        difficultyLevel: 'Medium',
        askedFollowupQuestions: []
      }
    })
  });

  try {
    const profile = extractStructuredResumeProfile({ resumeText: SAMPLE_RESUME_TEXT });
    const res = await aiService.generateConversationalResponse({
      userAnswer: 'I built FinPulse AI with React and Node.js and used MongoDB.',
      questionAsked: alreadyAsked[1],
      conversationHistory: alreadyAsked.map(q => ({ sender: 'ai', text: q })),
      askedQuestions: [...alreadyAsked],
      role: 'Software Engineer',
      type: 'Resume Interview',
      difficulty: 'Medium',
      questionNumber: 3,
      interviewStage: 'core',
      adaptiveState: {
        askedFollowupQuestions: [...alreadyAsked],
        resumePlan: {
          coveredCategories: ['overview_intro', 'project_architecture'],
          coveredProjects: ['FinPulse AI'],
          coveredSkills: ['MongoDB'],
          consecutiveFollowUpsCount: 1
        }
      },
      duration: '30 Minutes',
      resumeText: SAMPLE_RESUME_TEXT,
      resumeSkills: profile.skills,
      resumeProjects: profile.projects,
      resumeExperience: profile.experience,
      resumeEducation: profile.education
    });

    // Duplicate LLM question MUST have been replaced
    assert.notEqual(normalizeQuestionText(res.nextQuestion), normalizeQuestionText(duplicateLlmQuestion), 'Duplicate LLM output must be replaced');
    assert.equal(isDuplicateQuestion(res.nextQuestion, alreadyAsked), false, 'Duplicate LLM output must be rejected');
    assert.equal(res.isFollowUp, false, 'Consecutive follow-up cap must pivot to a new main question');
    // Monotonic preservation of askedFollowupQuestions
    assert.ok(res.adaptiveState.askedFollowupQuestions.length >= 3, 'Prior asked questions must not be dropped');
    assert.ok(res.adaptiveState.askedFollowupQuestions.includes(res.nextQuestion));
  } finally {
    aiService.ai.models.generateContent = originalGenerate;
  }
});

test('selectNextResumeQuestionFromPlan enforces max follow-up cap and pivots on "I don\'t know"', () => {
  const profile = extractStructuredResumeProfile({ resumeText: SAMPLE_RESUME_TEXT });

  const pivotResult = selectNextResumeQuestionFromPlan({
    profile,
    role: 'Backend Developer',
    userAnswer: "I don't know much about sharding internals with Redis.",
    questionAsked: 'How does Redis caching work in FinPulse AI?',
    allAskedQuestions: [
      'How does Redis caching work in FinPulse AI?'
    ],
    adaptiveState: {
      resumePlan: {
        coveredCategories: ['overview_intro', 'ai_auth_security_deploy'],
        consecutiveFollowUpsCount: 0
      }
    },
    isDontKnow: true
  });

  assert.equal(pivotResult.isFollowUp, false);
  assert.notEqual(pivotResult.categoryId, 'ai_auth_security_deploy');
  assert.equal(pivotResult.resumePlan.consecutiveFollowUpsCount, 0);
});

test('buildClarificationForQuestion explains the current question cleanly across resume topics', () => {
  const archClarify = buildClarificationForQuestion({
    currentQuestion: 'Walk me through the architecture of FinPulse AI and how modules interact.'
  });
  const debugClarify = buildClarificationForQuestion({
    currentQuestion: 'What was the toughest bug or debugging issue you solved?'
  });
  const introClarify = buildClarificationForQuestion({
    currentQuestion: 'Could you briefly introduce yourself and summarize your resume?'
  });

  assert.match(archClarify, /clarify/i);
  assert.match(archClarify, /frontend|backend|data flows/i);
  assert.match(debugClarify, /root cause|fix/i);
  assert.match(introClarify, /60-to-90|background|project/i);
  assert.ok(RESUME_CATEGORIES.length === 12);
});

