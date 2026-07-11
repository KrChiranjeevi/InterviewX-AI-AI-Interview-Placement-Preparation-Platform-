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
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const resumeText = data.text;

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const targetRole = req.body.targetRole || 'Software Engineer';
    const analysis = await analyzeResume(resumeText, targetRole);

    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: 'local_upload', // in real app, upload to cloudinary
      targetRole: targetRole,
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

router.post('/upload', protect, upload.single('resume'), uploadResume);

module.exports = router;
