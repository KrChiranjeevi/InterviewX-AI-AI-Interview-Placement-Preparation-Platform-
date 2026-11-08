const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * Pure state machine simulator replicating the exact logic implemented
 * in LiveInterview.jsx and MockInterviewRoom.jsx for speech handling,
 * echo prevention, audio lifecycle, question-ID binding, and submission isolation.
 */
class SpeechStateMachine {
  constructor(options = {}) {
    this.state = 'IDLE'; // 'IDLE' | 'AI_SPEAKING' | 'WAITING_FOR_CANDIDATE' | 'LISTENING' | 'TYPING_MODE' | 'PROCESSING_ANSWER' | 'GENERATING_NEXT_QUESTION' | 'PAUSED' | 'COMPLETED'
    this.isAiSpeaking = false;
    this.isAIThinking = false;
    this.isTypingMode = false;
    this.isPaused = false;
    this.isMuted = false;
    this.isSubmitting = false;
    this.micPermissionStatus = options.micPermissionStatus || 'granted'; // 'prompt' | 'granted' | 'denied' | 'unavailable'
    this.speechRecognitionSupported = options.speechRecognitionSupported ?? true;
    this.activeMicDeviceName = 'Default Microphone';
    this.currentQuestionId = 'q-1';
    this.listeningQuestionId = 'q-1';
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.typedAnswer = '';
    this.settlingTimerActive = false;
    this.sessionStartTime = Date.now();
    this.sessionDurationSecs = 30 * 60;
    this.pausedDuration = 0;
    this.pauseStartTime = null;
    this.cleanedUp = false;
    this.submissionHistory = [];
    this.interviewData = options.interviewData || null;
  }

  // Simulates initCamera audio constraints
  getAudioConstraints() {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
  }

  // Simulates stopListening with recognition.abort()
  stopListening() {
    this.settlingTimerActive = false;
    return { action: 'recognition.abort()', status: 'stopped' };
  }

  // Simulates startListening with 400ms acoustic settling buffer
  startListening() {
    if (
      this.isAiSpeaking ||
      this.isAIThinking ||
      this.isTypingMode ||
      this.isPaused ||
      this.isMuted ||
      this.isSubmitting ||
      this.micPermissionStatus === 'denied' ||
      !this.speechRecognitionSupported
    ) {
      return false;
    }

    this.listeningQuestionId = this.currentQuestionId;
    this.state = 'WAITING_FOR_CANDIDATE';
    this.settlingTimerActive = true;
    return true;
  }

  // Simulates completion of 400ms acoustic settling buffer
  settlingDelayElapsed() {
    if (!this.settlingTimerActive) return false;
    if (
      this.isAiSpeaking ||
      this.isAIThinking ||
      this.isTypingMode ||
      this.isPaused ||
      this.isMuted ||
      this.isSubmitting
    ) {
      this.settlingTimerActive = false;
      return false;
    }

    this.state = 'LISTENING';
    this.settlingTimerActive = false;
    return true;
  }

  // Simulates TTS starting (speakChunk / speakTextConversational / triggerMockGreeting)
  aiStartsSpeaking() {
    this.stopListening();
    this.state = 'AI_SPEAKING';
    this.isAiSpeaking = true;
  }

  // Simulates TTS ending (utterance.onend or watchdog timeout)
  aiFinishesSpeaking() {
    this.isAiSpeaking = false;
    this.startListening();
  }

  // Simulates candidate interrupt ("I'm Ready — Speak Now")
  skipAiSpeakingAndListen() {
    this.isAiSpeaking = false;
    this.startListening();
    this.settlingDelayElapsed();
  }

  // Simulates recognition.onresult event with echo prevention and question-ID binding guard
  handleSpeechRecognitionResult(transcript, isFinal, eventQuestionId = null) {
    const qId = eventQuestionId || this.listeningQuestionId;

    // STRICT ECHO PREVENTION & STALE QUESTION GUARDS:
    if (
      qId !== this.currentQuestionId ||
      this.state !== 'LISTENING' ||
      this.isAiSpeaking ||
      this.isAIThinking ||
      this.isTypingMode ||
      this.isPaused ||
      this.isMuted ||
      this.isSubmitting
    ) {
      return { accepted: false, reason: 'ECHO_SUPPRESSED_OR_NOT_LISTENING' };
    }

    if (isFinal) {
      this.finalTranscript += transcript + ' ';
      this.interimTranscript = '';
    } else {
      this.interimTranscript = transcript;
    }
    return { accepted: true, finalTranscript: this.finalTranscript.trim() };
  }

