import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CreateSalaryInput,
  ListDocumentsResponse,
  ListSalariesResponse,
  SalaryRecord,
  SalaryWithDocs,
  UserRole,
} from "@shared/api";

function useRoleHeaders(role: UserRole, userId: string) {
  return useMemo(
    () => ({ "x-role": role, "x-user-id": userId }),
    [role, userId],
  );
}

export default function Salary() {
  const qc = useQueryClient();
  const [role, setRole] = useState<UserRole>("admin");
  const [userId, setUserId] = useState("user-1");

  const headers = useRoleHeaders(role, userId);

  const list = useQuery({
    queryKey: ["salaries", role, userId],
    queryFn: async (): Promise<ListSalariesResponse> => {
      const res = await fetch("/api/salaries", { headers });
      if (!res.ok) throw new Error("Failed to load salaries");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (input: CreateSalaryInput): Promise<SalaryRecord> => {
      const res = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salaries"] }),
  });

  const [form, setForm] = useState({
    employeeName: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    notes: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateSalaryInput = {
      userId,
      employeeName: form.employeeName.trim(),
      month: Number(form.month),
      year: Number(form.year),
      amount: Number(form.amount),
      notes: form.notes?.trim() || undefined,
    };
    create.mutate(payload);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Salary Records</h1>
        <div className="flex items-center gap-2">
          <Label className="mr-2">Role</Label>
          <select
            className="rounded-md bg-secondary px-2 py-1"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <Label className="ml-4 mr-2">User ID</Label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <Card className="p-4">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          <div className="md:col-span-2">
            <Label>Employee Name</Label>
            <Input
              value={form.employeeName}
              onChange={(e) =>
                setForm((f) => ({ ...f, employeeName: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Month</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={form.month}
              onChange={(e) =>
                setForm((f) => ({ ...f, month: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div>
            <Label>Year</Label>
            <Input
              type="number"
              min={1900}
              max={3000}
              value={form.year}
              onChange={(e) =>
                setForm((f) => ({ ...f, year: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: Number(e.target.value) }))
              }
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-6 flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              Add Salary
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.data?.items.map((s) => (
              <SalaryRow
                key={s.id}
                s={s}
                headers={headers}
                canManage={role === "admin" || s.userId === userId}
                onChanged={() =>
                  qc.invalidateQueries({ queryKey: ["salaries"] })
                }
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function SalaryRow({
  s,
  headers,
  canManage,
  onChanged,
}: {
  s: SalaryRecord;
  headers: Record<string, string>;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [docs, setDocs] = useState<ListDocumentsResponse | null>(null);
  const loadDocs = async () => {
    const res = await fetch(`/api/salaries/${s.id}/documents`, { headers });
    if (res.ok) setDocs(await res.json());
  };
  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch(`/api/salaries/${s.id}/documents`, {
      method: "POST",
      headers,
      body: fd as any,
    });
    if (res.ok) setDocs(await res.json());
  };

  const delSalary = async () => {
    if (!confirm("Delete salary?")) return;
    const res = await fetch(`/api/salaries/${s.id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) onChanged();
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{s.employeeName}</TableCell>
      <TableCell>
        {s.month}/{s.year}
      </TableCell>
      <TableCell>{s.amount}</TableCell>
      <TableCell>{s.userId}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {docs?.items.map((d) => (
            <DocPreview
              key={d.id}
              url={d.url}
              mime={d.mimeType}
              name={d.originalName}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFiles(e.target.files)}
          />
          <Button size="sm" onClick={upload} disabled={!files}>
            Upload
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={!canManage}
            onClick={delSalary}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DocPreview({
  url,
  mime,
  name,
}: {
  url: string;
  mime: string;
  name: string;
}) {
  if (mime.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={name}
        className="h-16 w-16 object-cover rounded-md border"
      />
    );
  }
  if (mime === "application/pdf") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-400"
      >
        PDF: {name}
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="underline text-blue-400"
    >
      {name}
    </a>
  );
}
