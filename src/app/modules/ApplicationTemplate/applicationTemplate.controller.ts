import { RequestHandler } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ApplicationTemplateServices as S } from "./applicationTemplate.service";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const data = await S.createTemplate(req.body, userId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Template created.", data });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const userId = (req as any).user?.id;
  const data = await S.updateTemplate(req.params.id, req.body, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Template updated.", data });
});

export const list: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.listTemplates(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Templates fetched.", data });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.getTemplateById(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Template fetched.", data });
});

export const getActiveByType: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.getActiveByType(req.query.orgId as string | undefined, req.params.type as any);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Active templates fetched.", data });
});

export const render: RequestHandler = catchAsync(async (req, res) => {
  const data = await S.renderTemplate(req.params.id, req.body.variables ?? {});
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Rendered.", data });
});

export const ApplicationTemplateControllers = { create, update, list, getById, getActiveByType, render };
