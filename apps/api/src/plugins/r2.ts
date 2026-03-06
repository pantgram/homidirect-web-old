import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "../config/env";

const s3Client = new S3Client({
  region: "auto",
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${config.r2.publicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    })
  );
}

export async function copyInR2(sourceKey: string, destinationKey: string): Promise<string> {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: config.r2.bucketName,
      CopySource: `${config.r2.bucketName}/${sourceKey}`,
      Key: destinationKey,
    })
  );

  return `${config.r2.publicUrl}/${destinationKey}`;
}

export function getKeyFromUrl(url: string): string {
  const publicUrl = config.r2.publicUrl;
  if (url.startsWith(publicUrl)) {
    return url.slice(publicUrl.length + 1);
  }
  return url;
}
