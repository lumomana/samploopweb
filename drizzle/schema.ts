import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const audioSamples = mysqlTable("audioSamples", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").references(() => users.id),
  sourceKind: mysqlEnum("sourceKind", ["seeded", "user_upload"]).notNull(),
  libraryStatus: mysqlEnum("libraryStatus", ["ready", "archived", "processing", "error"]).default("ready").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  sortName: varchar("sortName", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull().unique(),
  fileUrl: text("fileUrl").notNull(),
  waveformPreview: text("waveformPreview"),
  dominantColor: varchar("dominantColor", { length: 24 }),
  bpm: int("bpm"),
  durationMs: int("durationMs").notNull(),
  byteSize: int("byteSize").notNull(),
  isLoop: int("isLoop").default(1).notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AudioSample = typeof audioSamples.$inferSelect;
export type InsertAudioSample = typeof audioSamples.$inferInsert;
