import type { RequestHandler, Router } from "express";
import express from "express";
import { nanoid } from "nanoid";
import { pool } from "../data/postgres";
import { requireAdmin } from "../middleware/auth";
import type {
  Employee,
  SystemAsset,
  AssetAssignment,
  ListEmployeesResponse,
  ListAssetsResponse,
  ListAssignmentsResponse,
} from "@shared/api";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
];
const CATEGORIES = ["mouse", "keyboard", "monitor", "headphone", "camera"]; // primary demo categories

function getCategoryTable(cat: string): string | null {
  switch ((cat || "").toLowerCase()) {
    case "mouse":
      return "mice";
    case "keyboard":
      return "keyboards";
    case "monitor":
      return "monitors";
    case "headphone":
      return "headphones";
    case "camera":
      return "cameras";
    case "motherboard":
      return "motherboards";
    case "ram":
      return "rams";
    case "storage":
      return "storages";
    case "power-supply":
      return "power_supplies";
    case "vonage":
      return "vonage_numbers";
    case "vitel-global":
      return "vitel_global_numbers";
    default:
      return null;
  }
}

const randomFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const seedDemo: RequestHandler = async (req, res, next) => {
  try {
    const count = Math.max(1, Math.min(100, Number(req.query.count) || 10));

    const { rows: existing } = await pool.query(
      "SELECT COUNT(*)::int AS c FROM employees",
    );
    if (existing[0]?.c >= count) {
      return res.json({
        message: "Employees already present; skipping seed",
        employees: existing[0].c,
      });
    }

    const nowIso = new Date().toISOString();
    const warrantyEnd = new Date();
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 1);

    for (let i = 0; i < count; i++) {
      const id = nanoid(12);
      const fullName = `Demo User ${String(i + 1).padStart(2, "0")}`;
      const email = `demo${i + 1}@example.com`;
      const department = randomFrom(DEPARTMENTS);
      const tableNumber = String((i % 20) + 1);
      await pool.query(
        `INSERT INTO employees (id, full_name, email, department, status, table_number, created_at)
         VALUES ($1,$2,$3,$4,'active',$5,$6)`,
        [id, fullName, email, department, tableNumber, nowIso],
      );

      // create 5 gadgets per employee and assign
      for (const cat of CATEGORIES) {
        const assetId = nanoid(12);
        const serial = `${cat.toUpperCase()}-${Date.now()}-${i}`;
        const vendor = ["Logitech", "HP", "Dell", "Sony", "Lenovo"][i % 5];
        await pool.query(
          `INSERT INTO system_assets (id, category, serial_number, vendor_name, company_name, purchase_date, warranty_end_date, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            assetId,
            cat,
            serial,
            vendor,
            "Demo Corp",
            new Date().toISOString().slice(0, 10),
            warrantyEnd.toISOString().slice(0, 10),
            nowIso,
          ],
        );
        const catTable = getCategoryTable(cat);
        if (catTable) {
          await pool.query(
            `INSERT INTO ${catTable} (id, serial_number, vendor_name, purchase_date, warranty_end_date, created_at)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT (id) DO UPDATE SET
               serial_number = EXCLUDED.serial_number,
               vendor_name = EXCLUDED.vendor_name,
               purchase_date = EXCLUDED.purchase_date,
               warranty_end_date = EXCLUDED.warranty_end_date,
               created_at = LEAST(${catTable}.created_at, EXCLUDED.created_at)`,
            [
              assetId,
              serial,
              vendor,
              new Date().toISOString().slice(0, 10),
              warrantyEnd.toISOString().slice(0, 10),
              nowIso,
            ],
          );
        }
        const assignId = nanoid(12);
        await pool.query(
          `INSERT INTO asset_assignments (id, employee_id, asset_id, assigned_at) VALUES ($1,$2,$3,$4)`,
          [assignId, id, assetId, nowIso],
        );
      }
    }

    res.json({
      message: "Seeded demo employees and gadgets",
      employees: count,
      gadgetsPerEmployee: CATEGORIES.length,
    });
  } catch (err) {
    next(err);
  }
};

const listEmployees: RequestHandler = async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM employees ORDER BY created_at DESC",
  );
  const items: Employee[] = rows.map((r: any) => {
    const base: Employee = {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      department: r.department,
      status: r.status,
      tableNumber: r.table_number || undefined,
      createdAt: new Date(r.created_at).toISOString(),
    } as any;
    if (r.profile && typeof r.profile === "object") {
      return {
        ...r.profile,
        id: r.id,
        status: r.status,
        department: r.department,
        tableNumber: r.table_number || undefined,
      };
    }
    return base;
  });
  const resp: ListEmployeesResponse = { items };
  res.json(resp);
};

const createEmployee: RequestHandler = async (req, res, next) => {
  try {
    const id = req.body?.id || nanoid(12);
    const full = req.body || {};
    const fullName = full.fullName || full.name || "Unnamed";
    const email = full.email || `${id}@example.com`;
    const department = full.department || "General";
    const status = full.status || "active";
    const tableNumber = full.tableNumber || null;
    const createdAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO employees (id, full_name, email, department, status, table_number, profile, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         email = EXCLUDED.email,
         department = EXCLUDED.department,
         status = EXCLUDED.status,
         table_number = EXCLUDED.table_number,
         profile = EXCLUDED.profile`,
      [
        id,
        fullName,
        email,
        department,
        status,
        tableNumber,
        JSON.stringify(full),
        createdAt,
      ],
    );
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const full = req.body || {};
    const fullName = full.fullName || null;
    const email = full.email || null;
    const department = full.department || null;
    const status = full.status || null;
    const tableNumber = full.tableNumber || null;

    await pool.query(
      `UPDATE employees SET
         full_name = COALESCE($2, full_name),
         email = COALESCE($3, email),
         department = COALESCE($4, department),
         status = COALESCE($5, status),
         table_number = COALESCE($6, table_number),
         profile = COALESCE($7, profile)
       WHERE id = $1`,
      [
        id,
        fullName,
        email,
        department,
        status,
        tableNumber,
        JSON.stringify(full),
      ],
    );
    res.json({ id });
  } catch (err) {
    next(err);
  }
};

const listAssets: RequestHandler = async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM system_assets ORDER BY created_at DESC",
  );
  const items: any[] = rows.map((r: any) => ({
    id: r.id,
    category: r.category,
    serialNumber: r.serial_number,
    vendorName: r.vendor_name,
    companyName: r.company_name || undefined,
    purchaseDate: new Date(r.purchase_date).toISOString().slice(0, 10),
    warrantyEndDate: new Date(r.warranty_end_date).toISOString().slice(0, 10),
    createdAt: new Date(r.created_at).toISOString(),
    ...(r.metadata || {}),
  }));
  const resp: ListAssetsResponse = { items };
  res.json(resp);
};

