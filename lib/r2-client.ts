import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a file buffer to Cloudflare R2
 * @param buffer - File buffer to upload
 * @param key - Unique key/filename for the file
 * @param contentType - MIME type of the file
 * @returns Upload result with key and public URL
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Construct public URL
  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { key, url };
}

export default r2Client;
