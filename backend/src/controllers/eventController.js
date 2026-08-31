import * as eventService from '../services/eventService.js';

export const getPublishedEvents = async (req, res, next) => {
  try {
    const { search } = req.query;
    const events = await eventService.getPublishedEvents(search);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const organizerId = req.user.userId;
    const event = await eventService.createEvent(organizerId, req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.userId;
    const updated = await eventService.updateEvent(id, organizerId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.userId;
    const result = await eventService.deleteEvent(id, organizerId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const organizerId = req.user.userId;
    const events = await eventService.getOrganizerEvents(organizerId);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};
