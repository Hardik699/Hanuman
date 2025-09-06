import { promises as fs } from "fs";
import path from "path";
import { SalaryRecord, SalaryDocument } from "@shared/api";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "salaries.json");

type DBShape = {
  salaries: SalaryRecord[];
  documents: SalaryDocument[];
};

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    const initial: DBShape = { salaries: [], documents: [] };
    await fs.writeFile(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readDB(): Promise<DBShape> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  return JSON.parse(raw) as DBShape;
}

async function writeDB(db: DBShape): Promise<void> {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(db, null, 2), "utf8");
}

export const db = {
  async getSalaries() {
    const { salaries } = await readDB();
    return salaries;
  },
  async getSalary(id: string) {
    const { salaries } = await readDB();
    return salaries.find((s) => s.id === id) ?? null;
  },
  async upsertSalary(record: SalaryRecord) {
    const current = await readDB();
    const idx = current.salaries.findIndex((s) => s.id === record.id);
    if (idx >= 0) current.salaries[idx] = record;
    else current.salaries.push(record);
    await writeDB(current);
  },
  async deleteSalary(id: string) {
    const current = await readDB();
    current.salaries = current.salaries.filter((s) => s.id !== id);
    current.documents = current.documents.filter((d) => d.salaryId !== id);
    await writeDB(current);
  },
  async getDocumentsForSalary(salaryId: string) {
    const { documents } = await readDB();
    return documents.filter((d) => d.salaryId === salaryId);
  },
  async addDocument(doc: SalaryDocument) {
    const current = await readDB();
    current.documents.push(doc);
    await writeDB(current);
  },
  async deleteDocument(salaryId: string, docId: string) {
    const current = await readDB();
    current.documents = current.documents.filter(
      (d) => !(d.salaryId === salaryId && d.id === docId),
    );
    await writeDB(current);
  },
};
