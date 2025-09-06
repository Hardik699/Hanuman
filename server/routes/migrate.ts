import type { RequestHandler } from "express";
import * as fileStore from "../data/store";
import { db as pgdb } from "../data/postgres";

export const migrateSalariesToPostgres: RequestHandler = async (_req, res) => {
  const salaries = await fileStore.db.getSalaries();
  let migrated = 0;
  for (const s of salaries) {
    await pgdb.upsertSalary(s);
    const docs = await fileStore.db.getDocumentsForSalary(s.id);
    for (const d of docs) {
      await pgdb.addDocument(d);
    }
    migrated += 1;
  }
  res.json({ migrated, message: "Migration to Postgres completed" });
};
