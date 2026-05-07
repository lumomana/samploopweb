// Stockage Cloudflare R2 via SDK AWS S3
// Les fichiers temp/ sont supprimés automatiquement après 24h (configurer dans R2)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? "auto",
    endpoint: process.env.AWS_ENDPimport fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/tmp/samploop";

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(relKey) || ".bin";
  const filename = crypto.randomUUID() + ext;
  const filepath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filepath, data);

  return {
    key: filename,
    url: `/uploads/${filename}`,
  };
}

// storageGet kept for interface compatibility — returns a local path URL
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  return {
    key: relKey,
    url: `/uploads/${relKey}`,
  };
}OINT_URL_S3,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
}

const BUCKET = process.env.AWS_S3_BUCKET ?? "";

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  // URL publique directe (nécessite que le bucket soit public)
  const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? "";
  const publicBase = process.env.R2_PUBLIC_URL ?? endpoint.replace(
    /^https:\/\/[^.]+\./,
    "https://pub-"
  );
  const url = `${publicBase.replace(/\/+$/, "")}/${key}`;

  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = relKey.replace(/^\/+/, "");

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  );

  return { key, url };
}
