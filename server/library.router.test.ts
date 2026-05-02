import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const {
  listLibrarySamplesMock,
  getLibraryUsageMock,
  createPendingAudioSampleMock,
  finalizePendingAudioSampleStorageMock,
  deleteAudioSampleMock,
  storagePutMock,
} = vi.hoisted(() => ({
  listLibrarySamplesMock: vi.fn(),
  getLibraryUsageMock: vi.fn(),
  createPendingAudioSampleMock: vi.fn(),
  finalizePendingAudioSampleStorageMock: vi.fn(),
  deleteAudioSampleMock: vi.fn(),
  storagePutMock: vi.fn(),
}));

vi.mock("./db", () => ({
  createPendingAudioSample: createPendingAudioSampleMock,
  deleteAudioSample: deleteAudioSampleMock,
  finalizePendingAudioSampleStorage: finalizePendingAudioSampleStorageMock,
  getLibraryUsage: getLibraryUsageMock,
  listLibrarySamples: listLibrarySamplesMock,
}));

vi.mock("./storage", () => ({
  storagePut: storagePutMock,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUser(): AuthenticatedUser {
  return {
    id: 42,
    openId: "samploop-user",
    email: "user@example.com",
    name: "User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

function createImportPayload(overrides: Partial<Parameters<ReturnType<typeof appRouter.createCaller>["library"]["importBase64"]>[0]> = {}) {
  return {
    name: "Test Loop",
    category: "Drums",
    mimeType: "audio/wav",
    base64Data: Buffer.from("demo-audio-data").toString("base64"),
    durationMs: 4000,
    bpm: 120,
    isLoop: true,
    dominantColor: "#ff9900",
    waveformPreview: "[0,0.2,0.8,0.4]",
    originalFileName: "Test Loop.wav",
    ...overrides,
  };
}

describe("library router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne la bibliothèque visible et la répartition d’usage", async () => {
    listLibrarySamplesMock.mockResolvedValue([
      {
        id: 1,
        name: "Amber Kick Loop",
        sourceKind: "seeded",
        byteSize: 1024,
      },
    ]);
    getLibraryUsageMock.mockResolvedValue({
      totalBytes: 1024,
      seededBytes: 1024,
      userBytes: 0,
      seededShare: 1,
      userShare: 0,
    });

    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.library.list();

    expect(listLibrarySamplesMock).toHaveBeenCalledWith(null);
    expect(result.samples).toHaveLength(1);
    expect(result.reservedShare).toEqual({ seeded: 0.33, user: 0.67 });
  });

  it("importe un sample utilisateur via un enregistrement provisoire puis une finalisation après upload", async () => {
    createPendingAudioSampleMock.mockResolvedValue({
      id: 9,
      name: "Test Loop",
      libraryStatus: "processing",
    });
    storagePutMock.mockResolvedValue({
      key: "samploop/audio/42/test-loop_abcd1234.wav",
      url: "https://cdn.example.com/test-loop.wav",
    });
    finalizePendingAudioSampleStorageMock.mockResolvedValue({
      id: 9,
      name: "Test Loop",
      ownerUserId: 42,
      sourceKind: "user_upload",
      libraryStatus: "ready",
      fileUrl: "https://cdn.example.com/test-loop.wav",
    });

    const caller = appRouter.createCaller(createContext(createUser()));
    const result = await caller.library.importBase64(createImportPayload());

    expect(createPendingAudioSampleMock).toHaveBeenCalledOnce();
    expect(storagePutMock).toHaveBeenCalledOnce();
    expect(finalizePendingAudioSampleStorageMock).toHaveBeenCalledWith(9, {
      fileKey: "samploop/audio/42/test-loop_abcd1234.wav",
      fileUrl: "https://cdn.example.com/test-loop.wav",
    });
    expect(deleteAudioSampleMock).not.toHaveBeenCalled();
    expect(result.uploaded).toBe(true);
    expect(result.sample).toEqual(
      expect.objectContaining({
        id: 9,
        name: "Test Loop",
        libraryStatus: "ready",
      }),
    );
  });

  it("refuse les formats audio non pris en charge", async () => {
    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload({ mimeType: "audio/flac" }))).rejects.toMatchObject<Partial<TRPCError>>({
      code: "BAD_REQUEST",
      message: "Format audio non pris en charge. Utilisez wav, mp3, ogg ou webm.",
    });

    expect(storagePutMock).not.toHaveBeenCalled();
    expect(createPendingAudioSampleMock).not.toHaveBeenCalled();
  });

  it("rejette un fichier vide après décodage base64", async () => {
    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload({ base64Data: "================" }))).rejects.toMatchObject<Partial<TRPCError>>({
      code: "BAD_REQUEST",
      message: "Le fichier audio importé est vide.",
    });

    expect(storagePutMock).not.toHaveBeenCalled();
    expect(createPendingAudioSampleMock).not.toHaveBeenCalled();
  });

  it("rejette un fichier dépassant la taille maximale autorisée", async () => {
    const oversizedBase64 = Buffer.alloc(24 * 1024 * 1024 + 1, 1).toString("base64");
    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload({ base64Data: oversizedBase64 }))).rejects.toMatchObject<Partial<TRPCError>>({
      code: "BAD_REQUEST",
      message: "Le fichier audio dépasse la taille maximale autorisée.",
    });

    expect(storagePutMock).not.toHaveBeenCalled();
    expect(createPendingAudioSampleMock).not.toHaveBeenCalled();
  });

  it("remonte un message clair quand la préparation en base échoue avant upload", async () => {
    createPendingAudioSampleMock.mockRejectedValue(new Error("db indisponible"));

    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload())).rejects.toMatchObject<Partial<TRPCError>>({
      code: "INTERNAL_SERVER_ERROR",
      message: "Impossible de préparer l’import du sample en base : db indisponible",
    });

    expect(storagePutMock).not.toHaveBeenCalled();
    expect(deleteAudioSampleMock).not.toHaveBeenCalled();
  });

  it("supprime l’enregistrement provisoire si le stockage échoue", async () => {
    createPendingAudioSampleMock.mockResolvedValue({ id: 9, name: "Test Loop", libraryStatus: "processing" });
    storagePutMock.mockRejectedValue(new Error("proxy indisponible"));

    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload())).rejects.toMatchObject<Partial<TRPCError>>({
      code: "INTERNAL_SERVER_ERROR",
      message: "Échec de l’envoi du sample vers le stockage : proxy indisponible",
    });

    expect(deleteAudioSampleMock).toHaveBeenCalledWith(9);
    expect(finalizePendingAudioSampleStorageMock).not.toHaveBeenCalled();
  });

  it("signale distinctement un échec de finalisation base après upload réussi", async () => {
    createPendingAudioSampleMock.mockResolvedValue({ id: 9, name: "Test Loop", libraryStatus: "processing" });
    storagePutMock.mockResolvedValue({
      key: "samploop/audio/42/test-loop_abcd1234.wav",
      url: "https://cdn.example.com/test-loop.wav",
    });
    finalizePendingAudioSampleStorageMock.mockRejectedValue(new Error("update failed"));

    const caller = appRouter.createCaller(createContext(createUser()));

    await expect(caller.library.importBase64(createImportPayload())).rejects.toMatchObject<Partial<TRPCError>>({
      code: "INTERNAL_SERVER_ERROR",
      message: "Le sample a été envoyé au stockage, mais sa finalisation en base a échoué : update failed",
    });

    expect(createPendingAudioSampleMock).toHaveBeenCalledOnce();
    expect(storagePutMock).toHaveBeenCalledOnce();
    expect(finalizePendingAudioSampleStorageMock).toHaveBeenCalledOnce();
  });
});
