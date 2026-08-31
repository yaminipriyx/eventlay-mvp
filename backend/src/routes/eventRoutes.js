import express from 'express';
import * as eventController from '../controllers/eventController.js';
import * as registrationController from '../controllers/registrationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', eventController.getPublishedEvents);
router.get('/organizer/mine', requireAuth, requireRole('organizer'), eventController.getMyEvents);
router.get('/:id', eventController.getEventById);

// Organizer-only event management
router.post('/', requireAuth, requireRole('organizer'), eventController.createEvent);
router.put('/:id', requireAuth, requireRole('organizer'), eventController.updateEvent);
router.delete('/:id', requireAuth, requireRole('organizer'), eventController.deleteEvent);

// Organizer-only event registrations view
router.get('/:id/registrations', requireAuth, requireRole('organizer'), registrationController.getEventRegistrations);

export default router;
