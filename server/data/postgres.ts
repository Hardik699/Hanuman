import { Pool } from "pg";
import type { SalaryRecord, SalaryDocument } from "@shared/api";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL;
if (!DATABASE_URL) {
  throw new Error(
    "No database URL found. Set DATABASE_URL or NETLIFY_DATABASE_URL (or NETLIFY_DATABASE_URL_UNPOOLED/POSTGRES_URL).",
  );
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  // Create tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS salaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
      year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 3000),
      amount NUMERIC NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS salary_documents (
      id TEXT PRIMARY KEY,
      salary_id TEXT NOT NULL REFERENCES salaries(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_salary_documents_salary_id ON salary_documents(salary_id);

    -- HR / IT tables
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL,
      table_number TEXT,
      profile JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile JSONB;

    CREATE TABLE IF NOT EXISTS system_assets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      company_name TEXT,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    ALTER TABLE system_assets ADD COLUMN IF NOT EXISTS metadata JSONB;

    -- Per-category tables (for reporting or future specialization)
    CREATE TABLE IF NOT EXISTS mice (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keyboards (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS motherboards (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rams (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS storages (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS power_supplies (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS headphones (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cameras (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      serial_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      warranty_end_date DATE NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vonage_numbers (
      id TEXT PRIMARY KEY,
      number TEXT,
      ext_code TEXT,
      password TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vitel_global_numbers (
      id TEXT PRIMARY KEY,
      number TEXT,
      ext_code TEXT,
      password TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL
    );

    -- PC/Laptop asset composition table
    CREATE TABLE IF NOT EXISTS pc_laptop_assets (
      id TEXT PRIMARY KEY,
      mouse_id TEXT,
      keyboard_id TEXT,
      motherboard_id TEXT,
      ram_id TEXT,
      ram_id2 TEXT,
      storage_id TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS asset_assignments (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      asset_id TEXT NOT NULL REFERENCES system_assets(id) ON DELETE CASCADE,
      assigned_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS it_accounts (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_category ON system_assets(category);
    CREATE INDEX IF NOT EXISTS idx_assign_emp ON asset_assignments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_assign_asset ON asset_assignments(asset_id);
  `);
}

init().catch((err) => {
  console.error("Failed to initialize Postgres schema:", err);
});

function rowToSalary(r: any): SalaryRecord {
  return {
    id: r.id,
    userId: r.user_id,
    employeeName: r.employee_name,
    month: Number(r.month),
    year: Number(r.year),
    amount: Number(r.amount),
    notes: r.notes ?? undefined,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

function rowToDocument(r: any): SalaryDocument {
  return {
    id: r.id,
    salaryId: r.salary_id,
    originalName: r.original_name,
    filename: r.filename,
    mimeType: r.mime_type,
    size: Number(r.size),
    url: r.url,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export const db = {
  async getSalaries(): Promise<SalaryRecord[]> {
    const { rows } = await pool.query(
      "SELECT * FROM salaries ORDER BY created_at DESC",
    );
    return rows.map(rowToSalary);
  },

  async getSalary(id: string): Promise<SalaryRecord | null> {
    const { rows } = await pool.query("SELECT * FROM salaries WHERE id=$1", [
      id,
    ]);
    return rows[0] ? rowToSalary(rows[0]) : null;
  },

  async upsertSalary(record: SalaryRecord): Promise<void> {
    await pool.query(
      `INSERT INTO salaries (id, user_id, employee_name, month, year, amount, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         employee_name = EXCLUDED.employee_name,
         month = EXCLUDED.month,
         year = EXCLUDED.year,
         amount = EXCLUDED.amount,
         notes = EXCLUDED.notes,
         created_at = LEAST(salaries.created_at, EXCLUDED.created_at),
         updated_at = EXCLUDED.updated_at
      `,
      [
        record.id,
        record.userId,
        record.employeeName,
        record.month,
        record.year,
        record.amount,
        record.notes ?? null,
        new Date(record.createdAt).toISOString(),
        new Date(record.updatedAt).toISOString(),
      ],
    );
  },

  async deleteSalary(id: string): Promise<void> {
    await pool.query("DELETE FROM salaries WHERE id=$1", [id]);
  },

  async getDocumentsForSalary(salaryId: string): Promise<SalaryDocument[]> {
    const { rows } = await pool.query(
      "SELECT * FROM salary_documents WHERE salary_id=$1 ORDER BY created_at DESC",
      [salaryId],
    );
    return rows.map(rowToDocument);
  },

  async addDocument(doc: SalaryDocument): Promise<void> {
    await pool.query(
      `INSERT INTO salary_documents (id, salary_id, original_name, filename, mime_type, size, url, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        doc.id,
        doc.salaryId,
        doc.originalName,
        doc.filename,
        doc.mimeType,
        doc.size,
        doc.url,
        new Date(doc.createdAt).toISOString(),
      ],
    );
  },

  async deleteDocument(salaryId: string, docId: string): Promise<void> {
    await pool.query(
      "DELETE FROM salary_documents WHERE salary_id=$1 AND id=$2",
      [salaryId, docId],
    );
  },
};
