import express from "express";
import { HolidayControllers } from "./holiday.controller";
import { authenticateUser, authorizeSuperAdmin } from "../../middlewares/auth";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/.test(file.mimetype) || // .xlsx
      /application\/vnd\.ms-excel/.test(file.mimetype) || // .xls
      /text\/csv/.test(file.mimetype) ||
      /\.xlsx$|\.xls$|\.csv$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error("Only .xlsx, .xls, .csv are allowed"));
  },
});

// Create
router.post("/", authenticateUser, authorizeSuperAdmin, HolidayControllers.createHoliday);

// Read
router.get("/", authenticateUser, HolidayControllers.listHolidays);
router.get("/active", authenticateUser, HolidayControllers.listActive);
router.get("/range", authenticateUser, HolidayControllers.getByRange);
router.get("/template", authenticateUser, authorizeSuperAdmin, HolidayControllers.downloadTemplate);
router.get("/:id", authenticateUser, HolidayControllers.getById);

// Bulk (JSON)
router.post("/bulk", authenticateUser, authorizeSuperAdmin, HolidayControllers.bulkCreate);

// Bulk (Excel/CSV upload)
router.post(
  "/bulk-upload",
  authenticateUser,
  authorizeSuperAdmin,
  upload.single("file"),
  HolidayControllers.bulkUpload
);

// Update
router.patch("/:id", authenticateUser, authorizeSuperAdmin, HolidayControllers.updateHoliday);

// Delete (soft) and optional hard-delete
router.delete("/:id", authenticateUser, authorizeSuperAdmin, HolidayControllers.softDeleteHoliday);
router.delete("/:id/hard", authenticateUser, authorizeSuperAdmin, HolidayControllers.hardDeleteHoliday);

export const HolidayRoutes = router;
