const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const { generateQuestion, analyzeAnswer, generateAIReport, generateConversationalResponse, generateMockEvidenceReport, generateGDTopic, generateGDParticipants, generateGDTurn, generateGDEvaluationReport, generateExtemporeTopic, generateExtemporeCrossQuestions, generateExtemporeReport, buildClarificationForQuestion } = require('../services/aiService');

const VALID_ARCHETYPES = [
  'Technical Interview',
  'Coding Interview',
  'Resume Interview',
  'HR Interview',
  'Behavioral Interview',
  'Project Discussion',
  'System Design Interview',
  'System Design',
  'Extempore Round',
  'Extempore',
  'Group Discussion'
];

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const validateInterviewConfig = (body) => {
  const {
    interviewType,
    difficulty,
    duration,
    resumeText,
    technicalTrack,
    domain,
    selectedTopics,
    codingTrack,
    subLanguage,
    selectedProject,
    projectName,
    systemDesignDomain
  } = body || {};

  // 1. Archetype Validation
  if (!interviewType || !VALID_ARCHETYPES.includes(interviewType)) {
    return {
      valid: false,
      status: 400,
      message: `Invalid interview archetype '${interviewType || ''}'. Must be one of: ${VALID_ARCHETYPES.join(', ')}`
    };
  }

  // 2. Difficulty Validation
  const chosenDifficulty = difficulty || 'Medium';
  if (!VALID_DIFFICULTIES.includes(chosenDifficulty)) {
    return {
      valid: false,
      status: 400,
      message: `Invalid difficulty '${chosenDifficulty}'. Must be one of: Easy, Medium, Hard.`
    };
  }

  // 3. Duration Validation
  const durStr = String(duration || '').trim();
  const durMatch = durStr.match(/(\d+)/);
  const parsedMinutes = durMatch ? parseInt(durMatch[1], 10) : 0;
  if (parsedMinutes <= 0) {
    return {
      valid: false,
      status: 400,
      message: 'Invalid interview duration. A duration in minutes is required.'
    };
  }

  // 4. Archetype-Specific Prerequisite Validations
  if (interviewType === 'Resume Interview') {
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return {
        valid: false,
        status: 400,
        message: 'A validated resume with readable content (at least 50 characters) is required to start a Resume Interview. Please upload or select a valid PDF or DOCX resume.'
      };
    }
  } else if (interviewType === 'Technical Interview') {
    if (!technicalTrack && !domain) {
      return {
        valid: false,
        status: 400,
        message: 'Technical Interview requires a technical track.'
      };
    }
    if (!selectedTopics || !Array.isArray(selectedTopics) || selectedTopics.length === 0) {
      return {
        valid: false,
        status: 400,
        message: 'Technical Interview requires at least one selected topic.'
      };
    }
  } else if (interviewType === 'Coding Interview') {
    if (!codingTrack && !domain && !subLanguage) {
      return {
        valid: false,
        status: 400,
        message: 'Coding Interview requires a coding track or programming language.'
      };
    }
  } else if (interviewType === 'Project Discussion') {
    if (!selectedProject && !projectName && !domain) {
      return {
        valid: false,
        status: 400,
        message: 'Project Discussion requires a project title.'
      };
    }
  } else if (interviewType.includes('System Design')) {
    if (!systemDesignDomain && !domain) {
      return {
        valid: false,
        status: 400,
        message: 'System Design Interview requires a target system design domain.'
      };
    }
  }

  return {
    valid: true,
    chosenDifficulty,
    parsedMinutes
  };
};

