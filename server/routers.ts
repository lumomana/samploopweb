import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createPendingAudioSample,
  deleteAudioSample,
  finalizePendingAudioSampleStorage,
  getLibraryUsage,
  listLibrarySamples,
} from "./db";
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

function normalizeSortName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

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

  auth: router({
    // Auth désactivée — retourne toujours null
    me: publicProcedure.query(() => null),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  library: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const samples = await listLibrarySamples(ctx.user?.id ?? null);
      const usage = await getLibraryUsage(ctx.user?.id ?? null);
      return {
        samples,
        usage,
        reservedShare: { seeded: 0.33, user: 0.67 },
      };
    }),

    importBase64: publicProcedure
      .input(
        z.object({
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
      .mutation(async ({ ctx, input }) => {
        const extension = getExtensionForMimeType(input.mimeType);
        if (!extension) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Format audio non pris en charge. Utilisez wav, mp3, ogg ou webm.",
          });
        }

        const buffer = Buffer.from(input.base64Data, "base64");

        if (!buffer.byteLength) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Le fichier audio importé est vide.",
          });
        }

        if (buffer.byteLength > MAX_UPLOAD_BYTES) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Le fichier audio dépasse la taille maximale autorisée (24 Mo).",
          });
        }

        const ownerSlug = ctx.user?.id != null ? String(ctx.user.id) : "anon";
        const stem = sanitizeFileStem(input.originalFileName || input.name) || "sample";
        const pendingKey = `samploop/pending/${ownerSlug}/${crypto.randomUUID()}.${extension}`;

        let pendingRecord: Awaited<ReturnType<typeof createPendingAudioSample>>;
        try {
          pendingRecord = await createPendingAudioSample({
            ownerUserId: ctx.user?.id ?? null,
            sourceKind: "user_upload",
            name: input.name,
            sortName: normalizeSortName(input.name),
            category: input.category,
            mimeType: input.mimeType,
            waveformPreview: input.waveformPreview ?? null,
            dominantColor: input.dominantColor ?? null,
            bpm: input.bpm ?? null,
            durationMs: input.durationMs,
            byteSize: buffer.byteLength,
            isLoop: input.isLoop ? 1 : 0,
            originalFileName: input.originalFileName,
            fileKeyPlaceholder: pendingKey,
            fileUrlPlaceholder: `pending://${pendingKey}`,
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? `Impossible de préparer l'import en base : ${error.message}`
                : "Impossible de préparer l'import en base.",
          });
        }

        let upload: Awaited<ReturnType<typeof storagePut>>;
        try {
          upload = await storagePut(
            `samploop/audio/${ownerSlug}/${stem}.${extension}`,
            buffer,
            input.mimeType,
          );
        } catch (error) {
          try {
            await deleteAudioSample(pendingRecord.id);
          } catch (cleanupError) {
            console.error("[Samploop] Rollback échoué après erreur de stockage", cleanupError);
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? `Échec de l'envoi du sample : ${error.message}`
                : "Échec de l'envoi du sample.",
          });
        }

        try {
          const created = await finalizePendingAudioSampleStorage(pendingRecord.id, {
            fileKey: upload.key,
            fileUrl: upload.url,
          });
          return { sample: created, uploaded: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? `Sample envoyé mais finalisation en base échouée : ${error.message}`
                : "Sample envoyé mais finalisation en base échouée.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
