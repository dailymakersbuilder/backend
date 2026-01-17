import { Request, Response, NextFunction } from "express";
import { responseHandler } from "../../middlewares/responseHandler";
import { colors } from "./colors";
import { uploadIconsToS3 } from "./helper";
import { s3Client } from "../../config/s3Config";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export const getColorsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        return responseHandler(res, colors, 200, "Colors fetched successfully");
    } catch (error) {
        next(error);
    }
};

export const uploadIconsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await uploadIconsToS3();
        return responseHandler(res, result, 200, "Icons uploaded successfully");
    }
    catch (error) {
        next(error);
    }
};

export const getIconsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Prefix: "icons/",
    });

    const data = await s3Client.send(command);

    const icons = (data.Contents || []).map((item) => ({
      name: item.Key?.replace("icons/", ""),
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    }));

    return responseHandler(res, icons, 200, "Icons fetched successfully");
  } catch (error) {
    next(error);
  }
};