// user.route.ts
import express, { Request, Response } from "express";
import { UserController } from "./user.controller";
import requestValidator from "../../middlewares/validateRequest";
import { superAdminZodSchema } from "../SuperAdmin/superadmin.validation";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";
import { adminZodSchema } from "../Admin/admin.validation";

const router = express.Router();

router.post("/", (_req: Request, res: Response) => {
  res.send(`Welcome to HRM_V2.0 Server 😎`);
});

/* ------- creation flows (superadmin only) ------- */
router.post(
  "/create-superadmin",
  authenticateUser,
  authorizeSuperAdmin,
  requestValidator(superAdminZodSchema),
  UserController.createSuperAdminIntoDB
);

router.post(
  "/create-admin",
  authenticateUser,
  authorizeSuperAdmin,
  requestValidator(adminZodSchema),
  UserController.createAdminIntoDB
);

router.post(
  "/create-employee",
  authenticateUser,
  authorizeSuperAdmin,
  UserController.createEmployeeIntoDB
);

// (placeholders)
router.post("/create-hr", authenticateUser, authorizeSuperAdmin, (_req, res) =>
  res.status(501).send("Not implemented")
);
router.post(
  "/create-manager",
  authenticateUser,
  authorizeSuperAdmin,
  (_req, res) => res.status(501).send("Not implemented")
);

/* --------------- reads --------------- */
router.get("/currentuser", authenticateUser, UserController.getCurrentUserFromDB);
router.get("/", authenticateUser, UserController.getAllUserInfo);
router.get("/active", authenticateUser, UserController.getActiveUsersInfo);
router.get("/:id", authenticateUser, UserController.getUserById);

/* --------------- deletes --------------- */
router.delete(
  "/soft-delete/:id",
  authenticateUser,
  authorizeSuperAdmin,
  UserController.softDeleteUser
);

router.delete(
  "/delete/:id",
  authenticateUser,
  authorizeSuperAdmin,
  UserController.deleteUserData
);

export default router;
