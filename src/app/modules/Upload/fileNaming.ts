// // Employee File Naming
// export const generateNextFileName = (
//     entityName: string,
//     fileType: string,
//     extension: string
// ): string => {
//     const base = `${entityName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fileType}`;
//     const timestamp = Date.now();  // e.g. 169––
//     return `${base}-${timestamp}.${extension}`;
// };

// // Document File Nameing
// export const generateDocumentFileName = (
//     documentName: string,
//     tag: string,
//     extension: string
// ): string => {
//     const sanitizedDocName = documentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//     const sanitizedTag = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//     const date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
//     const randomSixDigit = Math.floor(100000 + Math.random() * 900000); // ensures 6-digit

//     return `${sanitizedDocName}-${sanitizedTag}-${date}-${randomSixDigit}.${extension}`;
// };

// // Notice File Naming 
// export const generateNoticeFileName = (
//   noticeTitle: string,
//   category: "department" | "all",
//   noticeType: string,
//   extension: string,
//   departmentName?: string
// ): string => {
//   const sanitizedTitle = noticeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//   const sanitizedType = noticeType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//   const base = category === "department"
//     ? `${sanitizedTitle}-department-${departmentName?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sanitizedType}`
//     : `${sanitizedTitle}-all-${sanitizedType}`;

//   const unique = Math.floor(100000 + Math.random() * 900000); // 6-digit random
//   const date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

//   return `${base}-${date}-${unique}.${extension}`;
// };



// modules/Upload/fileNaming.ts
export const generateNextFileName = (
  entityName: string,
  fileType: string,
  extension: string
): string => {
  const base = `${entityName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fileType}`;
  const timestamp = Date.now();
  return `${base}-${timestamp}.${extension}`;
};

export const generateDocumentFileName = (
  documentName: string,
  tag: string,
  extension: string
): string => {
  const sanitizedDocName = documentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const sanitizedTag = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const date = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const randomSixDigit = Math.floor(100000 + Math.random() * 900000); // 6-digit
  return `${sanitizedDocName}-${sanitizedTag}-${date}-${randomSixDigit}.${extension}`;
};

export const generateNoticeFileName = (
  noticeTitle: string,
  category: "department" | "all",
  noticeType: string,
  extension: string,
  departmentName?: string
): string => {
  const sanitizedTitle = noticeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const sanitizedType = noticeType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const base =
    category === "department"
      ? `${sanitizedTitle}-department-${departmentName?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sanitizedType}`
      : `${sanitizedTitle}-all-${sanitizedType}`;
  const unique = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toISOString().split("T")[0];
  return `${base}-${date}-${unique}.${extension}`;
};

/** NEW: Application Attachment File Name */
export const generateApplicationFileName = (
  applicantName: string,
  applicationType: string,
  extension: string,
  originalName?: string
): string => {
  const name = (applicantName || "applicant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const type = (applicationType || "application")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  // Optional: include a short hint of original file name (no spaces, short)
  const hint = (originalName || "")
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 20); // keep brief

  const date = new Date().toISOString().split("T")[0];
  const rnd = Math.floor(100000 + Math.random() * 900000);

  const mid = hint ? `${type}-${hint}` : type;
  return `${name}-${mid}-${date}-${rnd}.${extension}`;
};
