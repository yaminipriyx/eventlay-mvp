import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['organizer', 'participant'],
    default: 'participant',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model('User', userSchema);
