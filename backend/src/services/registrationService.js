import crypto from 'crypto';
import QRCode from 'qrcode';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';

export const registerForEvent = async (participantId, eventId) => {
  if (!eventId) {
    const err = new Error('Event ID is required.');
    err.statusCode = 400;
    throw err;
  }

  // 1. Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Check if event is published
  if (event.status !== 'published') {
    const err = new Error('Cannot register for an unpublished or draft event.');
    err.statusCode = 400;
    throw err;
  }

  // 3. Check if participant already registered
  const existingRegistration = await Registration.findOne({ eventId, participantId });
  if (existingRegistration) {
    // Return existing registration with generated QR data URL
    const qrDataUrl = await QRCode.toDataURL(existingRegistration.qrCode, {
      color: { dark: '#4A0E17', light: '#FFFFFF' },
      width: 300,
      margin: 2,
    });
    return {
      registration: existingRegistration,
      qrDataUrl,
      event,
      alreadyRegistered: true,
    };
  }

  // 4. Generate unique QR token
  const qrToken = `EVENTLAY-${crypto.randomUUID()}`;

  // 5. Generate QR Data URL
  const qrDataUrl = await QRCode.toDataURL(qrToken, {
    color: { dark: '#4A0E17', light: '#FFFFFF' },
    width: 300,
    margin: 2,
  });

  // 6. Save registration
  const registration = await Registration.create({
    eventId,
    participantId,
    qrCode: qrToken,
  });

  return {
    registration,
    qrDataUrl,
    event,
    alreadyRegistered: false,
  };
};

export const getParticipantRegistrations = async (participantId) => {
  const registrations = await Registration.find({ participantId })
    .populate({
      path: 'eventId',
      populate: { path: 'organizerId', select: 'name email' },
    })
    .sort({ registeredAt: -1 });

  // Enrich with generated QR data URL for each registration
  const enriched = await Promise.all(
    registrations.map(async (reg) => {
      const qrDataUrl = await QRCode.toDataURL(reg.qrCode, {
        color: { dark: '#4A0E17', light: '#FFFFFF' },
        width: 300,
        margin: 2,
      });
      return {
        ...reg.toObject(),
        qrDataUrl,
      };
    })
  );

  return enriched;
};

export const getEventRegistrations = async (eventId, organizerId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found.');
    err.statusCode = 404;
    throw err;
  }

  // Service-layer ownership verification
  if (event.organizerId.toString() !== organizerId.toString()) {
    const err = new Error('Forbidden: You can only view registrations for your own events.');
    err.statusCode = 403;
    throw err;
  }

  const registrations = await Registration.find({ eventId })
    .populate('participantId', 'name email')
    .sort({ registeredAt: -1 });

  return {
    event: {
      id: event._id,
      title: event.title,
      date: event.date,
      venue: event.venue,
    },
    registrations,
    totalCount: registrations.length,
  };
};
