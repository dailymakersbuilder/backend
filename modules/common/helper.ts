import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../config/s3Config";

const ICONS_DIR = path.join(process.cwd(), "icons");

export const uploadIconsToS3 = async (): Promise<string[]> => {
  const files = fs.readdirSync(ICONS_DIR);

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = path.join(ICONS_DIR, file);
    const fileStream = fs.createReadStream(filePath);

    const key = `icons/${file}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: fileStream,
        ContentType: getContentType(file),
      })
    );

    uploadedUrls.push(
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    );
  }

  return uploadedUrls;
};

const getContentType = (fileName: string): string => {
  if (fileName.endsWith(".svg")) return "image/svg+xml";
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))
    return "image/jpeg";
  return "application/octet-stream";
};