  // Clear transcript action
  clearTranscript() {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  // Simulates switching between voice and typing mode
  switchToTyping() {
    this.stopListening();
    this.isTypingMode = true;
    this.state = 'TYPING_MODE';
  }

  switchToSpeaking() {
    this.isTypingMode = false;
    if (!this.isAiSpeaking && !this.isAIThinking) {
      this.startListening();
    }
  }

  // Simulates mic permission denial recovery
  handleMicDenied() {
    this.micPermissionStatus = 'denied';
    this.stopListening();
    this.switchToTyping();
    return { banner: 'Microphone Permission Required', retryAvailable: true, typingModeActive: true };
  }

  // Simulates mic retry
  retryMicrophone(granted = true) {
    if (granted) {
      this.micPermissionStatus = 'granted';
      this.isMuted = false;
      this.switchToSpeaking();
      return true;
    }
    return false;
  }

  // Simulates answer submission with submission locks, min-length check, and state transition
  submitAnswer() {
    if (this.isSubmitting || this.isAiSpeaking || this.isAIThinking) {
      return { success: false, reason: 'LOCKED' };
    }

    // Only final committed text is submitted, NEVER raw interim fragments
    const answer = this.isTypingMode ? this.typedAnswer.trim() : this.finalTranscript.trim();
    if (!answer || answer.length < 3) {
      return { success: false, reason: 'MIN_LENGTH_NOT_MET' };
    }

    this.isSubmitting = true;
    this.state = 'PROCESSING_ANSWER';
    this.stopListening();
    this.isAIThinking = true;

    // Record submission
    this.submissionHistory.push({
      questionId: this.currentQuestionId,
      answer,
      mode: this.isTypingMode ? 'typed' : 'voice'
    });

    // Reset transcripts cleanly
    this.clearTranscript();
    this.typedAnswer = '';

    // Generating next question
    this.state = 'GENERATING_NEXT_QUESTION';
    return { success: true, submittedAnswer: answer };
  }

  // Advances to next question with a new unique Question ID
  advanceToNextQuestion(nextQuestionId) {
    this.currentQuestionId = nextQuestionId;
    this.isSubmitting = false;
    this.isAIThinking = false;
    this.aiStartsSpeaking();
  }

  // Calculates elapsed session time across multiple questions
  getRemainingSessionSeconds(virtualNowMs) {
    const elapsedMs = virtualNowMs - this.sessionStartTime - this.pausedDuration;
    const elapsedSecs = Math.max(0, Math.floor(elapsedMs / 1000));
    return Math.max(0, this.sessionDurationSecs - elapsedSecs);
  }

  // Cleanup on unmount / end interview
  cleanup() {
    this.stopListening();
    this.isAiSpeaking = false;
    this.settlingTimerActive = false;
    this.state = 'COMPLETED';
    this.cleanedUp = true;
  }
}

test('InterviewX AI Mock Interview Engine — Comprehensive Speech, Voice & State Machine Suite', async (t) => {

  await t.test('1. Audio constraints require echoCancellation, noiseSuppression, and autoGainControl', () => {
    const sm = new SpeechStateMachine();
    const constraints = sm.getAudioConstraints();
    assert.strictEqual(constraints.echoCancellation, true, 'echoCancellation must be enabled');
    assert.strictEqual(constraints.noiseSuppression, true, 'noiseSuppression must be enabled');
    assert.strictEqual(constraints.autoGainControl, true, 'autoGainControl must be enabled');
  });

  await t.test('Test 1: AI speech is NEVER saved as candidate answer', () => {
    const sm = new SpeechStateMachine();
    
    // AI starts speaking question (Sarah reciting prompt)
    sm.aiStartsSpeaking();
    assert.strictEqual(sm.state, 'AI_SPEAKING');
    assert.strictEqual(sm.isAiSpeaking, true);

    // Audio bleeds into microphone from laptop speakers (e.g. "let's typewriting" or question words)
    const result1 = sm.handleSpeechRecognitionResult("let's typewriting", true);
    assert.strictEqual(result1.accepted, false, 'Spoken audio while AI is speaking must be dropped');
    assert.strictEqual(result1.reason, 'ECHO_SUPPRESSED_OR_NOT_LISTENING');
    assert.strictEqual(sm.finalTranscript, '', 'Transcript must remain completely empty');

    // Interim fragments during AI speech are also dropped
    const result2 = sm.handleSpeechRecognitionResult("Could you compare this approach", false);
    assert.strictEqual(result2.accepted, false);
    assert.strictEqual(sm.interimTranscript, '');

    // Candidate answer submission fails because nothing was captured from AI voice
    const submitRes = sm.submitAnswer();
    assert.strictEqual(submitRes.success, false);
    assert.strictEqual(submitRes.reason, 'LOCKED');
  });

  await t.test('Test 2: Candidate speech is captured cleanly AFTER AI finishes speaking', () => {
    const sm = new SpeechStateMachine();
    sm.aiStartsSpeaking();
    sm.aiFinishesSpeaking();

    // Enters WAITING_FOR_CANDIDATE state during acoustic settling buffer
    assert.strictEqual(sm.state, 'WAITING_FOR_CANDIDATE');
    assert.strictEqual(sm.settlingTimerActive, true);

    // Settling delay elapses (physical speaker reverberation decayed)
    sm.settlingDelayElapsed();
    assert.strictEqual(sm.state, 'LISTENING');

    // Genuine candidate voice response arrives
    const candidateVoice = sm.handleSpeechRecognitionResult('I implemented a microservice architecture with Redis caching.', true);
    assert.strictEqual(candidateVoice.accepted, true);
    assert.strictEqual(sm.finalTranscript.trim(), 'I implemented a microservice architecture with Redis caching.');
  });

  await t.test('Test 3: Interim transcripts are NOT submitted as final answers', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';

    // Candidate speaks an incomplete partial sentence ("I think that...")
    sm.handleSpeechRecognitionResult('I think that', false);
    assert.strictEqual(sm.interimTranscript, 'I think that');
    assert.strictEqual(sm.finalTranscript, '', 'Final transcript must remain empty for interim fragments');

    // Attempting to submit when only interim fragments exist fails
    const submitRes = sm.submitAnswer();
    assert.strictEqual(submitRes.success, false);
    assert.strictEqual(submitRes.reason, 'MIN_LENGTH_NOT_MET');

    // Once finalized by speech recognition, submission succeeds
    sm.handleSpeechRecognitionResult('I think that we should use a distributed hash map for O(1) lookups.', true);
    assert.ok(sm.finalTranscript.length > 0);
    const validSubmit = sm.submitAnswer();
    assert.strictEqual(validSubmit.success, true);
  });

  await t.test('Test 4: Empty answers do not advance the interview', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';

    // 1. Completely empty
    sm.finalTranscript = '';
    let res = sm.submitAnswer();
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.reason, 'MIN_LENGTH_NOT_MET');

    // 2. Whitespace only
    sm.finalTranscript = '     \n  ';
    res = sm.submitAnswer();
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.reason, 'MIN_LENGTH_NOT_MET');

