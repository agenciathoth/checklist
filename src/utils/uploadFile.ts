import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { s3 } from "@/lib/aws";

export const uploadFile = async (file: File, customerId: string) => {
  const hash = randomBytes(4).toString("hex");
  const filename = hash.concat("_").concat(file.name);

  const [type] = file.type.split("/");
  const path = customerId.concat("/").concat(filename);

  const commandUpload = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: path,
    Body: (await file.arrayBuffer()) as Buffer,
    ContentType: file.type,
  });

  await s3.send(commandUpload);

  return {
    type,
    path,
  };
};
