import express from 'express';
import * as registrationController from '../controllers/registrationController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Participant-only registration endpoints
router.post('/', requireAuth, requireRole('participant'), registrationController.createRegistration);
router.get('/mine', requireAuth, requireRole('participant'), registrationController.getMyRegistrations);

export default router;
