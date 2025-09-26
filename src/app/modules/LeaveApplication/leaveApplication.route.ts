// import express from "express";
// import { authenticateUser } from "../../middlewares/auth";
// import { ApplicationControllers as C } from "./leaveApplication.controller";

// const router = express.Router();

// router.post("/", authenticateUser, C.createApplication);

// router.post("/:id/comments", authenticateUser, C.addComment);
// router.post("/:id/advance", authenticateUser, C.advanceStage);
// router.post("/:id/cancel", authenticateUser, C.cancelApplication);

// router.get("/", authenticateUser, C.listApplications);
// router.get("/by-user/:userId/active", authenticateUser, C.getActiveByUser);
// router.get("/by-approver/:approverId/pending", authenticateUser, C.getPendingForApprover);
// router.get("/:id", authenticateUser, C.getApplicationById);

// export const ApplicationRoutes = router;
