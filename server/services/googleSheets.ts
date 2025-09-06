import type { RequestHandler } from "express";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; // read/write

function getSpreadsheetUrl(id: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

async function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set");
  const creds = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any }) as any;
}

async function ensureSheetExists(
  sheets: any,
  spreadsheetId: string,
  title: string,
) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s: any) => s.properties?.title === title,
  );
  if (existing) return existing.properties.sheetId as number;
  const add = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
  const replies = add.data.replies || [];
  const id = replies[0]?.addSheet?.properties?.sheetId;
  return id ?? 0;
}

function objKeysUnion(rows: any[]): string[] {
  const set = new Set<string>();
  for (const r of rows) Object.keys(r || {}).forEach((k) => set.add(k));
  return Array.from(set);
}

async function writeTable(
  sheets: any,
  spreadsheetId: string,
  title: string,
  rows: any[],
) {
  await ensureSheetExists(sheets, spreadsheetId, title);
  const headers = objKeysUnion(rows);
  const values = [
    headers,
    ...rows.map((r) => headers.map((h) => (r?.[h] ?? "") as string)),
  ];
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${title}!A:ZZ`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${title}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

// IT
export const getSpreadsheetInfo: RequestHandler = async (_req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
      return res.json({
        success: false,
        disabled: true,
        reason: !spreadsheetId
          ? "GOOGLE_SHEET_ID not set"
          : "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set",
      });
    const sheets = await getSheetsClient();
    const resp = await sheets.spreadsheets.get({ spreadsheetId });
    const title = resp.data.properties?.title || "";
    const sheetTitles = (resp.data.sheets || []).map((s: any) => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId,
    }));
    res.json({
      success: true,
      title,
      url: getSpreadsheetUrl(spreadsheetId),
      sheets: sheetTitles,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      error: e?.message || "Failed to access spreadsheet",
    });
  }
};

export const syncMasterDataToGoogleSheets: RequestHandler = async (
  req,
  res,
) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
      return res.json({
        success: false,
        disabled: true,
        reason: !spreadsheetId
          ? "GOOGLE_SHEET_ID not set"
          : "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set",
      });
    const { masterData } = req.body as { masterData: any };
    if (!masterData)
      return res
        .status(400)
        .json({ success: false, error: "Missing masterData" });

    const sheets = await getSheetsClient();

    // Summary
    const summary = [
      {
        employees: (masterData.employees || []).length,
        systemAssets: (masterData.systemAssets || []).length,
        pcLaptopAssets: (masterData.pcLaptopAssets || []).length,
        itAccounts: (masterData.itAccounts || []).length,
        salaryRecords: (masterData.salaryRecords || []).length,
        leaveRequests: (masterData.leaveRequests || []).length,
        pendingITNotifications: (masterData.pendingITNotifications || [])
          .length,
        updatedAt: new Date().toISOString(),
      },
    ];
    await writeTable(sheets, spreadsheetId, "Summary", summary);

    // IT-related
    await writeTable(
      sheets,
      spreadsheetId,
      "System_Assets",
      masterData.systemAssets || [],
    );

    // System Assets by category
    const assets = (masterData.systemAssets || []) as any[];
    const byCat = (c: string) =>
      assets.filter((a) => (a?.category || "").toLowerCase() === c);
    await writeTable(sheets, spreadsheetId, "Mouse", byCat("mouse"));
    await writeTable(sheets, spreadsheetId, "Keyboard", byCat("keyboard"));
    await writeTable(
      sheets,
      spreadsheetId,
      "Motherboard",
      byCat("motherboard"),
    );
    await writeTable(sheets, spreadsheetId, "RAM", byCat("ram"));
    await writeTable(sheets, spreadsheetId, "Storage", byCat("storage"));
    await writeTable(
      sheets,
      spreadsheetId,
      "Power_Supply",
      byCat("power-supply"),
    );
    await writeTable(sheets, spreadsheetId, "Headphone", byCat("headphone"));
    await writeTable(sheets, spreadsheetId, "Camera", byCat("camera"));
    await writeTable(sheets, spreadsheetId, "Monitor", byCat("monitor"));
    await writeTable(sheets, spreadsheetId, "Vonage", byCat("vonage"));

    await writeTable(
      sheets,
      spreadsheetId,
      "PC_Laptop_Configs",
      masterData.pcLaptopAssets || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "IT_Accounts",
      masterData.itAccounts || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "IT_Notifications",
      masterData.pendingITNotifications || [],
    );

    res.json({ success: true, message: "Synced IT data to Google Sheets" });
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || "Sync failed" });
  }
};

// HR
export const getHRSpreadsheetInfo: RequestHandler = async (_req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_HR;
    if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
      return res.json({
        success: false,
        disabled: true,
        reason: !spreadsheetId
          ? "GOOGLE_SHEET_ID_HR not set"
          : "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set",
      });
    const sheets = await getSheetsClient();
    const resp = await sheets.spreadsheets.get({ spreadsheetId });
    const title = resp.data.properties?.title || "";
    const sheetTitles = (resp.data.sheets || []).map((s: any) => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId,
    }));
    res.json({
      success: true,
      title,
      url: getSpreadsheetUrl(spreadsheetId),
      sheets: sheetTitles,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      error: e?.message || "Failed to access spreadsheet",
    });
  }
};

export const syncHRDataToGoogleSheets: RequestHandler = async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_HR;
    if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
      return res.json({
        success: false,
        disabled: true,
        reason: !spreadsheetId
          ? "GOOGLE_SHEET_ID_HR not set"
          : "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not set",
      });
    const { masterData } = req.body as { masterData: any };
    if (!masterData)
      return res
        .status(400)
        .json({ success: false, error: "Missing masterData" });

    const sheets = await getSheetsClient();

    const summary = [
      {
        employees: (masterData.employees || []).length,
        departments: (masterData.departments || []).length,
        leaveRequests: (masterData.leaveRequests || []).length,
        attendanceRecords: (masterData.attendanceRecords || []).length,
        salaryRecords: (masterData.salaryRecords || []).length,
        updatedAt: new Date().toISOString(),
      },
    ];
    await writeTable(sheets, spreadsheetId, "Summary", summary);

    await writeTable(
      sheets,
      spreadsheetId,
      "Employees",
      masterData.employees || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "Departments",
      masterData.departments || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "Leave_Requests",
      masterData.leaveRequests || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "Attendance_Records",
      masterData.attendanceRecords || [],
    );
    await writeTable(
      sheets,
      spreadsheetId,
      "Salary_Records",
      masterData.salaryRecords || [],
    );

    res.json({ success: true, message: "Synced HR data to Google Sheets" });
  } catch (e: any) {
    res
      .status(500)
      .json({ success: false, error: e?.message || "HR sync failed" });
  }
};
