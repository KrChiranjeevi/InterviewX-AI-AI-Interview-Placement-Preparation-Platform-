const PrepCompany = require('../models/PrepCompany');
const PrepRole = require('../models/PrepRole');
const PrepRound = require('../models/PrepRound');
const PrepAttempt = require('../models/PrepAttempt');

// Get all companies
exports.getCompanies = async (req, res) => {
  try {
    const companies = await PrepCompany.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// Get single company by name (with its roles)
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await PrepCompany.findOne({ name: req.params.companyName });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    const roles = await PrepRole.find({ companyId: company._id });
    res.json({ company, roles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company details', error: error.message });
  }
};

// Get simulation pipeline (rounds) for a role
exports.getRolePipeline = async (req, res) => {
  try {
    const rounds = await PrepRound.find({ roleId: req.params.roleId }).sort({ roundIndex: 1 });
    res.json(rounds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role pipeline', error: error.message });
  }
};

// Fetch or create an attempt for a user and role
exports.getOrCreateAttempt = async (req, res) => {
  try {
    const { companyId, roleId } = req.body;
    let attempt = await PrepAttempt.findOne({ userId: req.user.id, roleId });

    if (!attempt) {
      attempt = new PrepAttempt({
        userId: req.user.id,
        companyId,
        roleId,
        currentRoundIndex: 0,
        scores: {},
        roundDetails: {}
      });
      await attempt.save();
    }
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching/creating attempt', error: error.message });
  }
};

// Update attempt after a round is completed
exports.submitRound = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { roundIndex, score, passed, details, isFinal, finalReport } = req.body;

    const attempt = await PrepAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to attempt' });
    }

    attempt.scores.set(String(roundIndex), score);
    attempt.roundDetails.set(String(roundIndex), details);

    if (passed) {
      attempt.currentRoundIndex = Math.max(attempt.currentRoundIndex, roundIndex + 1);
    }

    if (isFinal) {
      attempt.finalReport = finalReport;
    }

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting round', error: error.message });
  }
};

exports.resetAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await PrepAttempt.findById(attemptId);
    
    if (!attempt || attempt.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }

    attempt.currentRoundIndex = 0;
    attempt.scores = {};
    attempt.roundDetails = {};
    attempt.finalReport = null;

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting attempt', error: error.message });
  }
};
