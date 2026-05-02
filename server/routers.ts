import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  createPendingAudioSample,
  deleteAudioSample,
  finalizePendingAudioSampleStorage,
  getLibraryUsage,
  listLibrarySamples,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  library: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const samples = await listLibrarySamples(ctx.user?.id ?? null);
      const usage = await getLibraryUsage(ctx.user?.id ?? null);

      return {
        samples,
        usage,
        reservedShare: {
          seeded: 0.33,
          user: 0.67,
        },
      };
    }),
    importBase64: protectedProcedure
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
            message: "Le fichier audio dépasse la taille maximale autorisée.",
          });
        }

        const stem = sanitizeFileStem(input.originalFileName || input.name) || "sample";
        const placeholderKey = `samploop/pending/${ctx.user.id}/${crypto.randomUUID()}.${extension}`;
        const placeholderUrl = `pending://${placeholderKey}`;

        let pendingRecord: Awaited<ReturnType<typeof createPendingAudioSample>> | undefined;
        try {
          pendingRecord = await createPendingAudioSample({
            ownerUserId: ctx.user.id,
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
            fileKeyPlaceholder: placeholderKey,
            fileUrlPlaceholder: placeholderUrl,
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? `Impossible de préparer l’import du sample en base : ${error.message}`
                : "Impossible de préparer l’import du sample en base.",
          });
        }

        let upload: Awaited<ReturnType<typeof storagePut>>;
        try {
          upload = await storagePut(`samploop/audio/${ctx.user.id}/${stem}.${extension}`, buffer, input.mimeType);
        } catch (error) {
          try {
            await deleteAudioSample(pendingRecord.id);
          } catch (cleanupError) {
            console.error("[Samploop] Failed to rollback pending sample after storage error", cleanupError);
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? `Échec de l’envoi du sample vers le stockage : ${error.message}` : "Échec de l’envoi du sample vers le stockage.",
          });
        }

        try {
          const created = await finalizePendingAudioSampleStorage(pendingRecord.id, {
            fileKey: upload.key,
            fileUrl: upload.url,
          });

          return {
            sample: created,
            uploaded: true,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? `Le sample a été envoyé au stockage, mais sa finalisation en base a échoué : ${error.message}`
                : "Le sample a été envoyé au stockage, mais sa finalisation en base a échoué.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
