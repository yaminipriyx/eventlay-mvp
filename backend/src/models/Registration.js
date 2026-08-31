import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a participant can only register once per event
registrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
