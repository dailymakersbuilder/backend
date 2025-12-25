import { Response } from "express";

export const responseHandler = (res: Response, data: any, statusCode = 200, msg: string) => {
  res.status(statusCode).json({
    success: true,
    data,
    message: msg
  });
}