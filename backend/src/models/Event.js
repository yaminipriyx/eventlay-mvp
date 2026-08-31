import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  bannerUrl: {
    type: String,
    default: '',
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Event = mongoose.model('Event', eventSchema);
