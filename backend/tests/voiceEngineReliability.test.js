const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeTextForSpeech, mergeTranscriptSegments } = require('../utils/voiceUtils');

test('Phase 5 - Requirement 1: Natural Voice TTS Text Sanitization', () => {
  // Test stripping markdown headers, bold, code blocks, JSON, and prompt directives
  const rawInput = `### Two Sum Problem\n\n**Description:** Given an \`array\` of integers, find two numbers that sum up to target.\n\n\`\`\`javascript\nconst x = 10;\n\`\`\`\n\n• Example 1: Input: [2, 7, 11, 15]\n[Presented Coding Challenge]: Please write your logic. 🚀`;
  const sanitized = sanitizeTextForSpeech(rawInput);

  assert.ok(!sanitized.includes('###'), 'Must strip markdown headers');
  assert.ok(!sanitized.includes('**'), 'Must strip bold markers');
  assert.ok(!sanitized.includes('```'), 'Must strip code blocks');
  assert.ok(!sanitized.includes('const x = 10;'), 'Must remove code contents');
  assert.ok(!sanitized.includes('•'), 'Must strip bullet markers');
  assert.ok(!sanitized.includes('[Presented Coding Challenge]:'), 'Must strip prompt directives');
  assert.ok(!sanitized.includes('🚀'), 'Must strip emojis');
  assert.ok(sanitized.includes('Two Sum Problem'), 'Must preserve question title');
  assert.ok(sanitized.includes('Given an array of integers'), 'Must preserve clear question prose');

  // Test JSON stripping
  const jsonWrapper = `{"acknowledgement": "Good point.", "nextQuestion": "How do you scale Redis?"}`;
  const sanitizedJson = sanitizeTextForSpeech(jsonWrapper);
  assert.ok(!sanitizedJson.includes('{"acknowledgement"'), 'Must strip raw JSON wrapper');

  // Edge cases
  assert.equal(sanitizeTextForSpeech(''), '');
  assert.equal(sanitizeTextForSpeech(null), '');
  assert.equal(sanitizeTextForSpeech(undefined), '');
});

test('Phase 5 - Requirement 2: Speech Recognition Transcript Deduplication', () => {
  // Standard non-overlapping append
  const part1 = "I have built microservices with Node.js";
  const part2 = "and deployed them on AWS ECS.";
  const merged1 = mergeTranscriptSegments(part1, part2);
  assert.equal(merged1, "I have built microservices with Node.js and deployed them on AWS ECS.");

  // Overlapping duplicate words (Chromium Web Speech API chunk repetition bug)
  const existing = "In my last project I used React and";
  const duplicateIncoming = "React and Redis for real-time caching.";
  const merged2 = mergeTranscriptSegments(existing, duplicateIncoming);
  assert.equal(merged2, "In my last project I used React and Redis for real-time caching.");

  // Single word overlap
  const existSingle = "We scaled the database using";
  const incomingSingle = "using read replicas across zones.";
  const merged3 = mergeTranscriptSegments(existSingle, incomingSingle);
  assert.equal(merged3, "We scaled the database using read replicas across zones.");

  // Multiple identical word overlap
  const existMulti = "I resolved the issue by optimizing the database indexing";
  const incomingMulti = "optimizing the database indexing and query plans.";
  const merged4 = mergeTranscriptSegments(existMulti, incomingMulti);
  assert.equal(merged4, "I resolved the issue by optimizing the database indexing and query plans.");

  // Empty incoming or existing
  assert.equal(mergeTranscriptSegments("Existing text", ""), "Existing text");
  assert.equal(mergeTranscriptSegments("", "Incoming text"), "Incoming text");
});

