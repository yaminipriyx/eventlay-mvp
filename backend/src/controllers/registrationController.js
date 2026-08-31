import * as registrationService from '../services/registrationService.js';

export const createRegistration = async (req, res, next) => {
  try {
    const participantId = req.user.userId;
    const { eventId } = req.body;
    const result = await registrationService.registerForEvent(participantId, eventId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const participantId = req.user.userId;
    const registrations = await registrationService.getParticipantRegistrations(participantId);
    res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params; // eventId
    const organizerId = req.user.userId;
    const result = await registrationService.getEventRegistrations(id, organizerId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
