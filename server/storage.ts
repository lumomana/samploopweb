import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/tmp/samploop";

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(relKey) || ".bin";
  const filename = crypto.randomUUID() + ext;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), data);
  return { key: filename, url: `/uploads/${filename}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  return { key: relKey, url: `/uploads/${relKey}` };
}
