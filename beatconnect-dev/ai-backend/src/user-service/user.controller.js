import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByUsername, getUserById, updateUserProfile, updateUserPassword, updateUserSubscription } from './user.repository.js';
import { getDailyReport } from '../media-service/report-service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'beatconnect-super-secret-key';

export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  await createUser(username, hash);
  res.status(201).json({ message: 'User registered successfully' });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  // Set HTTP-only cookie for secure browser sessions
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // Trigger daily report generation in background (do not await)
  getDailyReport().catch(err => console.error('[AUTH] Background report generation failed:', err));

  res.json({ token, message: 'Login successful', username: user.username, role: user.role });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username and new password are required' });
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  await updateUserPassword(username, hash);
  res.json({ message: 'Password reset successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, bio, favorite_genre, theme } = req.body;
  if (username) {
    const existingUser = await getUserByUsername(username);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ error: 'Username already taken' });
    }
  }

  const success = await updateUserProfile(req.user.id, { username, bio, favorite_genre, theme });
  if (success) {
    res.json({ message: 'Profile updated successfully', username: username || req.user.username });
  } else {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

export const upgradeToPro = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const success = await updateUserSubscription(userId, true);
  if (success) {
    console.log(`[SUBSCRIPTION] User ${userId} upgraded to PRO`);
    res.json({ message: 'Welcome to BeatConnect PRO! Voice Mode and exclusive features are now unlocked.', is_pro: true });
  } else {
    res.status(500).json({ error: 'Could not process upgrade. Please try again later.' });
  }
});