const upsertAssetsBatch: RequestHandler = async (req, res, next) => {
  try {
    const items: SystemAsset[] = Array.isArray(req.body?.items)
      ? req.body.items
      : [];
    for (const a of items) {
      const meta = { ...a } as any;
      delete meta.id;
      delete meta.category;
      delete meta.serialNumber;
      delete meta.vendorName;
      delete meta.companyName;
      delete meta.purchaseDate;
      delete meta.warrantyEndDate;
      delete meta.createdAt;
      const purchase = a.purchaseDate.slice(0, 10);
      const warranty = a.warrantyEndDate.slice(0, 10);
      const createdAt = a.createdAt;
      // Upsert into canonical table
      await pool.query(
        `INSERT INTO system_assets (id, category, serial_number, vendor_name, company_name, purchase_date, warranty_end_date, metadata, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           category = EXCLUDED.category,
           serial_number = EXCLUDED.serial_number,
           vendor_name = EXCLUDED.vendor_name,
           company_name = EXCLUDED.company_name,
           purchase_date = EXCLUDED.purchase_date,
           warranty_end_date = EXCLUDED.warranty_end_date,
           metadata = EXCLUDED.metadata,
           created_at = LEAST(system_assets.created_at, EXCLUDED.created_at)`,
        [
          a.id,
          a.category,
          a.serialNumber,
          a.vendorName,
          a.companyName ?? null,
          purchase,
          warranty,
          JSON.stringify(meta),
          createdAt,
        ],
      );
      // Mirror into per-category table
      const catTable = getCategoryTable(a.category);
      if (catTable) {
        await pool.query(
          `INSERT INTO ${catTable} (id, serial_number, vendor_name, purchase_date, warranty_end_date, metadata, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO UPDATE SET
             serial_number = EXCLUDED.serial_number,
             vendor_name = EXCLUDED.vendor_name,
             purchase_date = EXCLUDED.purchase_date,
             warranty_end_date = EXCLUDED.warranty_end_date,
             metadata = EXCLUDED.metadata,
             created_at = LEAST(${catTable}.created_at, EXCLUDED.created_at)`,
          [
            a.id,
            a.serialNumber,
            a.vendorName,
            purchase,
            warranty,
            JSON.stringify(meta),
            createdAt,
          ],
        );
      }
    }
    res.json({ upserted: items.length });
  } catch (err) {
    next(err);
  }
};

const listItAccounts: RequestHandler = async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM it_accounts ORDER BY created_at DESC",
  );
  res.json({
    items: rows.map((r: any) => ({
      id: r.id,
      employeeId: r.employee_id,
      ...r.payload,
      createdAt: r.created_at,
    })),
  });
};