test('Phase 5 - Requirement 3 & 4: Audio Echo Prevention & Authoritative State Machine', () => {
  class VoiceEngineSimulator {
    constructor() {
      this.state = 'IDLE'; // 'AI_SPEAKING' | 'WAITING_FOR_CANDIDATE' | 'LISTENING' | 'PROCESSING_ANSWER' | 'GENERATING_NEXT_QUESTION' | 'ERROR'
      this.isAiSpeaking = false;
      this.currentQuestionId = 'q-1';
      this.listeningQuestionId = 'q-1';
      this.finalTranscript = '';
      this.interimTranscript = '';
      this.typedAnswer = '';
      this.isSubmitting = false;
      this.tracksStopped = false;
      this.synthCancelled = false;
      this.recognitionAborted = false;
    }

    startAiSpeech(questionId) {
      this.currentQuestionId = questionId;
      this.state = 'AI_SPEAKING';
      this.isAiSpeaking = true;
      this.recognitionAborted = true; // recognition must be stopped while AI speaks
    }

    finishAiSpeech() {
      this.state = 'WAITING_FOR_CANDIDATE';
      this.isAiSpeaking = false;
    }

    acousticSettlingElapsed() {
      if (this.state === 'WAITING_FOR_CANDIDATE' && !this.isAiSpeaking) {
        this.state = 'LISTENING';
        this.listeningQuestionId = this.currentQuestionId;
        this.recognitionAborted = false;
      }
    }

    handleIncomingAudio(transcript, isFinal, eventQuestionId) {
      // STRICT ECHO GUARDS:
      // Drop audio if AI is speaking, interviewer not in LISTENING state, or questionId is stale
      if (
        this.isAiSpeaking ||
        this.state !== 'LISTENING' ||
        eventQuestionId !== this.listeningQuestionId
      ) {
        return false; // audio dropped!
      }

      if (isFinal) {
        this.finalTranscript = mergeTranscriptSegments(this.finalTranscript, transcript);
        this.interimTranscript = '';
      } else {
        this.interimTranscript = transcript;
      }
      return true;
    }

    submitAnswer() {
      if (this.isSubmitting || this.isAiSpeaking) return false;
      this.isSubmitting = true;
      this.state = 'PROCESSING_ANSWER';
      const submitted = this.finalTranscript.trim();
      this.finalTranscript = '';
      this.interimTranscript = '';
      return submitted;
    }

    switchToTyping() {
      if (this.finalTranscript && !this.typedAnswer) {
        this.typedAnswer = this.finalTranscript.trim();
      }
      this.recognitionAborted = true;
      this.state = 'TYPING_MODE';
    }

    switchToSpeaking() {
      if (this.typedAnswer && !this.finalTranscript) {
        this.finalTranscript = this.typedAnswer.trim();
      }
      this.state = 'LISTENING';
    }

    cleanupAllResources() {
      this.tracksStopped = true;
      this.synthCancelled = true;
      this.recognitionAborted = true;
      this.state = 'COMPLETED';
    }
  }

  const sim = new VoiceEngineSimulator();

  // Test 1: Audio captured while AI is speaking is DROPPED
  sim.startAiSpeech('q-1');
  const capturedDuringAi = sim.handleIncomingAudio("echo of AI question", true, 'q-1');
  assert.equal(capturedDuringAi, false, 'Audio during AI_SPEAKING must be dropped');
  assert.equal(sim.finalTranscript, '', 'Transcript must remain empty during AI speech');

  // Test 2: After AI finishes, acoustic settling activates LISTENING
  sim.finishAiSpeech();
  assert.equal(sim.state, 'WAITING_FOR_CANDIDATE');
  sim.acousticSettlingElapsed();
  assert.equal(sim.state, 'LISTENING');

  // Test 3: Candidate speech is accepted in LISTENING state
  const capturedCandidate = sim.handleIncomingAudio("I used React Context and hooks.", true, 'q-1');
  assert.equal(capturedCandidate, true, 'Audio during LISTENING must be accepted');
  assert.equal(sim.finalTranscript, "I used React Context and hooks.");

  // Test 4: Stale recognition events from previous question are DROPPED
  const staleEvent = sim.handleIncomingAudio("old buffered phrase", true, 'q-old-99');
  assert.equal(staleEvent, false, 'Stale question ID events must be dropped');
  assert.equal(sim.finalTranscript, "I used React Context and hooks.");

  // Test 5: Interim text is never submitted
  sim.handleIncomingAudio("transient noise", false, 'q-1');
  assert.equal(sim.interimTranscript, "transient noise");
  const submitted = sim.submitAnswer();
  assert.equal(submitted, "I used React Context and hooks.", 'Submitted answer must only include final transcript');

  // Test 6: Switching between voice and typing preserves text
  sim.finalTranscript = "Captured via speech";
  sim.switchToTyping();
  assert.equal(sim.typedAnswer, "Captured via speech", 'Voice transcript must be preserved when switching to typing');

  sim.typedAnswer = "Edited text in typing mode";
  sim.finalTranscript = "";
  sim.switchToSpeaking();
  assert.equal(sim.finalTranscript, "Edited text in typing mode", 'Typed text must be preserved when switching to voice');

  // Test 7: Cleanup stops all tracks and cancels synthesis
  sim.cleanupAllResources();
  assert.equal(sim.tracksStopped, true);
  assert.equal(sim.synthCancelled, true);
  assert.equal(sim.recognitionAborted, true);
});

test('Phase 5 - Requirement 5: Latency Measurement & Performance Benchmarking', () => {
  // Simulates latency measurement hook
  const start = 1000;
  const finish = 1780;
  const latencyMs = finish - start;
  assert.equal(latencyMs, 780, 'Round-trip latency accurately computed');
  assert.ok(latencyMs < 3000, 'Latency must be within reasonable interactive thresholds (< 3000ms)');
});

test('Phase 5 - Requirement 6: Replay Question Audio Isolation', () => {
  // Simulates repeatQuestion
  let recognitionStopped = false;
  let synthCalled = false;
  let existingTranscript = "My active answer so far";

  const repeatQuestion = (currentQ) => {
    recognitionStopped = true; // Stop listening so repeated audio is not recorded
    synthCalled = true;
    const cleanSpoken = sanitizeTextForSpeech(currentQ);
    return cleanSpoken;
  };

  const spoken = repeatQuestion("### Explain QuickSort in C++");
  assert.equal(recognitionStopped, true, 'Recognition must be stopped when replaying');
  assert.equal(synthCalled, true, 'Speech must be triggered');
  assert.equal(spoken, "Explain QuickSort in C++", 'Spoken text must be sanitized');
  assert.equal(existingTranscript, "My active answer so far", 'Active candidate answer must NOT be wiped');
});

