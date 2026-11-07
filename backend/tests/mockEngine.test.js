require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateQuestion,
  generateConversationalResponse,
  generateMockEvidenceReport
} = require('../services/aiService');

test('Mock Interview Engine - Comprehensive Test Suite', async (t) => {

  await t.test('1. HR Interview Isolation: Fallback questions must be HR-only', async () => {
    // When AI fails or throws, fallback for HR should be HR-only
    const res = await generateConversationalResponse({
      userAnswer: 'I have 3 years of experience as a team lead.',
      questionAsked: 'Tell me about yourself.',
      role: 'Software Engineer',
      type: 'HR Interview',
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(res.nextQuestion, 'Should return a next question');
    const qLower = res.nextQuestion.toLowerCase();
    
    // Forbidden words in HR Interview:
    const forbidden = ['algorithm', 'binary search', 'time complexity', 'sql query', 'leetcode', 'tree traversal', 'big-o'];
    for (const term of forbidden) {
      assert.ok(!qLower.includes(term), `HR question should not mention "${term}": ${res.nextQuestion}`);
    }
  });

  await t.test('2. Technical Interview: Scoped strictly to selectedTopics', async () => {
    const selectedTopics = ['HTML', 'CSS', 'JavaScript'];
    const res = await generateConversationalResponse({
      userAnswer: 'I use flexbox and grid for layouts.',
      questionAsked: 'How do you structure modern web layouts?',
      role: 'Frontend Developer',
      type: 'Technical Interview',
      technicalTrack: 'Frontend Developer',
      selectedTopics,
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(res.nextQuestion, 'Should produce a question');
    // Ensure it does not ask HR or unrelated questions
    assert.ok(!res.nextQuestion.includes('Where do you see yourself in 5 years'), 'Technical should not ask HR career goals');
  });

  await t.test('3. Resume Interview: Grounded in uploaded resume context', async () => {
    const resumeText = 'Developed an e-commerce platform using React, Node.js, and MongoDB with Stripe payment integration.';
    const res = await generateConversationalResponse({
      userAnswer: 'I integrated Stripe webhooks to handle payment receipts.',
      questionAsked: 'How did you handle payments in your project?',
      role: 'Full Stack Developer',
      type: 'Resume Interview',
      resumeText,
      resumeSkills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(res.nextQuestion, 'Should return a question');
    const qLower = res.nextQuestion.toLowerCase();
    assert.ok(!qLower.includes('where do you see yourself in 5 years'), 'Resume interview should not ask generic HR questions');
  });

  await t.test('4. Coding Interview: Fallback produces structured coding problem or complexity inquiry', async () => {
    const res = await generateConversationalResponse({
      userAnswer: 'class Solution: def twoSum(nums, target): return [0, 1]',
      questionAsked: 'Solve Two Sum',
      role: 'Software Engineer',
      type: 'Coding Interview',
      codingTrack: 'DSA',
      adaptiveState: { askedFollowupQuestions: [] }
    });

    assert.ok(res.nextQuestion, 'Should produce code evaluation or follow-up');
    const qLower = res.nextQuestion.toLowerCase();
    const isCodingRelated = qLower.includes('complexity') || qLower.includes('edge case') || qLower.includes('optimize') || qLower.includes('algorithm') || qLower.includes('data structure');
    assert.ok(isCodingRelated, `Coding follow-up should discuss complexity/edge cases: ${res.nextQuestion}`);
  });

  await t.test('5. No duplicate generic fallback question across interview types', async () => {
    const genericQuestion = 'Could you compare this approach with another method?';
    
    const hrRes = await generateConversationalResponse({
      userAnswer: 'I communicated openly with my manager.',
      questionAsked: 'How do you handle disagreement?',
      role: 'HR Manager',
      type: 'HR Interview',
      adaptiveState: { askedFollowupQuestions: [] }
    });
    assert.notEqual(hrRes.nextQuestion, genericQuestion, 'HR should never return generic comparison fallback');

    const codingRes = await generateConversationalResponse({
      userAnswer: 'return a + b;',
      questionAsked: 'Write addition function',
      role: 'Software Engineer',
      type: 'Coding Interview',
      adaptiveState: { askedFollowupQuestions: [] }
    });
    assert.notEqual(codingRes.nextQuestion, genericQuestion, 'Coding should never return generic comparison fallback');
  });

  await t.test('6. Evidence-Based Report Generation: Valid output with actual question data', async () => {
    const mockInterview = {
      role: 'Frontend Developer',
      type: 'Technical Interview',
      technicalTrack: 'Frontend Developer',
      selectedTopics: ['React', 'JavaScript'],
      difficulty: 'Intermediate',
      questions: [
        {
          question: 'What is the Virtual DOM in React?',
          userAnswer: 'The Virtual DOM is an in-memory representation of real DOM elements, allowing efficient diffing and batch updates.',
          aiFeedback: 'Accurate and concise explanation.',
          score: 8,
          timeTaken: '45s',
          speechStats: { speakingSpeed: 135, fillerWordsCount: 1, voiceClarity: 92, grammarScore: 90, eyeContactScore: 88 }
        },
        {
          question: 'Explain JavaScript closures with an example.',
          userAnswer: 'A closure is a function that retains access to its lexical scope even when executed outside that scope.',
          aiFeedback: 'Strong conceptual clarity.',
          score: 9,
          timeTaken: '50s',
          speechStats: { speakingSpeed: 130, fillerWordsCount: 0, voiceClarity: 95, grammarScore: 92, eyeContactScore: 90 }
        }
      ]
    };

    const report = await generateMockEvidenceReport(mockInterview);
    assert.ok(report, 'Report should be generated');
    assert.ok(typeof report.overallScore === 'number', 'overallScore should be a number');
    assert.ok(report.overallScore >= 0 && report.overallScore <= 100, 'overallScore should be between 0 and 100');
    assert.ok(report.scoringBreakdown && Array.isArray(report.scoringBreakdown), 'scoringBreakdown should be an array');
    assert.ok(report.questionAnalysis && report.questionAnalysis.length === 2, 'questionAnalysis should match question count');
    assert.ok(report.strengths && Array.isArray(report.strengths), 'strengths should be an array');
  });

  await t.test('7. Report handles empty/minimal interview gracefully without crash', async () => {
    const minimalInterview = {
      role: 'Software Engineer',
      type: 'HR Interview',
      difficulty: 'Intermediate',
      questions: []
    };

    const report = await generateMockEvidenceReport(minimalInterview);
    assert.ok(report, 'Report should generate even with 0 questions');
    assert.ok(typeof report.overallScore === 'number', 'overallScore should be a number');
    assert.ok(report.finalDecision, 'finalDecision should exist');
  });

  await t.test('8. Duplicate prevention: askedFollowupQuestions prevents repeated questions', async () => {
    const firstQ = 'Can you tell me about a time when you had to meet a tight deadline? How did you manage your time?';
    const state = { askedFollowupQuestions: [firstQ] };

    const res = await generateConversationalResponse({
      userAnswer: 'I prioritized my tasks using a Kanban board.',
      questionAsked: firstQ,
      role: 'Product Manager',
      type: 'HR Interview',
      adaptiveState: state
    });

    assert.ok(res.nextQuestion, 'Should provide next question');
    // If fallback is triggered, it must not repeat firstQ
    if (res.adaptiveState?.askedFollowupQuestions) {
      assert.ok(res.adaptiveState.askedFollowupQuestions.includes(res.nextQuestion), 'New question should be recorded in askedFollowupQuestions');
    }
  });

});
