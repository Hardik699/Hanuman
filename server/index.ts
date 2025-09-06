import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { attachIdentity, requireAdmin } from "./middleware/auth";
import { salariesRouter } from "./routes/salaries";
import {
  getSpreadsheetInfo,
  syncMasterDataToGoogleSheets,
  getHRSpreadsheetInfo,
  syncHRDataToGoogleSheets,
} from "./services/googleSheets";
import { hrRouter } from "./routes/hr";

const HAS_DB = !!(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL);

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(attachIdentity);

  // Static for uploaded files
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // DB health
  app.get("/api/db/health", async (_req, res) => {
    if (!HAS_DB) {
      return res.json({
        connected: false,
        reason: "No database URL configured",
      });
    }
    try {
      const { pool } = await import("./data/postgres");
      await pool.query("SELECT 1");
      res.json({ connected: true });
    } catch (e: any) {
      res.json({ connected: false, error: e?.message || String(e) });
    }
  });

  // Global health
  app.get("/api/health", async (_req, res) => {
    let db = false;
    let dbError: string | undefined;
    if (HAS_DB) {
      try {
        const { pool } = await import("./data/postgres");
        await pool.query("SELECT 1");
        db = true;
      } catch (e: any) {
        db = false;
        dbError = e?.message || String(e);
      }
    }
    const sheetsConfigured = Boolean(
      (process.env.GOOGLE_SHEET_ID &&
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) ||
        (process.env.GOOGLE_SHEET_ID_HR &&
          process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS),
    );
    res.json({ ok: true, db, dbError, sheetsConfigured });
  });

  // Salaries API
  app.use("/api/salaries", salariesRouter());

  // HR/IT API (DB-backed)
  if (HAS_DB) {
    app.use("/api/hr", hrRouter());

    if (process.env.AUTO_WIPE_IT_HR === "1") {
      import("./routes/hr")
        .then(async (m) => {
          try {
            await m.wipeDirect?.();
          } catch {}
        })
        .catch(() => {});
    }

    if (process.env.AUTO_SEED_DEMO === "1") {
      import("./routes/hr").then((m) => m.seedDemoDirect?.(10)).catch(() => {});
    }
  }

  // One-time migration (file store -> Postgres/Neon)
  if (HAS_DB) {
    app.post(
      "/api/migrate-to-postgres",
      requireAdmin,
      async (req, res, next) => {
        try {
          const mod = await import("./routes/migrate");
          return mod.migrateSalariesToPostgres(req, res, next);
        } catch (err) {
          next(err);
        }
      },
    );
  }

  // Google Sheets integration (admin only recommended on client)
  app.post("/api/google-sheets/sync-master-data", syncMasterDataToGoogleSheets);
  app.get("/api/google-sheets/info", getSpreadsheetInfo);

  // HR Google Sheets (separate spreadsheet)
  app.post("/api/google-sheets/sync-hr", syncHRDataToGoogleSheets);
  app.get("/api/google-sheets/info-hr", getHRSpreadsheetInfo);

  return app;
}
