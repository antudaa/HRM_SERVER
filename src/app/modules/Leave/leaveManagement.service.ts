import { Types } from "mongoose";
import { LeaveType } from "./leaveManagement.model";
import { TLeaveType } from "./leaveManagement.interface";

const normalizeCode = (code: string) => code?.toUpperCase()?.trim();

export const LeaveTypeServices = {
  async createLeaveType(payload: TLeaveType, createdBy?: string) {
    const code = normalizeCode(payload.code);
    const exists = await LeaveType.isCodeTaken(code);
    if (exists) throw new Error(`Leave type code '${code}' is already taken`);

    return LeaveType.create({
      ...payload,
      code,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
    });
  },

  async updateLeaveType(id: string, payload: Partial<TLeaveType>, updatedBy?: string) {
    if (payload.code) {
      const code = normalizeCode(payload.code);
      const another = await LeaveType.findOne({ code, _id: { $ne: id } }).lean();
      if (another) throw new Error(`Leave type code '${code}' is already taken`);
      payload.code = code;
    }

    return LeaveType.findByIdAndUpdate(
      id,
      { ...payload, updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined },
      { new: true }
    );
  },

  async archivedLeaveType(id: string) {
    return LeaveType.findByIdAndUpdate(id, { active: false }, { new: true });
  },

  async unArchiveLeaveType(id: string) {
    return LeaveType.findByIdAndUpdate(id, { active: true }, { new: true });
  },

  async toggleActive(id: string) {
    const doc = await LeaveType.findById(id);
    if (!doc) throw new Error("Leave type not found");
    doc.active = !doc.active;
    await doc.save();
    return doc;
  },

  async deleteLeaveType(id: string) {
    // Soft-delete recommended; using hard-delete per request
    return LeaveType.findByIdAndDelete(id);
  },

  async getLeaveTypes(query: any = {}) {
    const { page = 1, limit = 20, sort = "-createdAt", active } = query;
    const filter: any = { isDeleted: { $ne: true } };
    if (active !== undefined) filter.active = active === "true";

    const [data, total] = await Promise.all([
      LeaveType.find(filter).sort(sort).skip((page - 1) * limit).limit(Number(limit)).lean(),
      LeaveType.countDocuments(filter),
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  },

  async getAllLeaveType() {
    return LeaveType.find({ isDeleted: { $ne: true } }).lean();
  },

  async getActiveLeaveType() {
    return LeaveType.listActive();
  },

  async getArchiveLeaveType() {
    return LeaveType.find({ active: false, isDeleted: { $ne: true } }).lean();
  },

  async getLeaveTypeByCode(code: string) {
    return LeaveType.findByCode(code);
  },

  async isCodeAvailable(code: string) {
    const taken = await LeaveType.isCodeTaken(code);
    return { code: code.toUpperCase(), available: !taken };
  },

  async getLeaveTypeByID(id: string) {
    return LeaveType.findById(id).lean();
  },
};
