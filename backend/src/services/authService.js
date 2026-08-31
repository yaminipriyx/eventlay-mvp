import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'eventlay_super_secret_jwt_key_2026_mvp_aws_deployable';

export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    const err = new Error('All fields (name, email, password, role) are required.');
    err.statusCode = 400;
    throw err;
  }

  if (!['organizer', 'participant'].includes(role)) {
    const err = new Error('Invalid role. Allowed roles: organizer, participant.');
    err.statusCode = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const err = new Error('User with this email already exists.');
    err.statusCode = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
  });

  const token = jwt.sign(
    { userId: user._id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error('Email and password are required.');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
