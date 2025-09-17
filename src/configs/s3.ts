import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export default s3;

// import S3 from "aws-sdk/clients/s3";
// import dotenv from "dotenv";

// dotenv.config();

// const s3 = new S3({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// // console.log("S3 initialized with config:", {
// //     region: process.env.AWS_REGION_DEV,
// //     bucket: process.env.AWS_BUCKET_NAME_DEV,
// //     accessKeyId: process.env.AWS_ACCESS_KEY_ID_DEV?.slice(0, 6) + "******", // hide sensitive part
// // });

// export default s3;
