import { RequestHandler, Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { db } from "../data";
import {
  CreateSalaryInput,
  ListDocumentsResponse,
  ListSalariesResponse,
  SalaryDocument,
  SalaryRecord,
  SalaryWithDocs,
  UpdateSalaryInput,
} from "@shared/api";
import { requireAdmin } from "../middleware/auth";

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const id = nanoid(12);
    const ext =
      path.extname(file.originalname) ||
      "." + (mime.extension(file.mimetype) || "bin");
    cb(null, `${id}${ext}`);
  },
});

const allowedMimes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (allowedMimes.has(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const createSchema = z.object({
  userId: z.string().min(1),
  employeeName: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(3000),
  amount: z.number().min(0),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  employeeName: z.string().min(1).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(1900).max(3000).optional(),
  amount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const buildDocUrl = (filename: string) => `/uploads/${filename}`;

// Handlers
const list: RequestHandler = async (req, res) => {
  const all = await db.getSalaries();
  const role = req.userRole || "user";
  const userId = req.userId || "anonymous";
  const items = role === "admin" ? all : all.filter((s) => s.userId === userId);
  const resp: ListSalariesResponse = { items };
  res.json(resp);
};

const getOne: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  const role = req.userRole || "user";
  const userId = req.userId || "anonymous";
  if (role !== "admin" && record.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const docs = await db.getDocumentsForSalary(id);
  const full: SalaryWithDocs = { ...record, documents: docs };
  res.json(full);
};

const create: RequestHandler = async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const input = parsed.data as CreateSalaryInput;
  // Users can create; no admin required
  const now = new Date().toISOString();
  const record: SalaryRecord = {
    id: nanoid(12),
    userId: input.userId,
    employeeName: input.employeeName,
    month: input.month,
    year: input.year,
    amount: input.amount,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  await db.upsertSalary(record);
  res.status(201).json(record);
};

const update: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  // Admin only enforced via middleware on route
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });
  const patch = parsed.data as UpdateSalaryInput;
  const updated: SalaryRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await db.upsertSalary(updated);
  res.json(updated);
};

const remove: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  await db.deleteSalary(id);
  res.status(204).send();
};

const listDocs: RequestHandler = async (req, res) => {
  const { id } = req.params; // salaryId
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  const role = req.userRole || "user";
  const userId = req.userId || "anonymous";
  if (role !== "admin" && record.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });
  const items = await db.getDocumentsForSalary(id);
  const resp: ListDocumentsResponse = { items };
  res.json(resp);
};

const uploadDocs: RequestHandler = async (req, res) => {
  const { id } = req.params; // salaryId
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  const role = req.userRole || "user";
  const userId = req.userId || "anonymous";
  if (role !== "admin" && record.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const files = (req as any).files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0)
    return res.status(400).json({ error: "No files uploaded" });

  for (const f of files) {
    const doc: SalaryDocument = {
      id: nanoid(12),
      salaryId: id,
      originalName: f.originalname,
      filename: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      url: buildDocUrl(f.filename),
      createdAt: new Date().toISOString(),
    };
    await db.addDocument(doc);
  }

  const docs = await db.getDocumentsForSalary(id);
  res.status(201).json({ items: docs });
};

const deleteDoc: RequestHandler = async (req, res) => {
  const { id, docId } = req.params;
  const record = await db.getSalary(id);
  if (!record) return res.status(404).json({ error: "Not found" });
  await db.deleteDocument(id, docId);
  res.status(204).send();
};

export function salariesRouter() {
  const router = Router();
  router.get("/", list);
  router.get("/:id", getOne);
  router.post("/", create);
  router.put("/:id", requireAdmin, update);
  router.delete("/:id", requireAdmin, remove);
  router.get("/:id/documents", listDocs);
  router.post("/:id/documents", upload.array("files", 5), uploadDocs);
  router.delete("/:id/documents/:docId", requireAdmin, deleteDoc);
  return router;
}
