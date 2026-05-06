import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGitHubAuthRoutes } from "./github-auth-router";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// Import sessionSamples pour servir les fichiers audio en mémoire
// On l'exporte depuis routers.ts pour y accéder ici
import { sessionAudioStore } from "../routers";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Route pour servir les fichiers audio depuis la mémoire
  app.get("/api/audio/:sessionId/:sampleId", (req, res) => {
    const { sessionId, sampleId } = req.params;
    const samples = sessionAudioStore.get(sessionId) ?? [];
    const sample = samples.find((s: any) => s.id === sampleId);

    if (!sample?.audioData) {
      return res.status(404).json({ error: "Audio not found" });
    }

    const buffer = Buffer.from(sample.audioData, "base64");
    res.set("Content-Type", sample.audioMimeType ?? "audio/wav");
    res.set("Content-Length", String(buffer.byteLength));
    res.set("Cache-Control", "private, max-age=86400");
    res.send(buffer);
  });

  // GitHub OAuth routes
  registerGitHubAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
