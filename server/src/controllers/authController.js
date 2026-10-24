import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

export async function register(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
    }

    const existingUser = await User.exists({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    return res.status(200).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
