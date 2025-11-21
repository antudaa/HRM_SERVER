// // modules/FileUpload/fileUpload.route.ts
// import express from "express";
// // import { upload } from "../../utils/fileUpload";
// import { DocumentFileUploadController, FileUploadController, NoticeFileUploadController } from "./FileUploadController";
// // import { FileUploadController } from "./FileUploadController";

// const router = express.Router();

// // POST /api/v1/file/upload
// router.post("/employeedata", ...FileUploadController);

// // Document uploads
// router.post("/documentdata", ...DocumentFileUploadController);

// // Notice Attachment Uploads 
// router.post("/noticedata", ...NoticeFileUploadController);

// router.post("/applicationdata", ...NoticeFileUploadController);

// export const FileUploadRoutes = router;







// modules/FileUpload/fileUpload.route.ts
import express from "express";
import {
  DocumentFileUploadController,
  FileUploadController,
  NoticeFileUploadController,
  ApplicationFileUploadController,
} from "./FileUploadController";

const router = express.Router();

// Employee assets
router.post("/employeedata", ...FileUploadController);

// Document uploads
router.post("/documentdata", ...DocumentFileUploadController);

// Notice attachments
router.post("/noticedata", ...NoticeFileUploadController);

// NEW: Application attachments
router.post("/applicationdata", ...ApplicationFileUploadController);

export const FileUploadRoutes = router;
