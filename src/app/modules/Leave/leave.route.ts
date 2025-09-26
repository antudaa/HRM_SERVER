// src/app/modules/Leave/leave.routes.ts
import { Router } from "express";
import { LeaveControllers as C } from "./leave.supserAdmin.controller";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";

const router = Router();

/**
 * Super Admin
 */
router.post(
  "/ledger/admin-adjust",
  authenticateUser,
  authorizeSuperAdmin,
  C.adminAdjustBalance
);

/**
 * Authenticated (employee/admin/etc.)
 */
router.get("/balances", authenticateUser, C.getLeaveBalances);
router.get("/ledger", authenticateUser, C.getLeaveLedger);

export const LeaveRoutes = router;
