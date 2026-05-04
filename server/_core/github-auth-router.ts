import axios from "axios";
import type { Express } from "express";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const APP_URL = process.env.APP_URL || "https://samploopweb-production.up.railway.app";

export function registerGitHubAuthRoutes(app: Express) {
  // Étape 1 — Rediriger vers GitHub
  app.get("/auth/github", (_req, res) => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${APP_URL}/auth/github/callback`,
      scope: "read:user user:email",
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });

  // Étape 2 — Callback GitHub → créer session
  app.get("/auth/github/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.redirect("/?error=missing_code");

    try {
      // Échanger le code contre un access token
      const tokenRes = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${APP_URL}/auth/github/callback`,
        },
        { headers: { Accept: "application/json" } }
      );

      const accessToken = tokenRes.data.access_token;
      if (!accessToken) return res.redirect("/?error=no_token");

      // Récupérer les infos utilisateur GitHub
      const userRes = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const githubUser = userRes.data;
      const openId = `github:${githubUser.id}`;
      const name = githubUser.name || githubUser.login;
      const email = githubUser.email;

      // Upsert en base
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      // Créer le cookie de session JWT
      const sessionToken = await sdk.createSessionToken(openId, { name });
     const cookieOptions = getSessionCookieOptions(req);
res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, secure: true });

      res.redirect("/");
    } catch (error) {
      console.error("[GitHub OAuth] Error:", error);
      res.redirect("/?error=oauth_failed");
    }
  });

  // Déconnexion
  app.get("/auth/logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.redirect("/");
  });
}
