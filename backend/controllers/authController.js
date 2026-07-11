const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user (email/password)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.authProvider === 'google') {
        return res.status(400).json({
          message: 'This email is registered via Google. Please use "Continue with Google" to sign in.',
        });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, authProvider: 'local' });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token (email/password)
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block password login for Google-only accounts
    if (user.authProvider === 'google') {
      return res.status(401).json({
        message: 'This account uses Google Sign-In. Please click "Continue with Google".',
      });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Google OAuth — verify ID token or access_token via Google, create/login user
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google token is required' });
  }

  try {
    let payload = null;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: (process.env.GOOGLE_CLIENT_ID || '').trim(),
      });
      payload = ticket.getPayload();
    } catch (jwtError) {
      // 2. Fallback to access_token verify via Google userinfo API
      let googleRes;
      try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
        googleRes = await fetchFn('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${credential}` },
        });
      } catch (e) {
        throw new Error('ID Token verification failed, and fetch fallback failed: ' + e.message);
      }
      
      if (googleRes && googleRes.ok) {
        payload = await googleRes.json();
      } else {
        throw new Error('Token is neither a valid ID Token nor a valid Access Token');
      }
    }

    // ✅ Google must confirm email is verified — blocks unverified/fake accounts
    if (!payload || !payload.email_verified) {
      return res.status(401).json({ message: 'Your Google account email is not verified by Google.' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(401).json({ message: 'Could not retrieve email from Google account.' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Link Google to existing local account (first-time Google login)
      if (!user.googleId) {
        user.googleId    = googleId;
        user.authProvider = 'google';
        if (picture && !user.profileImage) user.profileImage = picture;
        await user.save();
      }
    } else {
      // Brand-new user from Google
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        profileImage: picture || '',
        password: null,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ message: `Google auth failed: ${error.message}` });
  }
};

module.exports = { registerUser, authUser, googleAuth };
