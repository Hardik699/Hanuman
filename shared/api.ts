/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ---- Salary management shared types ----
export type UserRole = "admin" | "user";

export interface SalaryRecord {
  id: string;
  userId: string; // owner/creator id
  employeeName: string;
  month: number; // 1-12
  year: number; // e.g., 2025
  amount: number; // cents or currency unit (assume unit)
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface SalaryDocument {
  id: string;
  salaryId: string;
  originalName: string;
  filename: string; // stored filename
  mimeType: string;
  size: number;
  url: string; // public url served by express
  createdAt: string;
}

export interface ListSalariesResponse {
  items: SalaryRecord[];
}

export interface CreateSalaryInput {
  userId: string;
  employeeName: string;
  month: number;
  year: number;
  amount: number;
  notes?: string;
}

export interface UpdateSalaryInput {
  employeeName?: string;
  month?: number;
  year?: number;
  amount?: number;
  notes?: string;
}

export interface SalaryWithDocs extends SalaryRecord {
  documents: SalaryDocument[];
}

export interface ListDocumentsResponse {
  items: SalaryDocument[];
}

// ---- HR / IT shared types ----
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  status: "active" | "inactive";
  tableNumber?: string;
  createdAt: string;
}

export interface SystemAsset {
  id: string;
  category: string; // mouse, keyboard, monitor, headphone, camera, etc.
  serialNumber: string;
  vendorName: string;
  companyName?: string;
  purchaseDate: string; // ISO date
  warrantyEndDate: string; // ISO date
  createdAt: string; // ISO date
}

export interface AssetAssignment {
  id: string;
  employeeId: string;
  assetId: string;
  assignedAt: string; // ISO
}

export interface ListEmployeesResponse {
  items: Employee[];
}
export interface ListAssetsResponse {
  items: SystemAsset[];
}
export interface ListAssignmentsResponse {
  items: AssetAssignment[];
}
