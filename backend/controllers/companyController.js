const Company = require('../models/Company');
const { generateCompanyQuestion } = require('../services/aiService');

// @desc    Get all companies
// @route   GET /api/company/all
// @access  Private
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).select('-questions'); // Exclude specific questions for list
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get company by name
// @route   GET /api/company/:name
// @access  Private
const getCompanyByName = async (req, res) => {
  try {
    const company = await Company.findOne({ 
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } 
    });
    
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Start company interview (generate question)
// @route   POST /api/company/interview/start
// @access  Private
const startCompanyInterview = async (req, res) => {
  const { companyName, round, difficulty, history } = req.body;

  try {
    const question = await generateCompanyQuestion(companyName, round, difficulty || 'Medium', history || []);
    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCompanies,
  getCompanyByName,
  startCompanyInterview
};
