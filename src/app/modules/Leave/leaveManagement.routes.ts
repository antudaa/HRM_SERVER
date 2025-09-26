import express from "express";
import { LeaveTypeControllers as C } from "./leaveManagement.controller";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { CreateLeaveTypeSchema, UpdateLeaveTypeSchema } from "./leaveManagement.validation";

const router = express.Router();

/* ----------------------------- Mutations (Admin) ----------------------------- */
router.post("/", authenticateUser, authorizeSuperAdmin, validate(CreateLeaveTypeSchema), C.createLeaveType);
router.patch("/:id", authenticateUser, authorizeSuperAdmin, validate(UpdateLeaveTypeSchema), C.updateLeaveType);
router.patch("/:id/archive", authenticateUser, authorizeSuperAdmin, C.archivedLeaveType);
router.patch("/:id/unarchive", authenticateUser, authorizeSuperAdmin, C.unArchiveLeaveType);
router.patch("/:id/toggle-active", authenticateUser, authorizeSuperAdmin, C.toggleActive);
router.delete("/:id", authenticateUser, authorizeSuperAdmin, C.deleteLeaveType);

/* ----------------------------- Listings (Users) ------------------------------ */
router.get("/", authenticateUser, C.getLeaveTypes);
router.get("/all", authenticateUser, C.getAllLeaveType);
router.get("/active", authenticateUser, C.getActiveLeaveType);
router.get("/archived", authenticateUser, C.getArchiveLeaveType);

/* ----------------------------- Lookups (Users) ------------------------------- */
router.get("/code/:code", authenticateUser, C.getLeaveTypeByCode);
router.get("/availability/code", authenticateUser, C.isCodeAvailable);
router.get("/:id", authenticateUser, C.getLeaveTypeByID);

export const LeaveTypeRoutes = router;
