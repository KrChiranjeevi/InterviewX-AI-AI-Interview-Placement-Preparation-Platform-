const Report = require('../models/Report');
const Interview = require('../models/Interview');
const { generateReport } = require('../services/aiService');

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id }).populate('interviewId', 'type role difficulty status createdAt');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getReportByInterviewId = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    // Check if report already exists
    let report = await Report.findOne({ interviewId, userId: req.user._id }).populate('interviewId');
    
    if (report) {
      return res.json(report);
    }
    
    // Fetch interview data
    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Verify if there is sufficient data (must have at least one question)
    if (!interview.questions || interview.questions.length === 0) {
      return res.status(400).json({ message: 'Insufficient data to generate a hiring decision.' });
    }
    
    // Generate new report using AI
    const aiReport = await generateReport({
      role: interview.role,
      type: interview.type,
      difficulty: interview.difficulty,
      questions: interview.questions
    });
    
    report = await Report.create({
      userId: req.user._id,
      interviewId: interview._id,
      overallScore: aiReport.overallScore || 0,
      technicalScore: aiReport.technicalScore || 0,
      communicationScore: aiReport.communicationScore || 0,
      confidenceScore: aiReport.confidenceScore || 0,
      problemSolvingScore: aiReport.problemSolvingScore || 0,
      hiringDecision: aiReport.hiringDecision || 'Not Selected',
      questionsAsked: aiReport.questionsAsked || 0,
      questionsAttempted: aiReport.questionsAttempted || 0,
      questionsSkipped: aiReport.questionsSkipped || 0,
      correctResponses: aiReport.correctResponses || 0,
      incorrectResponses: aiReport.incorrectResponses || 0,
      technicalReason: aiReport.technicalReason || '',
      communicationReason: aiReport.communicationReason || '',
      confidenceReason: aiReport.confidenceReason || '',
      overallReason: aiReport.overallReason || '',
      strengths: aiReport.strengths || [],
      weakness: aiReport.weakness || [],
      suggestions: aiReport.suggestions || [],
      companyReadiness: aiReport.companyReadiness || [],
      feedbackCards: aiReport.feedbackCards || [],
      careerCoach: aiReport.careerCoach || {},
      codeAnalysis: aiReport.codeAnalysis || {},
      questions: interview.questions.map(q => ({
        question: q.question,
        userAnswer: q.userAnswer,
        aiFeedback: q.aiFeedback,
        score: q.score,
        metrics: q.metrics ? {
          technicalKnowledge: q.metrics.technicalKnowledge,
          problemSolving: q.metrics.problemSolving,
          communication: q.metrics.communication,
          confidence: q.metrics.confidence,
          accuracy: q.metrics.accuracy,
          logicalThinking: q.metrics.logicalThinking
        } : undefined,
        speechStats: q.speechStats ? {
          speakingSpeed: q.speechStats.speakingSpeed,
          fillerWordsCount: q.speechStats.fillerWordsCount,
          eyeContactScore: q.speechStats.eyeContactScore,
          voiceClarity: q.speechStats.voiceClarity,
          grammarScore: q.speechStats.grammarScore
        } : undefined,
        bookmarked: q.bookmarked || false
      }))
    });
    
    // The front-end expects `improvedAnswer` too, we could store it or just return it. 
    // Let's add it to the report object returned to the frontend.
    const reportObj = report.toObject();
    reportObj.improvedAnswer = aiReport.improvedAnswer;
    reportObj.interviewId = interview; // populate it
    
    res.status(201).json(reportObj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const askReportMentor = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { message, history } = req.body;
    
    const report = await Report.findOne({ _id: reportId, userId: req.user._id }).populate('interviewId');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const { askMentor } = require('../services/aiService');
    const responseText = await askMentor(message, report, history || []);
    
    res.json({ response: responseText });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getReports, getReportByInterviewId, askReportMentor };
