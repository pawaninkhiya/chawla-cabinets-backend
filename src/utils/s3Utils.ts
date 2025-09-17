import s3 from "../configs/s3";
import {
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.AWS_BUCKET_NAME as string;

// Upload single file
export const uploadFileToS3 = async (file: Express.Multer.File) => {
    const key = `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    // S3 doesn’t auto-return URL, so we construct it:
    return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

// Upload multiple files
export const uploadMultipleToS3 = async (files: Express.Multer.File[]) => {
    return Promise.all(files.map(file => uploadFileToS3(file)));
};

// Delete single file
export const deleteFileFromS3 = async (key: string) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    await s3.send(command);
    return true;
};

// Delete multiple files
export const deleteMultipleFromS3 = async (keys: string[]) => {
    const command = new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
            Objects: keys.map(Key => ({ Key })),
        },
    });

    await s3.send(command);
    return true;
};

// Update = delete old + upload new
export const updateFileOnS3 = async (
    oldKey: string,
    newFile: Express.Multer.File
) => {
    await deleteFileFromS3(oldKey);
    return uploadFileToS3(newFile);
};

// Update multiple
export const updateMultipleOnS3 = async (
    oldKeys: string[],
    newFiles: Express.Multer.File[]
) => {
    await deleteMultipleFromS3(oldKeys);
    return uploadMultipleToS3(newFiles);
};
