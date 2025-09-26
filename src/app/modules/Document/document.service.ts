import { TDocument } from "./document.interface";
import { Document } from "./document.model";

const createDocument = async (payload: TDocument) => {
  return await Document.create(payload);
};

const updateDocument = async (id: string, payload: Partial<TDocument>) => {
  return await Document.findByIdAndUpdate(id, payload, { new: true });
};

const archiveDocument = async (id: string) => {
  return await Document.findByIdAndUpdate(id, { isArchived: true }, { new: true });
};

const unarchiveDocument = async (id: string) => {
  return await Document.findByIdAndUpdate(id, { isArchived: false }, { new: true });
};

const softDeleteDocument = async (id: string) => {
  return await Document.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

const hardDeleteDocument = async (id: string) => {
  return await Document.findByIdAndDelete(id);
};

const getAllDocuments = async () => {
  return await Document.find().populate({
    path: "uploaderId",
    populate: {
      path: "employeeId",
    },
  });
};

const getActiveDocuments = async () => {
  return await Document.find({ isDeleted: false, isArchived: false });
};

const getArchivedDocuments = async () => {
  return await Document.find({ isArchived: true, isDeleted: false });
};

const getSingleDocument = async (id: string) => {
  return await Document.findById(id);
};

export const DocumentServices = {
  createDocument,
  updateDocument,
  archiveDocument,
  unarchiveDocument,
  softDeleteDocument,
  hardDeleteDocument,
  getAllDocuments,
  getActiveDocuments,
  getArchivedDocuments,
  getSingleDocument,
};