const User = require('../models/User');
const bcrypt = require('bcryptjs');

const updateSettings = async (req, res) => {
  try {
    const { theme, notificationsEnabled } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (theme) user.theme = theme;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
    
    await user.save();
    
    res.json({
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled
    });
  } catch (error) {
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