const createInterview = async (req, res) => {
  const {
    interviewType, role, difficulty, duration, resumeSkills, resumeText,
    company, companyContext, domain, subLanguage, projectName, projectDescription,
    technicalTrack, selectedTopics, codingTrack, selectedProject, systemDesignDomain,
    resumeId, resumeFilename, resumeSnapshot, resumeProjects, resumeExperience, resumeEducation,
    behavioralCompetencies
  } = req.body;

  try {
    const validation = validateInterviewConfig(req.body);
    if (!validation.valid) {
      return res.status(validation.status).json({ message: validation.message });
    }
    const chosenDifficulty = validation.chosenDifficulty;

    const interview = await Interview.create({
      userId: req.user._id,
      type: interviewType,
      role: role || 'Software Engineer',
      company: company || companyContext || '',
      difficulty: chosenDifficulty,
      duration: duration || '30 Minutes',
      resumeSkills: resumeSkills || [],
      resumeText: resumeText || '',
      resumeId: resumeId || null,
      resumeFilename: resumeFilename || '',
      resumeSnapshot: resumeSnapshot || null,
      resumeProjects: resumeProjects || [],
      resumeExperience: resumeExperience || [],
      resumeEducation: resumeEducation || [],
      domain: domain || '',
      subLanguage: subLanguage || '',
      projectName: projectName || '',
      projectDescription: projectDescription || '',
      technicalTrack: technicalTrack || '',
      selectedTopics: selectedTopics || [],
      behavioralCompetencies: behavioralCompetencies || [],
      codingTrack: codingTrack || '',
      selectedProject: selectedProject || '',
      systemDesignDomain: systemDesignDomain || '',
      status: 'started',
      questions: [],
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getRecentInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const questionText = await generateQuestion(
      interview.role, 
      interview.type, 
      interview.difficulty, 
      interview.questions, 
      interview.resumeSkills, 
      interview.resumeText,
      interview.company,
      interview.domain,
      interview.subLanguage,
      interview.projectName,
      interview.projectDescription,
      interview.selectedTopics || [],
      interview.technicalTrack || '',
      interview.codingTrack || '',
      interview.systemDesignDomain || '',
      interview.resumeProjects || [],
      interview.resumeExperience || [],
      interview.resumeEducation || []
    );
    
    res.json({ question: questionText });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Handle skipped or empty answer states explicitly
    if (answer === 'Skipped' || !answer || answer.trim() === '') {
      interview.questions.push({
        question,
        userAnswer: 'Skipped',
        aiFeedback: 'No response was provided.',
        score: 0,
        metrics: {
          technicalKnowledge: 0,
          problemSolving: 0,
          communication: 0,
          confidence: 0,
          accuracy: 0,
          logicalThinking: 0
        }
      });

      const totalScore = interview.questions.reduce((acc, curr) => acc + curr.score, 0);
      interview.score = Math.round((totalScore / interview.questions.length) * 10);
      await interview.save();

      // If mock mode or caller requested skipping speculative generation, do not make redundant AI calls
      if (req.body.isMock || req.body.skipNextQuestionGeneration) {
        return res.json({
          isClarification: false,
          feedback: 'No response was provided.',
          score: 0,
          overallScore: interview.score,
          nextQuestion: null
        });
      }

      const nextQuestionText = await generateQuestion(
        interview.role,
        interview.type,
        interview.difficulty,
        interview.questions,
        interview.resumeSkills,
        interview.resumeText,
        interview.company,
        interview.domain,
        interview.subLanguage,
        interview.projectName,
        interview.projectDescription,
        interview.selectedTopics || [],
        interview.technicalTrack || '',
        interview.codingTrack || ''
      );

      return res.json({
        isClarification: false,
        feedback: 'No response was provided.',
        score: 0,
        overallScore: interview.score,
        nextQuestion: nextQuestionText
      });
    }

    // Step 1: Analyze user's answer
    const analysis = await analyzeAnswer(question, answer, interview.role, interview.difficulty);
    
    // If user asked a clarifying question, return clarification response directly
    if (analysis.isClarification) {
      return res.json({ 
        isClarification: true, 
        feedback: analysis.feedback 
      });
    }

    // Step 2: Push answer and live evaluation metrics to history
    interview.questions.push({
      question,
      userAnswer: answer,
      aiFeedback: analysis.feedback,
      score: analysis.score,
      metrics: {
        technicalKnowledge: analysis.metrics?.technicalKnowledge || 5,
        problemSolving: analysis.metrics?.problemSolving || 5,
        communication: analysis.metrics?.communication || 5,
        confidence: analysis.metrics?.confidence || 5,
        accuracy: analysis.metrics?.accuracy || 5,
        logicalThinking: analysis.metrics?.logicalThinking || 5
      },
      speechStats: {
        speakingSpeed: analysis.speechStats?.speakingSpeed || 120,
        fillerWordsCount: analysis.speechStats?.fillerWordsCount || 0,
        eyeContactScore: analysis.speechStats?.eyeContactScore || 85,
        voiceClarity: analysis.speechStats?.voiceClarity || 90,
        grammarScore: analysis.speechStats?.grammarScore || 90
      },
      bookmarked: req.body.bookmarked || false
    });

    // Step 3: Adaptive Difficulty logic based on score performance
    const lastScore = analysis.score || 5;
    let nextDifficulty = interview.difficulty;
    if (lastScore >= 8) {
      if (nextDifficulty === 'Beginner') nextDifficulty = 'Intermediate';
      else if (nextDifficulty === 'Intermediate') nextDifficulty = 'Advanced';
    } else if (lastScore <= 5) {
      if (nextDifficulty === 'Advanced') nextDifficulty = 'Intermediate';
      else if (nextDifficulty === 'Intermediate') nextDifficulty = 'Beginner';
    }
    interview.difficulty = nextDifficulty;

    // Step 4: Update overall cumulative score
    const totalScore = interview.questions.reduce((acc, curr) => acc + curr.score, 0);
    interview.score = Math.round((totalScore / interview.questions.length) * 10); // scale 10 to 100

    // Save state
    await interview.save();

    // If mock mode or caller requested skipping speculative generation, do not make redundant AI calls
    if (req.body.isMock || req.body.skipNextQuestionGeneration) {
      return res.json({ 
        isClarification: false, 
        feedback: analysis.feedback, 
        score: analysis.score, 
        overallScore: interview.score,
        nextQuestion: null
      });
    }

    // Step 5: Speculatively generate next question with updated history (for non-mock/company flow)
    const nextQuestionText = await generateQuestion(
      interview.role,
      interview.type,
      nextDifficulty,
      interview.questions,
      interview.resumeSkills,
      interview.resumeText,
      interview.company,
      interview.domain,
      interview.subLanguage,
      interview.projectName,
      interview.projectDescription,
      interview.selectedTopics || [],
      interview.technicalTrack || '',
      interview.codingTrack || '',
      interview.systemDesignDomain || '',
      interview.resumeProjects || [],
      interview.resumeExperience || [],
      interview.resumeEducation || []
    );
    
    res.json({ 
      isClarification: false, 
      feedback: analysis.feedback, 
      score: analysis.score, 
      overallScore: interview.score,
      nextQuestion: nextQuestionText
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const finishInterview = async (req, res) => {
  try {
    const { confidenceScore } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'completed';
    if (confidenceScore !== undefined) {
      interview.confidenceScore = confidenceScore;
    }

    // For mock interviews, generate evidence-based report and pre-cache it
    if (!interview.company) {
      try {
        const reportData = await generateMockEvidenceReport(interview);
        const technical = reportData.scoringBreakdown?.find(c => /tech|algo|code|system/i.test(c.category))?.score;
        const communication = reportData.scoringBreakdown?.find(c => /comm|clarity|star/i.test(c.category))?.score;
        const confidence = reportData.scoringBreakdown?.find(c => /conf|owner|auth/i.test(c.category))?.score;
        const problemSolving = reportData.scoringBreakdown?.find(c => /problem|trade|scal|conflict/i.test(c.category))?.score;

        await Report.findOneAndUpdate(
          { interviewId: interview._id, userId: req.user._id },
          {
            $set: {
              overallScore: typeof reportData.overallScore === 'number' ? reportData.overallScore : 0,
              technicalScore: typeof technical === 'number' ? technical : (reportData.overallScore || 0),
              communicationScore: typeof communication === 'number' ? communication : (reportData.overallScore || 0),
              confidenceScore: typeof confidence === 'number' ? confidence : (reportData.overallScore || 0),
              problemSolvingScore: typeof problemSolving === 'number' ? problemSolving : (reportData.overallScore || 0),
              hiringDecision: reportData.finalDecision || 'Needs Improvement',
              mockReport: { ...reportData, adaptiveState: interview.adaptiveState }
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        interview.feedback = `${reportData.finalDecision}: Overall score ${reportData.overallScore}%. ${reportData.strengths?.[0] || ''}`;
      } catch (repErr) {
        console.warn('Pre-generating mock report in finishInterview failed:', repErr.message);
        interview.feedback = 'Interview completed. Evidence report generated.';
      }
    } else {
      // Company mode: generate final AI report
      const summaryFeedback = await generateAIReport(interview);
      interview.feedback = summaryFeedback;
    }

    await interview.save();

    // Award XP and update streak for user
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp = (user.xp || 0) + 150; // award 150 XP
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > (user.level || 1)) {
          user.level = newLevel;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (user.lastActiveDate) {
          const lastActive = new Date(user.lastActiveDate);
          lastActive.setHours(0, 0, 0, 0);
          const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            user.streakCount = (user.streakCount || 0) + 1;
          } else if (diffDays > 1) {
            user.streakCount = 1;
          }
        } else {
          user.streakCount = 1;
        }
        user.lastActiveDate = new Date();
        await user.save();
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const bookmarkQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, bookmarked } = req.body;
    const interview = await Interview.findById(id);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.questions[questionIndex]) {
      interview.questions[questionIndex].bookmarked = bookmarked;
      await interview.save();
      return res.json({ success: true, bookmarked: interview.questions[questionIndex].bookmarked });
    } else {
      return res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getConversationalResponse = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const {
      userAnswer,
      questionAsked,
      conversationHistory,
      askedQuestions,
      questionNumber,
      interviewStage
    } = req.body;

    // Get the last question's evaluation from interview.questions if available
    let lastEvaluation = null;
    if (interview.questions && interview.questions.length > 0) {
      const lastQ = interview.questions[interview.questions.length - 1];
      lastEvaluation = {
        score: lastQ.score,
        metrics: lastQ.metrics,
        speechStats: lastQ.speechStats
      };
    }

    // Initialize or load adaptive state
    let adaptiveState = interview.adaptiveState || {
      knowledgeScore: 50,
      confidenceScore: 50,
      communicationScore: 50,
      technicalScore: 50,
      domainScore: 50,
      overallScore: 50,
      difficultyLevel: interview.difficulty || 'Medium',
      knowledgeGraph: {},
      mistakes: [],
      notes: [],
      historyTopics: [],
      conceptualFollowupsCount: 0,
      optimizationFollowupsCount: 0,
      edgeCaseFollowupsCount: 0,
      askedFollowupQuestions: []
    };

    const dbAskedQuestions = (interview.questions || []).map(q => q?.question).filter(Boolean);
    const mergedAskedQuestions = Array.from(new Set([
      ...(Array.isArray(adaptiveState.askedFollowupQuestions) ? adaptiveState.askedFollowupQuestions : []),
      ...(Array.isArray(askedQuestions) ? askedQuestions : []),
      ...dbAskedQuestions,
      ...(questionAsked ? [questionAsked] : [])
    ].filter(Boolean)));
    adaptiveState = { ...adaptiveState, askedFollowupQuestions: mergedAskedQuestions };

    const result = await generateConversationalResponse({
      userAnswer,
      questionAsked,
      conversationHistory: conversationHistory || [],
      askedQuestions: mergedAskedQuestions,
      role: interview.role,
      type: interview.type,
      domain: interview.domain || '',
      subLanguage: interview.subLanguage || '',
      projectName: interview.projectName || '',
      projectDescription: interview.projectDescription || '',
      difficulty: interview.difficulty || 'Intermediate',
      questionNumber: questionNumber || 1,
      interviewStage: interviewStage || 'core',
      adaptiveState,
      lastEvaluation,
      duration: interview.duration,
      selectedTopics: interview.selectedTopics || [],
      technicalTrack: interview.technicalTrack || '',
      codingTrack: interview.codingTrack || '',
      systemDesignDomain: interview.systemDesignDomain || '',
      resumeText: interview.resumeText || '',
      resumeSkills: interview.resumeSkills || [],
      resumeProjects: interview.resumeProjects || [],
      resumeExperience: interview.resumeExperience || [],
      resumeEducation: interview.resumeEducation || [],
      resumeSnapshot: interview.resumeSnapshot || null,
    });

    // Unified turn saving with idempotent duplicate submission protection
    if (req.body.saveAnswer !== false && userAnswer && questionAsked) {
      const lastSavedQ = interview.questions?.[interview.questions.length - 1];
      const isDuplicateTurnPush = lastSavedQ &&
        lastSavedQ.question === questionAsked &&
        lastSavedQ.userAnswer === (req.body.rawAnswer || userAnswer) &&
        lastSavedQ.createdAt &&
        (Date.now() - new Date(lastSavedQ.createdAt).getTime()) < 5000;

      if (!isDuplicateTurnPush) {
        const isSkippedAnswer = req.body.rawAnswer === 'Skipped' || /^(skipped|skip|i would like to skip)/i.test((userAnswer || '').trim());
        const evalObj = isSkippedAnswer
          ? {
              score: 0,
              feedback: 'Question was skipped by candidate.',
              metrics: { technicalKnowledge: 0, problemSolving: 0, communication: 0, confidence: 0, accuracy: 0, logicalThinking: 0 }
            }
          : (result.evaluation || {
              score: Math.min(10, Math.max(0, Math.round((result.adaptiveState?.overallScore || 70) / 10))),
              feedback: result.acknowledgement || 'Response evaluated.',
              metrics: {
                technicalKnowledge: Math.round((result.adaptiveState?.technicalScore || 70) / 10),
                problemSolving: Math.round((result.adaptiveState?.overallScore || 70) / 10),
                communication: Math.round((result.adaptiveState?.communicationScore || 75) / 10),
                confidence: Math.round((result.adaptiveState?.confidenceScore || 75) / 10),
                accuracy: Math.round((result.adaptiveState?.knowledgeScore || 70) / 10),
                logicalThinking: Math.round((result.adaptiveState?.technicalScore || 70) / 10)
              }
            });

        interview.questions.push({
          question: questionAsked,
          userAnswer: req.body.rawAnswer || userAnswer,
          aiFeedback: evalObj.feedback,
          score: evalObj.score,
          metrics: evalObj.metrics,
          speechStats: {
            speakingSpeed: isSkippedAnswer ? 0 : 120,
            fillerWordsCount: 0,
            eyeContactScore: isSkippedAnswer ? 0 : 85,
            voiceClarity: isSkippedAnswer ? 0 : 90,
            grammarScore: isSkippedAnswer ? 0 : 90
          },
          bookmarked: req.body.bookmarked || false
        });

        const totalScore = interview.questions.reduce((acc, curr) => acc + (curr.score || 0), 0);
        interview.score = Math.round((totalScore / interview.questions.length) * 10);
        if (result.adaptiveState?.difficultyLevel) {
          interview.difficulty = result.adaptiveState.difficultyLevel;
        }
      }
    }

    // Save updated adaptive state back to MongoDB (markModified required for Schema.Types.Mixed)
    interview.adaptiveState = result.adaptiveState || adaptiveState;
    interview.markModified('adaptiveState');
    await interview.save();

    res.json({
      ...result,
      overallScore: interview.score,
      evaluation: result.evaluation
    });
  } catch (error) {
    console.error('getConversationalResponse error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const streamConversationalResponse = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'status', status: 'evaluating' })}\n\n`);

    const {
      userAnswer,
      questionAsked,
      conversationHistory,
      askedQuestions,
      questionNumber,
      interviewStage
    } = req.body;

    let lastEvaluation = null;
    if (interview.questions && interview.questions.length > 0) {
      const lastQ = interview.questions[interview.questions.length - 1];
      lastEvaluation = {
        score: lastQ.score,
        metrics: lastQ.metrics,
        speechStats: lastQ.speechStats
      };
    }

    let adaptiveState = interview.adaptiveState || {
      knowledgeScore: 50,
      confidenceScore: 50,
      communicationScore: 50,
      technicalScore: 50,
      domainScore: 50,
      overallScore: 50,
      difficultyLevel: interview.difficulty || 'Medium',
      knowledgeGraph: {},
      mistakes: [],
      notes: [],
      historyTopics: [],
      conceptualFollowupsCount: 0,
      optimizationFollowupsCount: 0,
      edgeCaseFollowupsCount: 0,
      askedFollowupQuestions: []
    };

    const dbAskedQuestions = (interview.questions || []).map(q => q?.question).filter(Boolean);
    const mergedAskedQuestions = Array.from(new Set([
      ...(Array.isArray(adaptiveState.askedFollowupQuestions) ? adaptiveState.askedFollowupQuestions : []),
      ...(Array.isArray(askedQuestions) ? askedQuestions : []),
      ...dbAskedQuestions,
      ...(questionAsked ? [questionAsked] : [])
    ].filter(Boolean)));
    adaptiveState = { ...adaptiveState, askedFollowupQuestions: mergedAskedQuestions };

    const result = await generateConversationalResponse({
      userAnswer,
      questionAsked,
      conversationHistory: conversationHistory || [],
      askedQuestions: mergedAskedQuestions,
      role: interview.role,
      type: interview.type,
      domain: interview.domain || '',
      subLanguage: interview.subLanguage || '',
      projectName: interview.projectName || '',
      projectDescription: interview.projectDescription || '',
      difficulty: interview.difficulty || 'Intermediate',
      questionNumber: questionNumber || 1,
      interviewStage: interviewStage || 'core',
      adaptiveState,
      lastEvaluation,
      duration: interview.duration,
      selectedTopics: interview.selectedTopics || [],
      technicalTrack: interview.technicalTrack || '',
      codingTrack: interview.codingTrack || '',
      systemDesignDomain: interview.systemDesignDomain || '',
      resumeText: interview.resumeText || '',
      resumeSkills: interview.resumeSkills || [],
      resumeProjects: interview.resumeProjects || [],
      resumeExperience: interview.resumeExperience || [],
      resumeEducation: interview.resumeEducation || [],
      resumeSnapshot: interview.resumeSnapshot || null,
    });

    res.write(`data: ${JSON.stringify({ type: 'ack', acknowledgement: result.acknowledgement, transition: result.transition })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'question', nextQuestion: result.nextQuestion, questionCategory: result.questionCategory, nextCategory: result.nextCategory, isFollowUp: result.isFollowUp, isClosing: result.isClosing })}\n\n`);

    if (req.body.saveAnswer !== false && userAnswer && questionAsked) {
      const lastSavedQ = interview.questions?.[interview.questions.length - 1];
      const isDuplicateTurnPush = lastSavedQ &&
        lastSavedQ.question === questionAsked &&
        lastSavedQ.userAnswer === (req.body.rawAnswer || userAnswer) &&
        lastSavedQ.createdAt &&
        (Date.now() - new Date(lastSavedQ.createdAt).getTime()) < 5000;

      if (!isDuplicateTurnPush) {
        const evalObj = result.evaluation || {
          score: Math.min(10, Math.max(1, Math.round((result.adaptiveState?.overallScore || 70) / 10))),
          feedback: result.acknowledgement || 'Response evaluated.',
          metrics: {
            technicalKnowledge: 7, problemSolving: 7, communication: 7, confidence: 7, accuracy: 7, logicalThinking: 7
          }
        };

        interview.questions.push({
          question: questionAsked,
          userAnswer: req.body.rawAnswer || userAnswer,
          aiFeedback: evalObj.feedback,
          score: evalObj.score,
          metrics: evalObj.metrics,
          speechStats: {
            speakingSpeed: 120,
            fillerWordsCount: 0,
            eyeContactScore: 85,
            voiceClarity: 90,
            grammarScore: 90
          },
          bookmarked: req.body.bookmarked || false
        });

        const totalScore = interview.questions.reduce((acc, curr) => acc + (curr.score || 0), 0);
        interview.score = Math.round((totalScore / interview.questions.length) * 10);
        if (result.adaptiveState?.difficultyLevel) {
          interview.difficulty = result.adaptiveState.difficultyLevel;
        }
      }
    }

    interview.adaptiveState = result.adaptiveState || adaptiveState;
    interview.markModified('adaptiveState');
    await interview.save();

    res.write(`data: ${JSON.stringify({ type: 'complete', result, overallScore: interview.score })}\n\n`);
    res.end();
  } catch (error) {
    console.error('streamConversationalResponse error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
};

const getMockReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }

    // Check if report already exists in DB (self-healing if report type mismatched interview.type)
    const isActuallyExtempore = /extempore/i.test(interview.type || '');
    const isActuallyGD = /group\s*discussion|\bgd\b/i.test(interview.type || '');
    let reportDoc = await Report.findOne({ interviewId: interview._id, userId: req.user._id });
    if (reportDoc && reportDoc.mockReport) {
      const mockData = reportDoc.mockReport.toObject ? reportDoc.mockReport.toObject() : reportDoc.mockReport;
      const mismatchedExtempore = Boolean(mockData.isExtempore) && !isActuallyExtempore;
      const mismatchedGD = Boolean(mockData.isGD) && !isActuallyGD;
      if (!mismatchedExtempore && !mismatchedGD) {
        return res.json({ ...mockData, _id: reportDoc._id, adaptiveState: interview.adaptiveState });
      }
    }

    // Generate archetype-appropriate report when missing or self-healing
    if (isActuallyExtempore) {
      const extReport = await generateExtemporeReport(interview, '', []);
      const overallScore = extReport.overallScore || 80;
      const commScore = extReport.categoryScores?.communication?.score || overallScore;
      const confScore = extReport.categoryScores?.confidence?.score || overallScore;
      reportDoc = await Report.findOneAndUpdate(
        { interviewId: interview._id, userId: req.user._id },
        {
          $set: {
            overallScore,
            technicalScore: extReport.categoryScores?.topicUnderstanding?.score || overallScore,
            communicationScore: commScore,
            confidenceScore: confScore,
            problemSolvingScore: extReport.categoryScores?.logicalThinking?.score || overallScore,
            hiringDecision: extReport.readiness || 'Recommended with Practice',
            mockReport: { ...extReport, isExtempore: true }
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.json({ ...extReport, _id: reportDoc._id, isExtempore: true });
    }

    if (isActuallyGD) {
      const gdEval = await generateGDEvaluationReport(interview, interview.questions || []);
      const overallScore = gdEval.overallScore || 75;
      const commScore = gdEval.categoryScores?.communication?.score || overallScore;
      const confScore = gdEval.categoryScores?.confidence?.score || overallScore;
      reportDoc = await Report.findOneAndUpdate(
        { interviewId: interview._id, userId: req.user._id },
        {
          $set: {
            overallScore,
            technicalScore: gdEval.categoryScores?.logicalThinking?.score || overallScore,
            communicationScore: commScore,
            confidenceScore: confScore,
            problemSolvingScore: gdEval.categoryScores?.leadership?.score || overallScore,
            hiringDecision: gdEval.placementReadiness || 'Recommended with Training',
            mockReport: { ...gdEval, isGD: true }
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.json({ ...gdEval, _id: reportDoc._id, isGD: true });
    }

    // Standard mock interview evidence report (HR, Technical, Coding, Resume, Behavioral, Project, System Design)
    const reportData = await generateMockEvidenceReport(interview);

    // Save report document to DB with upsert to prevent duplicate entries on retry
    const technical = reportData.scoringBreakdown?.find(c => /tech|algo|code|system/i.test(c.category))?.score;
    const communication = reportData.scoringBreakdown?.find(c => /comm|clarity|star/i.test(c.category))?.score;
    const confidence = reportData.scoringBreakdown?.find(c => /conf|owner|auth/i.test(c.category))?.score;
    const problemSolving = reportData.scoringBreakdown?.find(c => /problem|trade|scal|conflict/i.test(c.category))?.score;

    const updateFields = {
      overallScore: typeof reportData.overallScore === 'number' ? reportData.overallScore : 0,
      technicalScore: typeof technical === 'number' ? technical : (reportData.overallScore || 0),
      communicationScore: typeof communication === 'number' ? communication : (reportData.overallScore || 0),
      confidenceScore: typeof confidence === 'number' ? confidence : (reportData.overallScore || 0),
      problemSolvingScore: typeof problemSolving === 'number' ? problemSolving : (reportData.overallScore || 0),
      hiringDecision: reportData.finalDecision || 'Needs Improvement',
      mockReport: { ...reportData, adaptiveState: interview.adaptiveState }
    };

    reportDoc = await Report.findOneAndUpdate(
      { interviewId: interview._id, userId: req.user._id },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ...reportData, _id: reportDoc._id, adaptiveState: interview.adaptiveState });
  } catch (error) {
    console.error('getMockReport error:', error);
    res.status(500).json({ message: 'Failed to generate mock report', error: error.message });
  }
};

const setupGD = async (req, res) => {
  try {
    const { category, difficulty } = req.body;
    const topicData = await generateGDTopic(category || 'Random', difficulty || 'Intermediate');
    const participants = await generateGDParticipants(topicData.topic, difficulty || 'Intermediate');
    res.json({
      topicData,
      participants
    });
  } catch (error) {
    console.error('setupGD error:', error);
    res.status(500).json({ message: 'Failed to setup Group Discussion', error: error.message });
  }
};

const processGDTurn = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, participants, history, userResponse, timeRemaining, mode } = req.body;
    const turn = await generateGDTurn({
      topic,
      participants,
      history: history || [],
      userResponse: userResponse || '',
      timeRemaining: timeRemaining || '10:00',
      mode: mode || 'audio'
    });
    res.json(turn);
  } catch (error) {
    console.error('processGDTurn error:', error);
    res.status(500).json({ message: 'Failed to generate GD turn', error: error.message });
  }
};

const getGDReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { transcript } = req.body || {};
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    if (!/group\s*discussion|\bgd\b/i.test(interview.type || '')) {
      return res.status(400).json({ message: 'Session is not a Group Discussion interview' });
    }

    let reportDoc = await Report.findOne({ interviewId: interview._id, userId: req.user._id });
    const gdEval = await generateGDEvaluationReport(interview, transcript || interview.questions || []);

    const overallScore = gdEval.overallScore || 75;
    const commScore = gdEval.categoryScores?.communication?.score || overallScore;
    const confScore = gdEval.categoryScores?.confidence?.score || overallScore;

    if (reportDoc) {
      reportDoc.overallScore = overallScore;
      reportDoc.communicationScore = commScore;
      reportDoc.confidenceScore = confScore;
      reportDoc.mockReport = { ...gdEval, isGD: true };
      await reportDoc.save();
    } else {
      reportDoc = await Report.create({
        userId: req.user._id,
        interviewId: interview._id,
        overallScore,
        technicalScore: gdEval.categoryScores?.logicalThinking?.score || overallScore,
        communicationScore: commScore,
        confidenceScore: confScore,
        problemSolvingScore: gdEval.categoryScores?.leadership?.score || overallScore,
        hiringDecision: gdEval.placementReadiness || 'Recommended with Training',
        mockReport: { ...gdEval, isGD: true }
      });
    }

    res.json({ ...gdEval, _id: reportDoc._id, isGD: true });
  } catch (error) {
    console.error('getGDReport error:', error);
    res.status(500).json({ message: 'Failed to generate GD report', error: error.message });
  }
};

const setupExtempore = async (req, res) => {
  try {
    const { category } = req.body;
    const topicData = await generateExtemporeTopic(category || 'Random');
    res.json({ topicData });
  } catch (error) {
    console.error('setupExtempore error:', error);
    res.status(500).json({ message: 'Failed to setup Extempore round', error: error.message });
  }
};

const processExtemporeFollowup = async (req, res) => {
  try {
    const { topic, speechText } = req.body;
    const questions = await generateExtemporeCrossQuestions({ topic, speechText });
    res.json({ questions });
  } catch (error) {
    console.error('processExtemporeFollowup error:', error);
    res.status(500).json({ message: 'Failed to generate follow-up questions', error: error.message });
  }
};

const getExtemporeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { speechText, followUpQAs } = req.body || {};
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    if (!/extempore/i.test(interview.type || '')) {
      return res.status(400).json({ message: 'Session is not an Extempore interview' });
    }

    let reportDoc = await Report.findOne({ interviewId: interview._id, userId: req.user._id });
    const extReport = await generateExtemporeReport(interview, speechText || '', followUpQAs || []);

    const overallScore = extReport.overallScore || 80;
    const commScore = extReport.categoryScores?.communication?.score || overallScore;
    const confScore = extReport.categoryScores?.confidence?.score || overallScore;

    if (reportDoc) {
      reportDoc.overallScore = overallScore;
      reportDoc.communicationScore = commScore;
      reportDoc.confidenceScore = confScore;
      reportDoc.mockReport = { ...extReport, isExtempore: true };
      await reportDoc.save();
    } else {
      reportDoc = await Report.create({
        userId: req.user._id,
        interviewId: interview._id,
        overallScore,
        technicalScore: extReport.categoryScores?.topicUnderstanding?.score || overallScore,
        communicationScore: commScore,
        confidenceScore: confScore,
        problemSolvingScore: extReport.categoryScores?.logicalThinking?.score || overallScore,
        hiringDecision: extReport.readiness || 'Recommended with Practice',
        mockReport: { ...extReport, isExtempore: true }
      });
    }

    res.json({ ...extReport, _id: reportDoc._id, isExtempore: true });
  } catch (error) {
    console.error('getExtemporeReport error:', error);
    res.status(500).json({ message: 'Failed to generate Extempore report', error: error.message });
  }
};

const clarifyQuestion = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    const { currentQuestion } = req.body || {};
    const clarification = buildClarificationForQuestion({
      currentQuestion: currentQuestion || '',
      role: interview.role || 'Software Engineer'
    });
    return res.json({ clarification });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clarify question', error: error.message });
  }
};

router.post('/create', protect, createInterview);
router.get('/recent', protect, getRecentInterviews);
router.get('/:id', protect, getInterviewById);
router.post('/:id/question', protect, getNextQuestion);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/clarify', protect, clarifyQuestion);
router.post('/:id/conversational-response', protect, getConversationalResponse);
router.post('/:id/conversational-response-stream', protect, streamConversationalResponse);
router.post('/:id/mock-report', protect, getMockReport);
router.get('/:id/mock-report', protect, getMockReport);
router.post('/gd/topic', protect, setupGD);
router.post('/:id/gd-turn', protect, processGDTurn);
router.post('/:id/gd-report', protect, getGDReport);
router.post('/extempore/topic', protect, setupExtempore);
router.post('/:id/extempore-followup', protect, processExtemporeFollowup);
router.post('/:id/extempore-report', protect, getExtemporeReport);
router.put('/:id/finish', protect, finishInterview);
router.post('/:id/finish', protect, finishInterview);
router.put('/:id/bookmark', protect, bookmarkQuestion);

router.validateInterviewConfig = validateInterviewConfig;
router.VALID_ARCHETYPES = VALID_ARCHETYPES;
router.VALID_DIFFICULTIES = VALID_DIFFICULTIES;

module.exports = router;


