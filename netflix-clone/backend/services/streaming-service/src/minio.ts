import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  endpoint:        process.env.MINIO_ENDPOINT || "http://localhost:9000",
  region:          "us-east-1",
  credentials: {
    accessKeyId:     process.env.MINIO_ACCESS_KEY     || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY     || "minioadmin123",
  },
  forcePathStyle: true, // required for MinIO
});

const BUCKET = process.env.MINIO_BUCKET || "netflix-content";

export async function getObject(key: string): Promise<NodeJS.ReadableStream> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const res  = await s3.send(cmd);
  if (!res.Body) throw Object.assign(new Error("Object not found"), { statusCode: 404 });
  return res.Body as NodeJS.ReadableStream;
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}
