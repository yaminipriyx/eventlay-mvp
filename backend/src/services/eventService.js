import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';

export const getPublishedEvents = async (searchQuery = '') => {
  const filter = { status: 'published' };
  if (searchQuery && searchQuery.trim() !== '') {
    filter.title = { $regex: searchQuery.trim(), $options: 'i' };
  }

  const events = await Event.find(filter)
    .populate('organizerId', 'name email')
    .sort({ date: 1 });

  return events;
};

export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate('organizerId', 'name email');
  if (!event) {
    const err = new Error('Event not found.');
    err.statusCode = 404;
    throw err;
  }
  return event;
};

export const createEvent = async (organizerId, { title, description, venue, date, bannerUrl, status }) => {
  if (!title || !description || !venue || !date) {
    const err = new Error('Title, description, venue, and date are required.');
    err.statusCode = 400;
    throw err;
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    venue: venue.trim(),
    date: new Date(date),
    bannerUrl: bannerUrl ? bannerUrl.trim() : '',
    organizerId,
    status: status === 'published' ? 'published' : 'draft',
  });

  return event;
};

export const updateEvent = async (eventId, organizerId, updateData) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found.');
    err.statusCode = 404;
    throw err;
  }

  // Service-layer ownership verification
  if (event.organizerId.toString() !== organizerId.toString()) {
    const err = new Error('Forbidden: You can only edit events you created.');
    err.statusCode = 403;
    throw err;
  }

  if (updateData.title !== undefined) event.title = updateData.title.trim();
  if (updateData.description !== undefined) event.description = updateData.description.trim();
  if (updateData.venue !== undefined) event.venue = updateData.venue.trim();
  if (updateData.date !== undefined) event.date = new Date(updateData.date);
  if (updateData.bannerUrl !== undefined) event.bannerUrl = updateData.bannerUrl.trim();
  if (updateData.status !== undefined && ['draft', 'published'].includes(updateData.status)) {
    event.status = updateData.status;
  }

  await event.save();
  return event;
};

export const deleteEvent = async (eventId, organizerId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found.');
    err.statusCode = 404;
    throw err;
  }

  // Service-layer ownership verification
  if (event.organizerId.toString() !== organizerId.toString()) {
    const err = new Error('Forbidden: You can only delete events you created.');
    err.statusCode = 403;
    throw err;
  }

  await Event.findByIdAndDelete(eventId);
  // Clean up registrations for deleted event
  await Registration.deleteMany({ eventId });

  return { message: 'Event successfully deleted.' };
};

export const getOrganizerEvents = async (organizerId) => {
  const events = await Event.find({ organizerId }).sort({ createdAt: -1 });

  // Attach registration counts
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const registrationCount = await Registration.countDocuments({ eventId: event._id });
      return {
        ...event.toObject(),
        registrationCount,
      };
    })
  );

  return eventsWithCounts;
};
