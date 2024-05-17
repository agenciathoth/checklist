import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_BUCKET_ACCESS_KEY_SECRET!,
  },
});

export const getMediaURL = (path: string) =>
  "https://thoth-checklist.s3.us-east-2.amazonaws.com/".concat(path);
