import express from 'express';
import { authenticateUser, authorizeSuperAdmin } from '../../middlewares/auth';
import { WorkShiftController } from './wrokShift.controller';

const router = express.Router();

// Create a new work shift
router.post(
  '/create',
  authenticateUser,
  authorizeSuperAdmin,
  WorkShiftController.createWorkShift
);

// Update a work shift by ID
router.patch(
  '/update/:id',
  authenticateUser,
  authorizeSuperAdmin,
  WorkShiftController.updateWorkShift
);

// Archive a work shift by ID
router.patch(
  '/archive/:id',
  authenticateUser,
  authorizeSuperAdmin,
  WorkShiftController.archivedWorkShift
);

// Unarchive a work shift by ID
router.patch(
  '/unarchive/:id',
  authenticateUser,
  authorizeSuperAdmin,
  WorkShiftController.unArchiveWorkShift
);

// Delete a work shift by ID
router.delete(
  '/delete/:id',
  authenticateUser,
  authorizeSuperAdmin,
  WorkShiftController.deleteWorkShift
);

// Get all work shifts
router.get(
  '/',
  authenticateUser,
  WorkShiftController.getAllWorkShift
);

// Get all active (non-archived) work shifts
router.get(
  '/active-shifts',
  authenticateUser,
  WorkShiftController.getActiveWorkShift
);

// Get all archived work shifts
router.get(
  '/archived-shifts',
  authenticateUser,
  WorkShiftController.getArchivedWorkShift
);

// Get a single work shift by ID
router.get(
  '/:id',
  authenticateUser,
  WorkShiftController.getWorkShiftByID
);

export const WorkShiftRoutes = router;
