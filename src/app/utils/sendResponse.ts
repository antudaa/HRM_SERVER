import { Response } from "express";

interface TResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
}

const sendResponse = <T>(
  res: Response<any, Record<string, any>>, 
  data: TResponse<T>
): void => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;
