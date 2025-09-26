// import { Request, Response } from "express";
// import multer from "multer";
// import catchAsync from "../../utils/catchAsync";
// import { uploadToCPanel } from "../../utils/fileUpload";
// import { generateDocumentFileName, generateNextFileName, generateNoticeFileName } from "./fileNaming";
// // import { generateNextFileName } from "./fileNaming";

// const upload = multer({ storage: multer.memoryStorage() });

// export const FileUploadController = [
//     upload.single("file"),
//     catchAsync(async (req: Request, res: Response) => {
//         const file = req.file;

//         const { entityName, fileType, module } = req.body;

//         if (!file || !entityName || !fileType || !module) {
//             return res.status(400).json({
//                 message: "Missing file, entityName, fileType, or module",
//             });
//         }
//         console.log(file);
//         const ext = file.originalname.split(".").pop()!;
//         const fileName = generateNextFileName(entityName, fileType, ext);
//         console.log(file.buffer, fileName, module);
//         const publicUrl = await uploadToCPanel(file.buffer, fileName, module);

//         return res.status(200).json({
//             message: "File uploaded successfully",
//             fileUrl: publicUrl,
//         });
//     }),
// ];


// // Document File Upload Controller
// export const DocumentFileUploadController = [
//     upload.single("file"),
//     catchAsync(async (req: Request, res: Response) => {
//         const file = req.file;
//         const { documentName, tag, module } = req.body;

//         if (!file || !documentName || !tag || !module) {
//             return res.status(400).json({
//                 message: "Missing file, documentName, tag, or module",
//             });
//         }

//         const ext = file.originalname.split(".").pop()!;
//         const fileName = generateDocumentFileName(documentName, tag, ext);
//         const publicUrl = await uploadToCPanel(file.buffer, fileName, module);

//         return res.status(200).json({
//             message: "Document file uploaded successfully",
//             fileUrl: publicUrl,
//         });
//     }),
// ];

// // Notice File Upload Controller
// export const NoticeFileUploadController = [
//     upload.single("file"),
//     catchAsync(async (req: Request, res: Response) => {
//         const file = req.file;
//         const { noticeTitle, noticeType, category, module, departmentName } = req.body;

//         if (!file || !noticeTitle || !noticeType || !category || !module) {
//             return res.status(400).json({
//                 message: "Missing file, noticeTitle, noticeType, category, or module",
//             });
//         }

//         const ext = file.originalname.split(".").pop()!;
//         const fileName = generateNoticeFileName(noticeTitle, category, noticeType, ext, departmentName);
//         const publicUrl = await uploadToCPanel(file.buffer, fileName, module);

//         return res.status(200).json({
//             message: "Notice file uploaded successfully",
//             fileUrl: publicUrl,
//         });
//     }),
// ];













// modules/Upload/FileUploadController.ts
import { Request, Response } from "express";
import multer from "multer";
import catchAsync from "../../utils/catchAsync";
import { uploadToCPanel } from "../../utils/fileUpload";
import {
  generateDocumentFileName,
  generateNextFileName,
  generateNoticeFileName,
  generateApplicationFileName, // <-- NEW
} from "./fileNaming";

const upload = multer({ storage: multer.memoryStorage() });

/** Generic employee data */
export const FileUploadController = [
  upload.single("file"),
  catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const { entityName, fileType, module } = req.body;
    if (!file || !entityName || !fileType || !module) {
      return res.status(400).json({ message: "Missing file, entityName, fileType, or module" });
    }
    const ext = file.originalname.split(".").pop()!;
    const fileName = generateNextFileName(entityName, fileType, ext);
    const publicUrl = await uploadToCPanel(file.buffer, fileName, module);
    return res.status(200).json({ message: "File uploaded successfully", fileUrl: publicUrl });
  }),
];

/** Document uploads */
export const DocumentFileUploadController = [
  upload.single("file"),
  catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const { documentName, tag, module } = req.body;
    if (!file || !documentName || !tag || !module) {
      return res.status(400).json({ message: "Missing file, documentName, tag, or module" });
    }
    const ext = file.originalname.split(".").pop()!;
    const fileName = generateDocumentFileName(documentName, tag, ext);
    const publicUrl = await uploadToCPanel(file.buffer, fileName, module);
    return res.status(200).json({ message: "Document file uploaded successfully", fileUrl: publicUrl });
  }),
];

/** Notice attachments */
export const NoticeFileUploadController = [
  upload.single("file"),
  catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const { noticeTitle, noticeType, category, module, departmentName } = req.body;
    if (!file || !noticeTitle || !noticeType || !category || !module) {
      return res.status(400).json({ message: "Missing file, noticeTitle, noticeType, category, or module" });
    }
    const ext = file.originalname.split(".").pop()!;
    const fileName = generateNoticeFileName(noticeTitle, category, noticeType, ext, departmentName);
    const publicUrl = await uploadToCPanel(file.buffer, fileName, module);
    return res.status(200).json({ message: "Notice file uploaded successfully", fileUrl: publicUrl });
  }),
];

/** NEW: Application attachments (used by ApplicationForm) */
export const ApplicationFileUploadController = [
  upload.single("file"),
  catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const { applicantName, applicationType, module } = req.body;

    if (!file || !applicantName || !applicationType || !module) {
      return res.status(400).json({
        message: "Missing file, applicantName, applicationType, or module",
      });
    }

    const ext = file.originalname.split(".").pop()!;
    const fileName = generateApplicationFileName(
      String(applicantName),
      String(applicationType),
      ext,
      file.originalname
    );

    const publicUrl = await uploadToCPanel(file.buffer, fileName, module);
    return res.status(200).json({
      message: "Application attachment uploaded successfully",
      fileUrl: publicUrl,
    });
  }),
];
