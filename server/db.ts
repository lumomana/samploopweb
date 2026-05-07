import { and, asc, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { audioSamples, InsertAudioSample, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listLibrarySamples(_userId?: number | null) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot list samples: database not available");
    return [];
  }

  // Auth est désactivée — on retourne tous les samples prêts, toutes sources confondues.
  return db
    .select()
    .from(audioSamples)
    .where(eq(audioSamples.libraryStatus, "ready"))
    .orderBy(asc(audioSamples.sortName), desc(audioSamples.createdAt));
}

export async function getLibraryUsage(userId?: number | null) {
  const samples = await listLibrarySamples(userId);

  const totalBytes = samples.reduce((sum, sample) => sum + sample.byteSize, 0);
  const seededBytes = samples
    .filter((sample) => sample.sourceKind === "seeded")
    .reduce((sum, sample) => sum + sample.byteSize, 0);
  const userBytes = samples
    .filter((sample) => sample.sourceKind === "user_upload")
    .reduce((sum, sample) => sum + sample.byteSize, 0);

  return {
    totalBytes,
    seededBytes,
    userBytes,
    seededShare: totalBytes > 0 ? seededBytes / totalBytes : 0,
    userShare: totalBytes > 0 ? userBytes / totalBytes : 0,
  };
}

export async function createAudioSample(sample: InsertAudioSample) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for sample creation");
  }

  await db.insert(audioSamples).values(sample);

  const created = await db
    .select()
    .from(audioSamples)
    .where(eq(audioSamples.fileKey, sample.fileKey))
    .limit(1);

  return created[0];
}

export async function createPendingAudioSample(sample: Omit<InsertAudioSample, "fileKey" | "fileUrl" | "libraryStatus"> & { fileKeyPlaceholder: string; fileUrlPlaceholder: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for pending sample creation");
  }

  await db.insert(audioSamples).values({
    ...sample,
    libraryStatus: "processing",
    fileKey: sample.fileKeyPlaceholder,
    fileUrl: sample.fileUrlPlaceholder,
  });

  const created = await db
    .select()
    .from(audioSamples)
    .where(eq(audioSamples.fileKey, sample.fileKeyPlaceholder))
    .limit(1);

  return created[0];
}

export async function finalizePendingAudioSampleStorage(sampleId: number, storage: { fileKey: string; fileUrl: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for sample finalization");
  }

  await db
    .update(audioSamples)
    .set({
      fileKey: storage.fileKey,
      fileUrl: storage.fileUrl,
      libraryStatus: "ready",
    })
    .where(eq(audioSamples.id, sampleId));

  const updated = await db
    .select()
    .from(audioSamples)
    .where(eq(audioSamples.id, sampleId))
    .limit(1);

  return updated[0];
}

export async function deleteAudioSample(sampleId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for sample deletion");
  }

  await db.delete(audioSamples).where(eq(audioSamples.id, sampleId));
}
