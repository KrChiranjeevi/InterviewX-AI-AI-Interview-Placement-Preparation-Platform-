const User = require('../models/User');
const bcrypt = require('bcryptjs');

const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { 
      name, email, profileImage, targetRole, skills, interviewGoal,
      username, phone, bio, college, degree, graduationYear,
      portfolioUrl, githubUrl, linkedinUrl, resumeUrl, targetCompany,
      settings
    } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (skills !== undefined) user.skills = skills;
    if (interviewGoal !== undefined) user.interviewGoal = interviewGoal;
    
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (degree !== undefined) user.degree = degree;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (targetCompany !== undefined) user.targetCompany = targetCompany;

    if (settings) {
      if (!user.settings) user.settings = {};
      
      if (settings.appearance) {
        user.settings.appearance = { ...user.settings.appearance?.toObject(), ...settings.appearance };
        if (settings.appearance.themeMode) {
          user.theme = settings.appearance.themeMode === 'system' ? 'dark' : settings.appearance.themeMode;
        }
      }
      if (settings.aiPreferences) {
        user.settings.aiPreferences = { ...user.settings.aiPreferences?.toObject(), ...settings.aiPreferences };
      }
      if (settings.interviewSettings) {
        user.settings.interviewSettings = { ...user.settings.interviewSettings?.toObject(), ...settings.interviewSettings };
      }
      if (settings.codingSettings) {
        user.settings.codingSettings = { ...user.settings.codingSettings?.toObject(), ...settings.codingSettings };
      }
      if (settings.notifications) {
        user.settings.notifications = { ...user.settings.notifications?.toObject(), ...settings.notifications };
        if (settings.notifications.email !== undefined) {
          user.notificationsEnabled = settings.notifications.email;
        }
      }
      if (settings.privacySecurity) {
        user.settings.privacySecurity = { ...user.settings.privacySecurity?.toObject(), ...settings.privacySecurity };
      }
      if (settings.advanced) {
        user.settings.advanced = { ...user.settings.advanced?.toObject(), ...settings.advanced };
      }
    }
    
    await user.save();
    
    const userResponse = await User.findById(user._id).select('-password');
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

module.exports = { updateSettings, changePassword };
