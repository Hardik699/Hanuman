import type { LucideIcon } from "lucide-react";

export type Asset = {
  id: string;
  category: string;
  serialNumber: string;
  vendorName: string;
  companyName?: string;
  purchaseDate: string;
  warrantyEndDate: string;
  createdAt: string;
  vonageNumber?: string;
  vonageExtCode?: string;
  vonagePassword?: string;
  vitelNumber?: string;
  vitelExtCode?: string;
  vitelPassword?: string;
  // RAM-specific optional fields
  ramSize?: string; // e.g., 2GB, 4GB, 8GB, 16GB
  ramType?: string; // e.g., DDR2, DDR3, DDR4, DDR5
  // Motherboard-specific optional field
  processorModel?: string; // e.g., i3, i5, i6, i7, i9
  // Storage-specific optional fields
  storageType?: string; // SSD or HDD
  storageCapacity?: string; // e.g., 128GB, 256GB, 512GB, 1TB, 2TB
};

export const STORAGE_KEY = "systemAssets";

export function categoryCodeFor(category: string): string {
  switch (category) {
    case "mouse":
      return "M";
    case "keyboard":
      return "K";
    case "motherboard":
      return "MB";
    case "ram":
      return "R";
    case "power-supply":
      return "PS";
    case "headphone":
      return "H";
    case "camera":
      return "C";
    case "monitor":
      return "MN";
    case "vonage":
      return "V";
    case "vitel-global":
      return "VG";
    case "storage":
      return "ST";
    default:
      return "X";
  }
}

export function nextWxId(assets: Asset[], category: string): string {
  const code = categoryCodeFor(category);
  let max = 0;
  for (const a of assets) {
    if (a.category !== category) continue;
    const mNew = a.id.match(new RegExp(`^WX-${code}-(\\d+)$`));
    if (mNew) {
      const n = parseInt(mNew[1], 10);
      if (!Number.isNaN(n)) {
        max = Math.max(max, n);
      }
      continue;
    }
    const mOld = a.id.match(/^WX-(\d+)$/);
    if (mOld) {
      const n = parseInt(mOld[1], 10);
      if (!Number.isNaN(n)) {
        max = Math.max(max, n);
      }
    }
  }
  const next = String(max + 1).padStart(3, "0");
  return `WX-${code}-${next}`;
}

export type RegistryItem = {
  title: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
};

export const canonical: Record<string, string> = {
  moush: "mouse",
  keybord: "keyboard",
  motherbord: "motherboard",
  rem: "ram",
  hadphone: "headphone",
  moniter: "monitor",
  ssd: "storage",
  hdd: "storage",
  "hard-disk": "storage",
  storage: "storage",
  vitel: "vitel-global",
  "vitel-global": "vitel-global",
  vitelglobal: "vitel-global",
};
