const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/aiService');

const upload = multer({ dest: 'uploads/' });

const uploadResume = async (req, res) => {
  console.log("=== INCOMING RESUME UPLOAD ===");
  try {
    if (!req.file) {
      console.log("Error: No file uploaded in req");
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log("Uploaded file path:", req.file.path, "Size:", req.file.size);

    const dataBuffer = fs.readFileSync(req.file.path);
    console.log("Read file buffer successfully. Parsing PDF...");
    const data = await pdfParse(dataBuffer);
    const resumeText = data.text;
    console.log("PDF parsed successfully. Characters extracted:", resumeText?.length);

    // Clean up temp file
    fs.unlinkSync(req.file.path);
    console.log("Cleaned up temp file");

    const targetRole = req.body.targetRole || 'Software Engineer';
    const targetCompany = req.body.targetCompany || 'General ATS';
    console.log("Target role:", targetRole, "Target company:", targetCompany);

    console.log("Calling analyzeResume...");
    const analysis = await analyzeResume(resumeText, targetRole, targetCompany);
    console.log("analyzeResume complete. Score:", analysis.score);

    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: 'local_upload', // in real app, upload to cloudinary
      targetRole: targetRole,
      targetCompany: targetCompany,
      personalInfo: analysis.personalInfo || {},
      education: analysis.education || [],
      experience: analysis.experience || [],
      projects: analysis.projects || [],
      internships: analysis.internships || [],
      skills: analysis.skills || {},
      certificates: analysis.certificates || [],
      achievements: analysis.achievements || [],
      training: analysis.training || [],
      scoringBreakdown: analysis.scoringBreakdown || {},
      skillMatchLevel: analysis.skillMatchLevel || 'Average',
      formattingAnalysis: analysis.formattingAnalysis || {},
      hiringReadiness: analysis.hiringReadiness || {},
      practiceQuestions: analysis.practiceQuestions || [],
      resumeSummary: analysis.resumeSummary || '',
      skillsFound: analysis.skillsFound || [],
      missingSkills: analysis.missingSkills || [],
      score: analysis.score || 0,
      aiSuggestions: analysis.aiSuggestions || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      formattingIssues: analysis.formattingIssues || [],
      resumeStructure: analysis.resumeStructure || '',
      projectQuality: analysis.projectQuality || '',
      experienceAnalysis: analysis.experienceAnalysis || '',
      educationAnalysis: analysis.educationAnalysis || '',
      certificationsAnalysis: analysis.certificationsAnalysis || '',
      keywordDensity: analysis.keywordDensity || '',
      recommendations: analysis.recommendations || [],
      matchedKeywords: analysis.matchedKeywords || [],
      priorityKeywords: analysis.priorityKeywords || [],
      recommendedSkills: analysis.recommendedSkills || [],
      skillMatchPercentage: analysis.skillMatchPercentage || 0,
      companyCompatibility: analysis.companyCompatibility || [],
      resumeText: resumeText,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const reanalyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole, targetCompany } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'No resume text provided' });
    }

    const analysis = await analyzeResume(resumeText, targetRole, targetCompany);

    const updatedResume = await Resume.findOneAndUpdate(
      { userId: req.user._id, resumeText: resumeText },
      {
        targetRole,
        targetCompany,
        personalInfo: analysis.personalInfo || {},
        education: analysis.education || [],
        experience: analysis.experience || [],
        projects: analysis.projects || [],
        internships: analysis.internships || [],
        skills: analysis.skills || {},
        certificates: analysis.certificates || [],
        achievements: analysis.achievements || [],
        training: analysis.training || [],
        scoringBreakdown: analysis.scoringBreakdown || {},
        skillMatchLevel: analysis.skillMatchLevel || 'Average',
        formattingAnalysis: analysis.formattingAnalysis || {},
        hiringReadiness: analysis.hiringReadiness || {},
        practiceQuestions: analysis.practiceQuestions || [],
        resumeSummary: analysis.resumeSummary || '',
        skillsFound: analysis.skillsFound || [],
        missingSkills: analysis.missingSkills || [],
        score: analysis.score || 0,
        aiSuggestions: analysis.aiSuggestions || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        formattingIssues: analysis.formattingIssues || [],
        resumeStructure: analysis.resumeStructure || '',
        projectQuality: analysis.projectQuality || '',
        experienceAnalysis: analysis.experienceAnalysis || '',
        educationAnalysis: analysis.educationAnalysis || '',
        certificationsAnalysis: analysis.certificationsAnalysis || '',
        keywordDensity: analysis.keywordDensity || '',
        recommendations: analysis.recommendations || [],
        matchedKeywords: analysis.matchedKeywords || [],
        priorityKeywords: analysis.priorityKeywords || [],
        recommendedSkills: analysis.recommendedSkills || [],
        skillMatchPercentage: analysis.skillMatchPercentage || 0,
        companyCompatibility: analysis.companyCompatibility || [],
      },
      { new: true, upsert: true }
    );

    res.json(updatedResume);
  } catch (error) {
    console.error("REANALYZE ERROR:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/reanalyze', protect, reanalyzeResume);

module.exports = router;
