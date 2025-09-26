import express from "express";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { CreateTemplateSchema, UpdateTemplateSchema, RenderTemplateSchema } from "./applicationTemplate.validation";
import { ApplicationTemplateControllers as C } from "./applicationTemplate.controller";

const router = express.Router();

// Admin manage
router.post("/", authenticateUser, authorizeSuperAdmin, validate(CreateTemplateSchema), C.create);
router.patch("/:id", authenticateUser, authorizeSuperAdmin, validate(UpdateTemplateSchema), C.update);

// Browse / fetch
router.get("/", authenticateUser, C.list);
router.get("/type/:type", authenticateUser, C.getActiveByType);
router.get("/:id", authenticateUser, C.getById);

// Render preview
router.post("/:id/render", authenticateUser, validate(RenderTemplateSchema), C.render);

export const ApplicationTemplateRoutes = router;
