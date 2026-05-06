import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;
const allowedAudioMimeTypes = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
} as const;

const seededSamples = [
  { id: "a1", name: "Amber Kick Loop",    color: "#f59e0b", category: "Drums",   bpm: 120, durationMs: 8000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/amber-kick-loop.wav",    sortName: "amber kick loop",    mimeType: "audio/wav", byteSize: 0, dominantColor: "#f59e0b", waveformPreview: null, originalFileName: "amber-kick-loop.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "b0", name: "Biimport { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;
const allowedAudioMimeTypes = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
} as const;

// Bibliothèque de samples seeded (toujours disponibles)
const seededSamples = [
  { id: "a1", name: "Amber Kick Loop",    color: "#f59e0b", category: "Drums",   bpm: 120, durationMs: 8000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/amber-kick-loop.wav",    sortName: "amber kick loop",    mimeType: "audio/wav", byteSize: 0, dominantColor: "#f59e0b", waveformPreview: null, originalFileName: "amber-kick-loop.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "b0", name: "Birds",              color: "#4ade80", category: "Nature",  bpm: 0,   durationMs: 12000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/birds.wav",               sortName: "birds",              mimeType: "audio/wav", byteSize: 0, dominantColor: "#4ade80", waveformPreview: null, originalFileName: "birds.wav",               ownerUserId: null, libraryStatus: "ready" },
  { id: "a2", name: "Blue Grain Pad",     color: "#60a5fa", category: "Texture", bpm: 84,  durationMs: 11000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/blue-grain-pad.wav",      sortName: "blue grain pad",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#60a5fa", waveformPreview: null, originalFileName: "blue-grain-pad.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a3", name: "Coral Vox Chop",     color: "#fb7185", category: "Voice",   bpm: 96,  durationMs: 6000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/coral-vox-chop.wav",      sortName: "coral vox chop",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#fb7185", waveformPreview: null, originalFileName: "coral-vox-chop.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a4", name: "Crystal Click Hat",  color: "#67e8f9", category: "Perc",    bpm: 132, durationMs: 5000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/crystal-click-hat.wav",   sortName: "crystal click hat",  mimeType: "audio/wav", byteSize: 0, dominantColor: "#67e8f9", waveformPreview: null, originalFileName: "crystal-click-hat.wav",   ownerUserId: null, libraryStatus: "ready" },
  { id: "a5", name: "Forest Drone C",     color: "#4ade80", category: "Drone",   bpm: 70,  durationMs: 14000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/forest-drone-c.wav",      sortName: "forest drone c",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#4ade80", waveformPreview: null, originalFileName: "forest-drone-c.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a6", name: "Golden Pulse Bass",  color: "#facc15", category: "Bass",    bpm: 102, durationMs: 7000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/golden-pulse-bass.wav",   sortName: "golden pulse bass",  mimeType: "audio/wav", byteSize: 0, dominantColor: "#facc15", waveformPreview: null, originalFileName: "golden-pulse-bass.wav",   ownerUserId: null, libraryStatus: "ready" },
  { id: "a7", name: "Lilac Tape Snare",   color: "#c084fc", category: "Drums",   bpm: 118, durationMs: 4000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/lilac-tape-snare.wav",    sortName: "lilac tape snare",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#c084fc", waveformPreview: null, originalFileName: "lilac-tape-snare.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "a8", name: "Mint Bell Loop",     color: "#2dd4bf", category: "Melody",  bpm: 90,  durationMs: 9000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/mint-bell-loop.wav",      sortName: "mint bell loop",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#2dd4bf", waveformPreview: null, originalFileName: "mint-bell-loop.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a9", name: "Rust Texture Sweep", color: "#fb923c", category: "FX",      bpm: 110, durationMs: 5000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/rust-texture-sweep.wav",  sortName: "rust texture sweep", mimeType: "audio/wav", byteSize: 0, dominantColor: "#fb923c", waveformPreview: null, originalFileName: "rust-texture-sweep.wav",  ownerUserId: null, libraryStatus: "ready" },
  { id: "b1", name: "Velvet Clap Grid",   color: "#a78bfa", category: "Perc",    bpm: 124, durationMs: 4000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/velvet-clap-grid.wav",    sortName: "velvet clap grid",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#a78bfa", waveformPreview: null, originalFileName: "velvet-clap-grid.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "b2", name: "Warm Organ Stab",    color: "#86efac", category: "Keys",    bpm: 88,  durationMs: 6000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/warm-organ-stab.wav",     sortName: "warm organ stab",    mimeType: "audio/wav", byteSize: 0, dominantColor: "#86efac", waveformPreview: null, originalFileName: "warm-organ-stab.wav",     ownerUserId: null, libraryStatus: "ready" },
  { id: "b3", name: "Wave Ribbon Lead",   color: "#38bdf8", category: "Lead",    bpm: 128, durationMs: 8000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/wave-ribbon-lead.wav",    sortName: "wave ribbon lead",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#38bdf8", waveformPreview: null, originalFileName: "wave-ribbon-lead.wav",    ownerUserId: null, libraryStatus: "ready" },
];

// Sessions en mémoire (temporaires, nettoyées après 24h)
const sessionSamples = new Map<string, typeof seededSamples>();

function sanitizeFileStem(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getExtensionForMimeType(mimeType: string) {
  return allowedAudioMimeTypes[mimeType as keyof typeof allowedAudioMimeTypes] ?? null;
}

export const appRouter = router({
  system: systemRouter,

  // Auth simplifié — pas de vrai login, juste null
  auth: router({
    me: publicProcedure.query(() => null),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  library: router({
    list: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }).optional())
      .query(({ input }) => {
        const sessionId = input?.sessionId;
        const userSamples = sessionId ? (sessionSamples.get(sessionId) ?? []) : [];
        const allSamples = [...seededSamples, ...userSamples];

        return {
          samples: allSamples,
          usage: {
            totalBytes: userSamples.reduce((acc, s) => acc + s.byteSize, 0),
            seededBytes: 0,
            userBytes: userSamples.reduce((acc, s) => acc + s.byteSize, 0),
          },
          reservedShare: { seeded: 0.33, user: 0.67 },
        };
      }),

    importBase64: publicProcedure
      .input(
        z.object({
          sessionId: z.string().min(8),
          name: z.string().min(2).max(180),
          category: z.string().min(2).max(80),
          mimeType: z.string().min(3).max(120),
          base64Data: z.string().min(16),
          durationMs: z.number().int().positive().max(600000),
          bpm: z.number().int().min(30).max(300).nullable().optional(),
          isLoop: z.boolean().default(true),
          dominantColor: z.string().max(24).nullable().optional(),
          waveformPreview: z.string().max(12000).nullable().optional(),
          originalFileName: z.string().min(1).max(255),
        }),
      )
      .mutation(async ({ input }) => {
        const extension = getExtensionForMimeType(input.mimeType);
        if (!extension) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Format audio non pris en charge. Utilisez wav, mp3, ogg ou webm.",
          });
        }

        const buffer = Buffer.from(input.base64Data, "base64");
        if (!buffer.byteLength) throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier vide." });
        if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier trop grand (max 24 Mo)." });

        const stem = sanitizeFileStem(input.originalFileName || input.name) || "sample";
        const fileKey = `temp/${input.sessionId}/${crypto.randomUUID().slice(0, 8)}-${stem}.${extension}`;

        const upload = await storagePut(fileKey, buffer, input.mimeType);

        const newSample = {
          id: crypto.randomUUID(),
          name: input.name,
          color: input.dominantColor ?? "#f59e0b",
          category: input.category,
          bpm: input.bpm ?? null,
          durationMs: input.durationMs,
          isLoop: input.isLoop,
          sourceKind: "user_upload",
          fileUrl: upload.url,
          fileKey: upload.key,
          sortName: input.name.toLowerCase(),
          mimeType: input.mimeType,
          byteSize: buffer.byteLength,
          dominantColor: input.dominantColor ?? null,
          waveformPreview: input.waveformPreview ?? null,
          originalFileName: input.originalFileName,
          ownerUserId: null,
          libraryStatus: "ready",
        };

        // Stocker en mémoire pour cette session
        const existing = sessionSamples.get(input.sessionId) ?? [];
        sessionSamples.set(input.sessionId, [...existing, newSample]);

        // Nettoyage automatique après 24h
        setTimeout(() => {
          const current = sessionSamples.get(input.sessionId) ?? [];
          sessionSamples.set(input.sessionId, current.filter(s => s.id !== newSample.id));
        }, 24 * 60 * 60 * 1000);

        return { sample: newSample, uploaded: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;rds",              color: "#4ade80", category: "Nature",  bpm: 0,   durationMs: 12000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/birds.wav",               sortName: "birds",              mimeType: "audio/wav", byteSize: 0, dominantColor: "#4ade80", waveformPreview: null, originalFileName: "birds.wav",               ownerUserId: null, libraryStatus: "ready" },
  { id: "a2", name: "Blue Grain Pad",     color: "#60a5fa", category: "Texture", bpm: 84,  durationMs: 11000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/blue-grain-pad.wav",      sortName: "blue grain pad",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#60a5fa", waveformPreview: null, originalFileName: "blue-grain-pad.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a3", name: "Coral Vox Chop",     color: "#fb7185", category: "Voice",   bpm: 96,  durationMs: 6000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/coral-vox-chop.wav",      sortName: "coral vox chop",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#fb7185", waveformPreview: null, originalFileName: "coral-vox-chop.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a4", name: "Crystal Click Hat",  color: "#67e8f9", category: "Perc",    bpm: 132, durationMs: 5000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/crystal-click-hat.wav",   sortName: "crystal click hat",  mimeType: "audio/wav", byteSize: 0, dominantColor: "#67e8f9", waveformPreview: null, originalFileName: "crystal-click-hat.wav",   ownerUserId: null, libraryStatus: "ready" },
  { id: "a5", name: "Forest Drone C",     color: "#4ade80", category: "Drone",   bpm: 70,  durationMs: 14000, isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/forest-drone-c.wav",      sortName: "forest drone c",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#4ade80", waveformPreview: null, originalFileName: "forest-drone-c.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a6", name: "Golden Pulse Bass",  color: "#facc15", category: "Bass",    bpm: 102, durationMs: 7000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/golden-pulse-bass.wav",   sortName: "golden pulse bass",  mimeType: "audio/wav", byteSize: 0, dominantColor: "#facc15", waveformPreview: null, originalFileName: "golden-pulse-bass.wav",   ownerUserId: null, libraryStatus: "ready" },
  { id: "a7", name: "Lilac Tape Snare",   color: "#c084fc", category: "Drums",   bpm: 118, durationMs: 4000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/lilac-tape-snare.wav",    sortName: "lilac tape snare",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#c084fc", waveformPreview: null, originalFileName: "lilac-tape-snare.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "a8", name: "Mint Bell Loop",     color: "#2dd4bf", category: "Melody",  bpm: 90,  durationMs: 9000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/mint-bell-loop.wav",      sortName: "mint bell loop",     mimeType: "audio/wav", byteSize: 0, dominantColor: "#2dd4bf", waveformPreview: null, originalFileName: "mint-bell-loop.wav",      ownerUserId: null, libraryStatus: "ready" },
  { id: "a9", name: "Rust Texture Sweep", color: "#fb923c", category: "FX",      bpm: 110, durationMs: 5000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/rust-texture-sweep.wav",  sortName: "rust texture sweep", mimeType: "audio/wav", byteSize: 0, dominantColor: "#fb923c", waveformPreview: null, originalFileName: "rust-texture-sweep.wav",  ownerUserId: null, libraryStatus: "ready" },
  { id: "b1", name: "Velvet Clap Grid",   color: "#a78bfa", category: "Perc",    bpm: 124, durationMs: 4000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/velvet-clap-grid.wav",    sortName: "velvet clap grid",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#a78bfa", waveformPreview: null, originalFileName: "velvet-clap-grid.wav",    ownerUserId: null, libraryStatus: "ready" },
  { id: "b2", name: "Warm Organ Stab",    color: "#86efac", category: "Keys",    bpm: 88,  durationMs: 6000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/warm-organ-stab.wav",     sortName: "warm organ stab",    mimeType: "audio/wav", byteSize: 0, dominantColor: "#86efac", waveformPreview: null, originalFileName: "warm-organ-stab.wav",     ownerUserId: null, libraryStatus: "ready" },
  { id: "b3", name: "Wave Ribbon Lead",   color: "#38bdf8", category: "Lead",    bpm: 128, durationMs: 8000,  isLoop: true, sourceKind: "seeded", fileUrl: "", fileKey: "seeded/wave-ribbon-lead.wav",    sortName: "wave ribbon lead",   mimeType: "audio/wav", byteSize: 0, dominantColor: "#38bdf8", waveformPreview: null, originalFileName: "wave-ribbon-lead.wav",    ownerUserId: null, libraryStatus: "ready" },
];

// Stockage en mémoire : sessionId → liste de samples avec leur audio en base64
type MemorySample = typeof seededSamples[0] & { audioData?: string; audioMimeType?: string };
const sessionSamples = new Map<string, MemorySample[]>();
// Export pour que le serveur Express puisse servir les fichiers audio
export const sessionAudioStore = sessionSamples;

function sanitizeFileStem(fileName: string) {
  return fileName.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function getExtensionForMimeType(mimeType: string) {
  return allowedAudioMimeTypes[mimeType as keyof typeof allowedAudioMimeTypes] ?? null;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(() => null),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  library: router({
    list: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }).optional())
      .query(({ input }) => {
        const sessionId = input?.sessionId;
        const userSamples = sessionId ? (sessionSamples.get(sessionId) ?? []) : [];
        const allSamples = [...seededSamples, ...userSamples];
        return {
          samples: allSamples,
          usage: {
            totalBytes: userSamples.reduce((acc, s) => acc + s.byteSize, 0),
            seededBytes: 0,
            userBytes: userSamples.reduce((acc, s) => acc + s.byteSize, 0),
          },
          reservedShare: { seeded: 0.33, user: 0.67 },
        };
      }),

    // Servir le fichier audio depuis la mémoire
    getAudio: publicProcedure
      .input(z.object({ sessionId: z.string(), sampleId: z.string() }))
      .query(({ input }) => {
        const samples = sessionSamples.get(input.sessionId) ?? [];
        const sample = samples.find(s => s.id === input.sampleId);
        if (!sample?.audioData) throw new TRPCError({ code: "NOT_FOUND", message: "Sample not found" });
        return { audioData: sample.audioData, mimeType: sample.audioMimeType ?? "audio/wav" };
      }),

    importBase64: publicProcedure
      .input(
        z.object({
          sessionId: z.string().min(8),
          name: z.string().min(2).max(180),
          category: z.string().min(2).max(80),
          mimeType: z.string().min(3).max(120),
          base64Data: z.string().min(16),
          durationMs: z.number().int().positive().max(600000),
          bpm: z.number().int().min(30).max(300).nullable().optional(),
          isLoop: z.boolean().default(true),
          dominantColor: z.string().max(24).nullable().optional(),
          waveformPreview: z.string().max(12000).nullable().optional(),
          originalFileName: z.string().min(1).max(255),
        }),
      )
      .mutation(async ({ input }) => {
        const extension = getExtensionForMimeType(input.mimeType);
        if (!extension) throw new TRPCError({ code: "BAD_REQUEST", message: "Format non supporté." });

        const buffer = Buffer.from(input.base64Data, "base64");
        if (!buffer.byteLength) throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier vide." });
        if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier trop grand (max 24 Mo)." });

        const sampleId = crypto.randomUUID();
        // L'URL pointe vers notre propre endpoint qui sert le fichier depuis la mémoire
        const fileUrl = `/api/audio/${input.sessionId}/${sampleId}`;

        const newSample: MemorySample = {
          id: sampleId,
          name: input.name,
          color: input.dominantColor ?? "#f59e0b",
          category: input.category,
          bpm: input.bpm ?? null,
          durationMs: input.durationMs,
          isLoop: input.isLoop,
          sourceKind: "user_upload",
          fileUrl,
          fileKey: fileUrl,
          sortName: input.name.toLowerCase(),
          mimeType: input.mimeType,
          byteSize: buffer.byteLength,
          dominantColor: input.dominantColor ?? null,
          waveformPreview: input.waveformPreview ?? null,
          originalFileName: input.originalFileName,
          ownerUserId: null,
          libraryStatus: "ready",
          audioData: input.base64Data,
          audioMimeType: input.mimeType,
        };

        const existing = sessionSamples.get(input.sessionId) ?? [];
        sessionSamples.set(input.sessionId, [...existing, newSample]);

        // Nettoyage après 24h
        setTimeout(() => {
          const current = sessionSamples.get(input.sessionId) ?? [];
          sessionSamples.set(input.sessionId, current.filter(s => s.id !== sampleId));
        }, 24 * 60 * 60 * 1000);

        return { sample: { ...newSample, audioData: undefined }, uploaded: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
