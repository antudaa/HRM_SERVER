import express from "express";
import { authenticateUser } from "../../middlewares/auth";
import { ApplicationControllers as C } from "./application.controller";
import { validate } from "../../middlewares/validate";
import { AddCommentSchema, AdvanceStageSchema, CancelSchema, CreateApplicationSchema } from "./application.validation";
// import { CreateApplicationSchema, AddCommentSchema, AdvanceStageSchema, CancelSchema } from "./application.validation";

const router = express.Router();

router.post("/", authenticateUser,  C.createApplication);
router.post("/:id/comments", authenticateUser, validate(AddCommentSchema), C.addComment);
router.post("/:id/advance", authenticateUser, validate(AdvanceStageSchema), C.advanceStage);
router.post("/:id/cancel", authenticateUser, validate(CancelSchema), C.cancelApplication);

router.get("/", authenticateUser, C.listApplications);
router.get("/by-user/:userId/active", authenticateUser, C.getActiveByUser);
router.get("/by-approver/:approverId/pending", authenticateUser, C.getPendingForApprover);
router.get("/:id", authenticateUser, C.getApplicationById);

export const ApplicationRoutes = router;