const createItAccount: RequestHandler = async (req, res, next) => {
  try {
    const id = req.body?.id || nanoid(12);
    const empId = req.body?.employeeId || null;
    const now = new Date().toISOString();
    await pool.query(
      `INSERT INTO it_accounts (id, employee_id, payload, created_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET employee_id = EXCLUDED.employee_id, payload = EXCLUDED.payload`,
      [id, empId, JSON.stringify(req.body || {}), now],
    );
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const listAssignments: RequestHandler = async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM asset_assignments ORDER BY assigned_at DESC",
  );
  const items: AssetAssignment[] = rows.map((r: any) => ({
    id: r.id,
    employeeId: r.employee_id,
    assetId: r.asset_id,
    assignedAt: new Date(r.assigned_at).toISOString(),
  }));
  const resp: ListAssignmentsResponse = { items };
  res.json(resp);
};

const backfillAssetCategories: RequestHandler = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, category, serial_number, vendor_name, purchase_date, warranty_end_date, metadata, created_at FROM system_assets",
    );
    let count = 0;
    for (const r of rows as any[]) {
      const t = getCategoryTable(r.category);
      if (!t) continue;
      await pool.query(
        `INSERT INTO ${t} (id, serial_number, vendor_name, purchase_date, warranty_end_date, metadata, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           serial_number = EXCLUDED.serial_number,
           vendor_name = EXCLUDED.vendor_name,
           purchase_date = EXCLUDED.purchase_date,
           warranty_end_date = EXCLUDED.warranty_end_date,
           metadata = EXCLUDED.metadata,
           created_at = LEAST(${t}.created_at, EXCLUDED.created_at)`,
        [
          r.id,
          r.serial_number,
          r.vendor_name,
          new Date(r.purchase_date).toISOString().slice(0, 10),
          new Date(r.warranty_end_date).toISOString().slice(0, 10),
          r.metadata ? JSON.stringify(r.metadata) : null,
          new Date(r.created_at).toISOString(),
        ],
      );
      count++;
    }
    res.json({ ok: true, mirrored: count });
  } catch (err) {
    next(err);
  }
};

const upsertPcLaptopsBatch: RequestHandler = async (req, res, next) => {
  try {
    const items: any[] = Array.isArray(req.body?.items) ? req.body.items : [];
    for (const pc of items) {
      await pool.query(
        `INSERT INTO pc_laptop_assets (id, mouse_id, keyboard_id, motherboard_id, ram_id, ram_id2, storage_id, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           mouse_id = EXCLUDED.mouse_id,
           keyboard_id = EXCLUDED.keyboard_id,
           motherboard_id = EXCLUDED.motherboard_id,
           ram_id = EXCLUDED.ram_id,
           ram_id2 = EXCLUDED.ram_id2,
           storage_id = EXCLUDED.storage_id,
           created_at = LEAST(pc_laptop_assets.created_at, EXCLUDED.created_at)`,
        [
          pc.id,
          pc.mouseId ?? null,
          pc.keyboardId ?? null,
          pc.motherboardId ?? null,
          pc.ramId ?? null,
          pc.ramId2 ?? null,
          pc.storageId ?? null,
          pc.createdAt || new Date().toISOString(),
        ],
      );
    }
    res.json({ upserted: items.length });
  } catch (err) {
    next(err);
  }
};

export async function seedDemoDirect(count = 10) {
  const req = { query: { count } } as any;
  const res = { json: (_: any) => _ } as any;
  const next = (err?: any) => {
    if (err) throw err;
  };
  await seedDemo(req as any, res as any, next as any);
}

const wipeAll: RequestHandler = async (_req, res, next) => {
  try {
    await pool.query("BEGIN");
    await pool.query(
      "TRUNCATE TABLE asset_assignments RESTART IDENTITY CASCADE",
    );
    await pool.query("TRUNCATE TABLE it_accounts RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE employees RESTART IDENTITY CASCADE");
    await pool.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await pool.query("ROLLBACK");
    next(err);
  }
};

export async function wipeDirect() {
  await pool.query("BEGIN");
  try {
    await pool.query(
      "TRUNCATE TABLE asset_assignments RESTART IDENTITY CASCADE",
    );
    await pool.query("TRUNCATE TABLE it_accounts RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE employees RESTART IDENTITY CASCADE");
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
}

export function hrRouter(): Router {
  const router = express.Router();
  router.post("/seed-demo", requireAdmin, seedDemo);
  router.post("/admin/wipe", requireAdmin, wipeAll);
  router.get("/employees", listEmployees);
  router.post("/employees", requireAdmin, createEmployee);
  router.put("/employees/:id", requireAdmin, updateEmployee);
  router.get("/assets", listAssets);
  router.post("/assets/upsert-batch", requireAdmin, upsertAssetsBatch);
  router.get("/it-accounts", listItAccounts);
  router.post("/it-accounts", requireAdmin, createItAccount);
  router.post("/pc-laptops/upsert-batch", requireAdmin, upsertPcLaptopsBatch);
  router.get("/assignments", listAssignments);
  router.post(
    "/admin/backfill-asset-categories",
    requireAdmin,
    backfillAssetCategories,
  );
  return router;
}
