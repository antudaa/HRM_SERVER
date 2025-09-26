import { TGeneralNotice } from "./notice.interface";
import { Notice } from "./notice.model";

const createNotice = async (payload: TGeneralNotice) => {
  return await Notice.create(payload);
};

const getAllNotices = async () => {
  return await Notice.find();
};

const getActiveNotices = async () => {
  return await Notice.find({ isArchived: false });
};

const getArchivedNotices = async () => {
  return await Notice.find({ isArchived: true });
};

const getNoticeById = async (id: string) => {
  return await Notice.findById(id);
};

const updateNotice = async (id: string, payload: Partial<TGeneralNotice>) => {
  return await Notice.findByIdAndUpdate(id, payload, { new: true });
};

const archiveNotice = async (id: string) => {
  return await Notice.findByIdAndUpdate(id, { isArchived: true }, { new: true });
};

const unarchiveNotice = async (id: string) => {
  return await Notice.findByIdAndUpdate(id, { isArchived: false }, { new: true });
};

const softDeleteNotice = async (id: string) => {
  return await Notice.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

const deleteNotice = async (id: string) => {
  return await Notice.findByIdAndDelete(id);
};

export const NoticeServices = {
  createNotice,
  getAllNotices,
  getActiveNotices,
  getArchivedNotices,
  getNoticeById,
  updateNotice,
  archiveNotice,
  unarchiveNotice,
  softDeleteNotice,
  deleteNotice,
};