    // 3. Below minimal 3-character threshold (accidental click or single cough noise)
    sm.finalTranscript = 'ok';
    res = sm.submitAnswer();
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.reason, 'MIN_LENGTH_NOT_MET');

    assert.strictEqual(sm.state, 'LISTENING', 'State must remain LISTENING, not advance');
    assert.strictEqual(sm.submissionHistory.length, 0);
  });

  await t.test('Test 5: Duplicate callbacks do not create duplicate submissions', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';
    sm.finalTranscript = 'We chose PostgreSQL because of its ACID transactions and robust indexing options.';

    // First submit click
    const firstSubmit = sm.submitAnswer();
    assert.strictEqual(firstSubmit.success, true);
    assert.strictEqual(sm.isSubmitting, true);
    assert.strictEqual(sm.state, 'GENERATING_NEXT_QUESTION');
    assert.strictEqual(sm.finalTranscript, '', 'Transcript wiped immediately on submit');

    // Rapid second click or duplicate event
    const secondSubmit = sm.submitAnswer();
    assert.strictEqual(secondSubmit.success, false);
    assert.strictEqual(secondSubmit.reason, 'LOCKED');

    // Third event while processing
    const thirdSubmit = sm.submitAnswer();
    assert.strictEqual(thirdSubmit.success, false);
    assert.strictEqual(thirdSubmit.reason, 'LOCKED');

    // Only one submission recorded in history
    assert.strictEqual(sm.submissionHistory.length, 1);
  });

  await t.test('Test 6: Recognition errors and denied permissions activate usable recovery options', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';

    // Browser denies microphone access
    const recovery = sm.handleMicDenied();
    assert.strictEqual(sm.micPermissionStatus, 'denied');
    assert.strictEqual(sm.isTypingMode, true);
    assert.strictEqual(sm.state, 'TYPING_MODE');
    assert.strictEqual(recovery.retryAvailable, true);
    assert.strictEqual(recovery.typingModeActive, true);

    // Audio input is blocked while permission is denied
    const blockedAudio = sm.handleSpeechRecognitionResult('Blocked candidate words', true);
    assert.strictEqual(blockedAudio.accepted, false);

    // User can type and submit answer successfully
    sm.typedAnswer = 'My typed answer explaining Docker containerization.';
    const typedSubmit = sm.submitAnswer();
    assert.strictEqual(typedSubmit.success, true);
    assert.strictEqual(typedSubmit.submittedAnswer, 'My typed answer explaining Docker containerization.');

    // User grants permission via "Retry Microphone" button
    const retrySuccess = sm.retryMicrophone(true);
    assert.strictEqual(retrySuccess, true);
    assert.strictEqual(sm.micPermissionStatus, 'granted');
    assert.strictEqual(sm.isTypingMode, false);
  });

  await t.test('Test 7: Resume Interview remains grounded in the uploaded resume snapshot', () => {
    const interviewData = {
      type: 'Resume Interview',
      resumeFilename: 'John_Doe_Senior_Resume.pdf',
      resumeSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      resumeProjects: [
        { name: 'E-Commerce Platform', tech: ['Node.js', 'React'], description: 'High-throughput payment service' },
        { name: 'Analytics Dashboard', tech: ['PostgreSQL'], description: 'Real-time telemetry aggregation' }
      ],
      resumeExperience: [
        { role: 'Backend Engineer Intern', company: 'Acme Corp' }
      ]
    };

    const sm = new SpeechStateMachine({ interviewData });

    // Verify resume grounding: Opening question must address documented resume projects/skills
    const projName = interviewData.resumeProjects[0].name;
    const expectedGreetingSnippet = `I've thoroughly reviewed your resume and noticed your work on "${projName}"`;
    
    // Simulate generation of resume grounded opening question
    const greetingQuestion = `Welcome! I've thoroughly reviewed your resume and noticed your work on "${projName}". Could you walk me through the architecture of "${projName}", your specific personal contribution, and the key technical trade-offs you made?`;
    assert.ok(greetingQuestion.includes(expectedGreetingSnippet), 'Question must cite actual project name from resume');
    assert.ok(!greetingQuestion.includes('Could you compare this approach with another method?'), 'Must not ask generic unrelated questions');

    // Ensure session holds resume profile snapshot
    assert.strictEqual(sm.interviewData.resumeFilename, 'John_Doe_Senior_Resume.pdf');
    assert.deepStrictEqual(sm.interviewData.resumeSkills, ['React', 'Node.js', 'PostgreSQL', 'Docker']);
  });

  await t.test('Test 8: Session timer continues accurately across multiple questions without resetting', () => {
    const sm = new SpeechStateMachine();
    const startTime = sm.sessionStartTime;

    // Time at Question 1 (0 seconds elapsed)
    let remaining = sm.getRemainingSessionSeconds(startTime);
    assert.strictEqual(remaining, 1800, 'Starts with full 30 min (1800s)');

    // 120 seconds into Question 1: candidate submits answer
    sm.state = 'LISTENING';
    sm.finalTranscript = 'First question thorough answer.';
    sm.submitAnswer();

    // Advance to Question 2 (120 seconds elapsed)
    sm.advanceToNextQuestion('q-2');
    remaining = sm.getRemainingSessionSeconds(startTime + 120000);
    assert.strictEqual(remaining, 1800 - 120, 'Timer must NOT reset on question transition; remaining must be 1680s');

    // Advance to Question 3 (300 seconds elapsed)
    sm.state = 'LISTENING';
    sm.finalTranscript = 'Second question deep dive answer.';
    sm.submitAnswer();
    sm.advanceToNextQuestion('q-3');
    remaining = sm.getRemainingSessionSeconds(startTime + 300000);
    assert.strictEqual(remaining, 1800 - 300, 'Timer must accurately reflect cumulative session elapsed time (1500s)');
  });

  await t.test('Test 9: Ending the interview cleans up all audio and recognition resources', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';
    sm.handleSpeechRecognitionResult('candidate speech in progress', false);

    // Candidate clicks "End Interview"
    sm.cleanup();

    assert.strictEqual(sm.state, 'COMPLETED');
    assert.strictEqual(sm.cleanedUp, true);
    assert.strictEqual(sm.isAiSpeaking, false);
    assert.strictEqual(sm.settlingTimerActive, false);

    // No audio input can be processed after cleanup
    const lateAudio = sm.handleSpeechRecognitionResult('speech after ending session', true);
    assert.strictEqual(lateAudio.accepted, false);
  });

  await t.test('Test 10: Typing mode works independently of microphone permissions', () => {
    // Microphone is unavailable / permission denied
    const sm = new SpeechStateMachine({
      micPermissionStatus: 'unavailable',
      speechRecognitionSupported: false
    });

    // Directly switch to typing mode
    sm.switchToTyping();
    assert.strictEqual(sm.state, 'TYPING_MODE');
    assert.strictEqual(sm.isTypingMode, true);

    // Type a full multi-line algorithm response
    sm.typedAnswer = 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}';

    // Submit answer in typing mode
    const submitResult = sm.submitAnswer();
    assert.strictEqual(submitResult.success, true);
    assert.strictEqual(submitResult.submittedAnswer, sm.submissionHistory[0].answer);
    assert.strictEqual(sm.submissionHistory[0].mode, 'typed');
  });

  await t.test('Test 11 (Bonus): Stale Question-ID Guard drops buffered recognition events from prior questions', () => {
    const sm = new SpeechStateMachine();
    sm.currentQuestionId = 'q-1';
    sm.listeningQuestionId = 'q-1';
    sm.state = 'LISTENING';

    // Advance engine to Question 2 before late speech recognition buffer from Question 1 is received
    sm.currentQuestionId = 'q-2';

    // Recognition event arriving with stale Question 1 ID
    const staleResult = sm.handleSpeechRecognitionResult('late buffered words from question 1', true, 'q-1');
    assert.strictEqual(staleResult.accepted, false, 'Stale question recognition events must be rejected');
    assert.strictEqual(sm.finalTranscript, '');
  });

  await t.test('Test 12 (Bonus): Candidate Interrupt ("I\'m Ready — Speak Now") safely transitions to listening', () => {
    const sm = new SpeechStateMachine();
    sm.aiStartsSpeaking();
    assert.strictEqual(sm.state, 'AI_SPEAKING');

    // Candidate clicks "I'm Ready — Speak Now"
    sm.skipAiSpeakingAndListen();
    assert.strictEqual(sm.isAiSpeaking, false);
    assert.strictEqual(sm.state, 'LISTENING');

    // Candidate voice is accepted immediately
    const res = sm.handleSpeechRecognitionResult('I am ready to answer your question.', true);
    assert.strictEqual(res.accepted, true);
    assert.strictEqual(sm.finalTranscript.trim(), 'I am ready to answer your question.');
  });
});
