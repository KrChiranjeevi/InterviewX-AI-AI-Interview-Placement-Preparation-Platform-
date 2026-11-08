const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * Pure state machine simulator replicating the exact logic implemented
 * in LiveInterview.jsx and MockInterviewRoom.jsx for speech handling,
 * echo prevention, audio lifecycle, and submission isolation.
 */
class SpeechStateMachine {
  constructor() {
    this.state = 'IDLE'; // 'IDLE' | 'AI_SPEAKING' | 'WAITING_FOR_CANDIDATE' | 'LISTENING' | 'TYPING_MODE' | 'PROCESSING_ANSWER' | 'GENERATING_NEXT_QUESTION' | 'PAUSED' | 'COMPLETED'
    this.isAiSpeaking = false;
    this.isAIThinking = false;
    this.isTypingMode = false;
    this.isPaused = false;
    this.isMuted = false;
    this.isSubmitting = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.typedAnswer = '';
    this.settlingTimerActive = false;
  }

  // Simulates initCamera audio constraints
  getAudioConstraints() {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
  }

  // Simulates stopListening
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
      this.isSubmitting
    ) {
      return false;
    }

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

  // Simulates TTS ending (utterance.onend)
  aiFinishesSpeaking() {
    this.isAiSpeaking = false;
    this.startListening();
  }

  // Simulates recognition.onresult event with echo prevention guard
  handleSpeechRecognitionResult(transcript, isFinal) {
    // STRICT ECHO PREVENTION GUARD:
    // Reject incoming audio if AI is speaking, interviewer is not listening, or user is typing/muted/submitting
    if (
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

  // Simulates answer submission with submission locks and transcript reset
  submitAnswer() {
    if (this.isSubmitting || this.isAiSpeaking || this.isAIThinking) {
      return { success: false, reason: 'LOCKED' };
    }

    const answer = this.isTypingMode ? this.typedAnswer.trim() : this.finalTranscript.trim();
    if (!answer || answer.length < 3) {
      return { success: false, reason: 'MIN_LENGTH_NOT_MET' };
    }

    this.isSubmitting = true;
    this.state = 'PROCESSING_ANSWER';
    this.stopListening();
    this.isAIThinking = true;

    // Reset transcripts cleanly
    this.clearTranscript();
    this.typedAnswer = '';

    // Generating next question
    this.state = 'GENERATING_NEXT_QUESTION';
    return { success: true, submittedAnswer: answer };
  }

  finishQuestionGeneration() {
    this.isSubmitting = false;
    this.isAIThinking = false;
  }
}

test('Speech State Machine & Microphone Echo Prevention Suite', async (t) => {

  await t.test('1. Audio constraints require echoCancellation, noiseSuppression, and autoGainControl', () => {
    const sm = new SpeechStateMachine();
    const constraints = sm.getAudioConstraints();
    assert.strictEqual(constraints.echoCancellation, true, 'echoCancellation must be true');
    assert.strictEqual(constraints.noiseSuppression, true, 'noiseSuppression must be true');
    assert.strictEqual(constraints.autoGainControl, true, 'autoGainControl must be true');
  });

  await t.test('2. AI Spoken audio is STRICTLY REJECTED from candidate transcription while AI is speaking', () => {
    const sm = new SpeechStateMachine();
    
    // AI starts speaking question
    sm.aiStartsSpeaking();
    assert.strictEqual(sm.state, 'AI_SPEAKING');
    assert.strictEqual(sm.isAiSpeaking, true);

    // Audio bleeds into microphone from laptop speakers (e.g. "let's typewriting")
    const result = sm.handleSpeechRecognitionResult("let's typewriting", true);
    assert.strictEqual(result.accepted, false);
    assert.strictEqual(result.reason, 'ECHO_SUPPRESSED_OR_NOT_LISTENING');
    assert.strictEqual(sm.finalTranscript, '', 'Transcript must remain completely empty');
  });

  await t.test('3. Acoustic settling buffer: mic is not opened until delay elapses', () => {
    const sm = new SpeechStateMachine();
    sm.aiStartsSpeaking();
    sm.aiFinishesSpeaking();

    // Enters WAITING_FOR_CANDIDATE state
    assert.strictEqual(sm.state, 'WAITING_FOR_CANDIDATE');
    assert.strictEqual(sm.settlingTimerActive, true);

    // Reverberation audio arriving during settling buffer is discarded
    const earlyBleed = sm.handleSpeechRecognitionResult('trailing room echo', false);
    assert.strictEqual(earlyBleed.accepted, false);
    assert.strictEqual(sm.finalTranscript, '');

    // Settling delay completes
    sm.settlingDelayElapsed();
    assert.strictEqual(sm.state, 'LISTENING');

    // Genuine candidate response is accepted
    const candidateVoice = sm.handleSpeechRecognitionResult('I implemented a microservice architecture.', true);
    assert.strictEqual(candidateVoice.accepted, true);
    assert.strictEqual(sm.finalTranscript.trim(), 'I implemented a microservice architecture.');
  });

  await t.test('4. Voice and Typing mode mutual exclusion without text merging', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';
    sm.finalTranscript = 'spoken voice answer';

    // Candidate switches to typing
    sm.switchToTyping();
    assert.strictEqual(sm.state, 'TYPING_MODE');
    assert.strictEqual(sm.isTypingMode, true);

    // Candidate types something completely distinct
    sm.typedAnswer = 'typed distinct solution';
    
    // Candidate switches back to speaking: typed text is NOT merged into voice transcript
    sm.switchToSpeaking();
    assert.strictEqual(sm.isTypingMode, false);
    assert.strictEqual(sm.finalTranscript, 'spoken voice answer', 'Voice transcript must remain independent');
    assert.strictEqual(sm.typedAnswer, 'typed distinct solution', 'Typed text must remain independent');
  });

  await t.test('5. Submission locks prevent duplicate/concurrent submissions and empty noise', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';

    // Noise below 3 chars is rejected
    sm.finalTranscript = 'a';
    const shortRes = sm.submitAnswer();
    assert.strictEqual(shortRes.success, false);
    assert.strictEqual(shortRes.reason, 'MIN_LENGTH_NOT_MET');

    // Valid answer submission
    sm.finalTranscript = 'I optimized the database indexing.';
    const validRes = sm.submitAnswer();
    assert.strictEqual(validRes.success, true);
    assert.strictEqual(sm.isSubmitting, true);
    assert.strictEqual(sm.state, 'GENERATING_NEXT_QUESTION');
    assert.strictEqual(sm.finalTranscript, '', 'Transcript must be wiped immediately on submit');

    // Immediate second click is locked
    const duplicateRes = sm.submitAnswer();
    assert.strictEqual(duplicateRes.success, false);
    assert.strictEqual(duplicateRes.reason, 'LOCKED');
  });

  await t.test('6. Clear transcript action cleanly resets both final and interim text', () => {
    const sm = new SpeechStateMachine();
    sm.state = 'LISTENING';
    sm.handleSpeechRecognitionResult('some accidental speech', true);
    sm.handleSpeechRecognitionResult('interim partial', false);
    
    assert.ok(sm.finalTranscript.length > 0);
    assert.ok(sm.interimTranscript.length > 0);

    sm.clearTranscript();
    assert.strictEqual(sm.finalTranscript, '');
    assert.strictEqual(sm.interimTranscript, '');
  });
});
