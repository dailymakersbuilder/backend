import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "./s3Config";

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME as string,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: "inline",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now().toString();
            cb(null, uniqueSuffix + "-" + file.originalname);
        }
    })
});

export default upload;
