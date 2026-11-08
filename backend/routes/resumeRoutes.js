const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/aiService');

const upload = multer({ dest: 'uploads/' });

const extractTextFromFile = async (filePath, originalName, mimeType) => {
  const ext = (originalName || '').split('.').pop().toLowerCase();
  const dataBuffer = fs.readFileSync(filePath);

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } else if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value || '';
  } else if (ext === 'txt' || mimeType === 'text/plain') {
    return dataBuffer.toString('utf-8');
  } else {
    // Try pdfParse first, fallback to mammoth
    try {
      const data = await pdfParse(dataBuffer);
      if (data.text && data.text.trim().length > 50) return data.text;
    } catch {}
    try {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      if (result.value && result.value.trim().length > 50) return result.value;
    } catch {}
    throw new Error('Unsupported file format. Please upload a text-readable PDF (.pdf) or Word document (.docx).');
  }
};

const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF or DOCX resume.' });
    }

    let resumeText = '';
    try {
      resumeText = await extractTextFromFile(req.file.path, req.file.originalname, req.file.mimetype);
    } catch (parseErr) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: parseErr.message || 'Failed to read document.' });
    } finally {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    const trimmedText = (resumeText || '').trim();
    if (trimmedText.length < 50) {
      return res.status(400).json({
        message: 'Unable to extract readable text from this document. The file may be empty, image-only (scanned), or corrupted. Please upload a text-readable PDF or DOCX.'
      });
    }

    // Call analyzeResume to extract structured entities
    const analysis = await analyzeResume(trimmedText, req.body.targetRole || 'Software Engineer', 'General ATS');

    // Flatten skills from categories into a unified list
    const skillsList = [];
    if (analysis.skills && typeof analysis.skills === 'object') {
      Object.values(analysis.skills).forEach(val => {
        if (Array.isArray(val)) skillsList.push(...val);
      });
    }
    if (analysis.skillsFound && Array.isArray(analysis.skillsFound)) {
      skillsList.push(...analysis.skillsFound);
    }
    const uniqueSkills = [...new Set(skillsList.map(s => String(s).trim()).filter(Boolean))];

    // Persist to Resume collection so it can be re-used
    const savedResume = await Resume.create({
      userId: req.user._id,
      fileUrl: req.file.originalname,
      targetRole: req.body.targetRole || 'Software Engineer',
      personalInfo: analysis.personalInfo || {},
      education: analysis.education || [],
      experience: analysis.experience || [],
      projects: analysis.projects || [],
      internships: analysis.internships || [],
      skills: analysis.skills || {},
      certificates: analysis.certificates || [],
      achievements: analysis.achievements || [],
      resumeSummary: analysis.resumeSummary || '',
      skillsFound: uniqueSkills,
      score: analysis.score || 75,
      resumeText: trimmedText,
    });

    res.json({
      success: true,
      resumeId: savedResume._id,
      filename: req.file.originalname,
      resumeText: trimmedText,
      candidateName: analysis.personalInfo?.name || '',
      email: analysis.personalInfo?.email || '',
      skills: uniqueSkills,
      projects: analysis.projects || [],
      experience: analysis.experience || [],
      internships: analysis.internships || [],
      education: analysis.education || [],
      certifications: analysis.certificates || [],
      wordCount: trimmedText.split(/\s+/).length,
      snapshot: {
        candidateName: analysis.personalInfo?.name || '',
        skills: uniqueSkills,
        projects: analysis.projects || [],
        experience: analysis.experience || [],
        education: analysis.education || [],
        certifications: analysis.certificates || [],
        summary: analysis.resumeSummary || ''
      }
    });
  } catch (error) {
    console.error('PARSE RESUME ERROR:', error);
    res.status(500).json({ message: 'Error parsing resume', error: error.message });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving resumes', error: error.message });
  }
};

const selectExistingResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume || !resume.resumeText || resume.resumeText.trim().length < 50) {
      return res.status(404).json({ message: 'Selected resume has insufficient text or was not found.' });
    }

    const skillsList = [];
    if (resume.skills && typeof resume.skills === 'object') {
      Object.values(resume.skills).forEach(val => {
        if (Array.isArray(val)) skillsList.push(...val);
      });
    }
    if (resume.skillsFound && Array.isArray(resume.skillsFound)) {
      skillsList.push(...resume.skillsFound);
    }
    const uniqueSkills = [...new Set(skillsList.map(s => String(s).trim()).filter(Boolean))];

    res.json({
      success: true,
      resumeId: resume._id,
      filename: resume.fileUrl || 'selected_resume.pdf',
      resumeText: resume.resumeText,
      candidateName: resume.personalInfo?.name || '',
      email: resume.personalInfo?.email || '',
      skills: uniqueSkills,
      projects: resume.projects || [],
      experience: resume.experience || [],
      internships: resume.internships || [],
      education: resume.education || [],
      certifications: resume.certificates || [],
      wordCount: resume.resumeText.split(/\s+/).length,
      snapshot: {
        candidateName: resume.personalInfo?.name || '',
        skills: uniqueSkills,
        projects: resume.projects || [],
        experience: resume.experience || [],
        education: resume.education || [],
        certifications: resume.certificates || [],
        summary: resume.resumeSummary || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error selecting resume', error: error.message });
  }
};

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
router.post('/parse', protect, upload.single('resume'), parseResume);
router.get('/my-resumes', protect, getMyResumes);
router.post('/select-existing', protect, selectExistingResume);

module.exports = router;
