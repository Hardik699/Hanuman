import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mouse,
  Keyboard,
  Cpu,
  HardDrive,
  PlugZap,
  Headphones,
  Camera,
  Monitor,
  Phone,
  type LucideIcon,
} from "lucide-react";
import {
  STORAGE_KEY,
  nextWxId,
  canonical,
  type Asset,
} from "@/lib/systemAssets";

const registry: Record<
  string,
  { title: string; Icon: LucideIcon; color: string; bg: string }
> = {
  mouse: {
    title: "Mouse",
    Icon: Mouse,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  keyboard: {
    title: "Keyboard",
    Icon: Keyboard,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  motherboard: {
    title: "Motherboard",
    Icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  ram: {
    title: "RAM",
    Icon: HardDrive,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  "power-supply": {
    title: "Power Supply",
    Icon: PlugZap,
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  headphone: {
    title: "Headphone",
    Icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  camera: {
    title: "Camera",
    Icon: Camera,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
  },
  monitor: {
    title: "Monitor",
    Icon: Monitor,
    color: "text-teal-400",
    bg: "bg-teal-500/20",
  },
  storage: {
    title: "SSD/HDD",
    Icon: HardDrive,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  vonage: {
    title: "Vonage",
    Icon: Phone,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
  },
  "vitel-global": {
    title: "Vitel Global",
    Icon: Phone,
    color: "text-amber-300",
    bg: "bg-amber-500/20",
  },
  // Alternate spellings
  moush: {
    title: "Mouse",
    Icon: Mouse,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  keybord: {
    title: "Keyboard",
    Icon: Keyboard,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  motherbord: {
    title: "Motherboard",
    Icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  rem: {
    title: "RAM",
    Icon: HardDrive,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  hadphone: {
    title: "Headphone",
    Icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  moniter: {
    title: "Monitor",
    Icon: Monitor,
    color: "text-teal-400",
    bg: "bg-teal-500/20",
  },
};

export default function SystemInfoDetail() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const key = (slug || "").toLowerCase();
  const data = registry[key];
  const categoryKey = canonical[key] || key;
  const isVonage = categoryKey === "vonage";
  const isVitel = categoryKey === "vitel-global";
  const isTelephony = isVonage || isVitel;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: "",
    serialNumber: "",
    vendorName: "",
    companyName: "",
    purchaseDate: "",
    warrantyEndDate: "",
    vonageNumber: "",
    vonageExtCode: "",
    vonagePassword: "",
    vitelNumber: "",
    vitelExtCode: "",
    vitelPassword: "",
    ramSize: "",
    ramType: "",
    processorModel: "",
    storageType: "",
    storageCapacity: "",
    quantity: "1",
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setAssets(raw ? JSON.parse(raw) : []);
  }, []);

  const filtered = useMemo(
    () => assets.filter((a) => a.category === categoryKey),
    [assets, categoryKey],
  );

  const openForm = () => {
    const id = nextWxId(assets, categoryKey);
    setForm({
      id,
      serialNumber: "",
      vendorName: "",
      companyName: "",
      purchaseDate: "",
      warrantyEndDate: "",
      vonageNumber: "",
      vonageExtCode: "",
      vonagePassword: "",
      vitelNumber: "",
      vitelExtCode: "",
      vitelPassword: "",
      ramSize: "",
      ramType: "",
      processorModel: "",
      storageType: "",
      storageCapacity: "",
      quantity: "1",
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTelephony) {
      const number = isVitel ? form.vitelNumber : form.vonageNumber;
      const ext = isVitel ? form.vitelExtCode : form.vonageExtCode;
      const pwd = isVitel ? form.vitelPassword : form.vonagePassword;
      if (
        !form.companyName ||
        !number ||
        !ext ||
        !pwd ||
        !form.purchaseDate ||
        !form.warrantyEndDate
      ) {
        alert("Fill all fields");
        return;
      }
    } else {
      const serialRequired = categoryKey !== "ram"; // allow auto serials for RAM
      if (
        !form.companyName ||
        (serialRequired && !form.serialNumber) ||
        !form.vendorName ||
        !form.purchaseDate ||
        !form.warrantyEndDate
      ) {
        alert("Fill all fields");
        return;
      }
    }

    const record: Asset = {
      id: form.id || nextWxId(assets, categoryKey),
      category: categoryKey,
      serialNumber: (form.serialNumber || "").trim(),
      vendorName: form.vendorName.trim(),
      companyName: form.companyName.trim(),
      purchaseDate: form.purchaseDate,
      warrantyEndDate: form.warrantyEndDate,
      createdAt: new Date().toISOString(),
      vonageNumber: isVonage ? form.vonageNumber?.trim() : undefined,
      vonageExtCode: isVonage ? form.vonageExtCode?.trim() : undefined,
      vonagePassword: isVonage ? form.vonagePassword : undefined,
      vitelNumber: isVitel ? form.vitelNumber?.trim() : undefined,
      vitelExtCode: isVitel ? form.vitelExtCode?.trim() : undefined,
      vitelPassword: isVitel ? form.vitelPassword : undefined,
      ramSize: categoryKey === "ram" ? (form.ramSize || "").trim() : undefined,
      ramType: categoryKey === "ram" ? (form.ramType || "").trim() : undefined,
      processorModel:
        categoryKey === "motherboard"
          ? (form.processorModel || "").trim()
          : undefined,
      storageType:
        categoryKey === "storage" ? (form.storageType || "").trim() : undefined,
      storageCapacity:
        categoryKey === "storage"
          ? (form.storageCapacity || "").trim()
          : undefined,
    };

    const next = [record, ...assets];
    setAssets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Sync to Neon DB
    try {
      await fetch("/api/hr/assets/upsert-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-role": "admin" },
        body: JSON.stringify({ items: [record] }),
      });
    } catch (e) {
      console.warn("DB sync failed", e);
    }
    setShowForm(false);
    alert("Saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data ? (
              <span
                className={`w-12 h-12 ${data.bg} rounded-lg flex items-center justify-center`}
              >
                <data.Icon className={`h-6 w-6 ${data.color}`} />
              </span>
            ) : null}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {data ? data.title : "Item"}
              </h1>
              <p className="text-slate-400">Specifications and notes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/system-info")}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Back
            </Button>
            {data ? (
              <Button
                onClick={openForm}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add System Info
              </Button>
            ) : null}
          </div>
        </header>

        {data && showForm && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                Add System Info: {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={save}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label className="text-slate-300">ID</Label>
                  <Input
                    value={form.id}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Category</Label>
                  <Input
                    value={data.title}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                {isTelephony ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        value={form.companyName || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        {isVitel ? "Vitel Global Number" : "Vonage Number"}
                      </Label>
                      <Input
                        value={
                          isVitel
                            ? form.vitelNumber || ""
                            : form.vonageNumber || ""
                        }
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            ...(isVitel
                              ? { vitelNumber: e.target.value }
                              : { vonageNumber: e.target.value }),
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Extension Code</Label>
                      <Input
                        value={
                          isVitel
                            ? form.vitelExtCode || ""
                            : form.vonageExtCode || ""
                        }
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            ...(isVitel
                              ? { vitelExtCode: e.target.value }
                              : { vonageExtCode: e.target.value }),
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter extension code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={
                          isVitel
                            ? form.vitelPassword || ""
                            : form.vonagePassword || ""
                        }
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            ...(isVitel
                              ? { vitelPassword: e.target.value }
                              : { vonagePassword: e.target.value }),
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Purchase Date</Label>
                      <Input
                        type="date"
                        value={form.purchaseDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            purchaseDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Warranty End Date
                      </Label>
                      <Input
                        type="date"
                        value={form.warrantyEndDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            warrantyEndDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        value={form.companyName || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Serial Number</Label>
                      <Input
                        value={form.serialNumber || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            serialNumber: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter serial"
                      />
                    </div>

                    {categoryKey === "ram" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-slate-300">RAM Size</Label>
                          <Select
                            value={form.ramSize}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, ramSize: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {[
                                "2GB",
                                "4GB",
                                "8GB",
                                "16GB",
                                "32GB",
                                "64GB",
                              ].map((sz) => (
                                <SelectItem key={sz} value={sz}>
                                  {sz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">RAM Type</Label>
                          <Select
                            value={form.ramType}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, ramType: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {["DDR2", "DDR3", "DDR4", "DDR5"].map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {categoryKey === "motherboard" && (
                      <div className="space-y-2">
                        <Label className="text-slate-300">Processor</Label>
                        <Select
                          value={form.processorModel}
                          onValueChange={(v) =>
                            setForm((s) => ({ ...s, processorModel: v }))
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select processor" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                            {["i3", "i5", "i6", "i7", "i9"].map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {categoryKey === "storage" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Storage Type</Label>
                          <Select
                            value={form.storageType}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, storageType: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {["SSD", "HDD", "NVMe"].map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Capacity</Label>
                          <Select
                            value={form.storageCapacity}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, storageCapacity: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {[
                                "128GB",
                                "256GB",
                                "512GB",
                                "1TB",
                                "2TB",
                                "4TB",
                              ].map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label className="text-slate-300">Vendor Name</Label>
                      <Input
                        value={form.vendorName || ""}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, vendorName: e.target.value }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter vendor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Purchase Date</Label>
                      <Input
                        type="date"
                        value={form.purchaseDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            purchaseDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Warranty End Date
                      </Label>
                      <Input
                        type="date"
                        value={form.warrantyEndDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            warrantyEndDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-slate-300">No records</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    {isTelephony ? (
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Ext Code</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty End Date</TableHead>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Serial Number</TableHead>
                        {categoryKey === "ram" && (
                          <TableHead>RAM Size</TableHead>
                        )}
                        {categoryKey === "ram" && (
                          <TableHead>RAM Type</TableHead>
                        )}
                        {categoryKey === "motherboard" && (
                          <TableHead>Processor</TableHead>
                        )}
                        {categoryKey === "storage" && (
                          <TableHead>Type</TableHead>
                        )}
                        {categoryKey === "storage" && (
                          <TableHead>Capacity</TableHead>
                        )}
                        <TableHead>Vendor</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty End Date</TableHead>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) =>
                      isTelephony ? (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.id}</TableCell>
                          <TableCell>{a.companyName}</TableCell>
                          <TableCell>
                            {isVitel
                              ? (a as any).vitelNumber
                              : (a as any).vonageNumber}
                          </TableCell>
                          <TableCell>
                            {isVitel
                              ? (a as any).vitelExtCode
                              : (a as any).vonageExtCode}
                          </TableCell>
                          <TableCell>
                            {isVitel
                              ? (a as any).vitelPassword
                              : (a as any).vonagePassword}
                          </TableCell>
                          <TableCell>{a.purchaseDate}</TableCell>
                          <TableCell>{a.warrantyEndDate}</TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.id}</TableCell>
                          <TableCell>{a.companyName}</TableCell>
                          <TableCell>{a.serialNumber}</TableCell>
                          {categoryKey === "ram" && (
                            <TableCell>{(a as any).ramSize || "-"}</TableCell>
                          )}
                          {categoryKey === "ram" && (
                            <TableCell>{(a as any).ramType || "-"}</TableCell>
                          )}
                          {categoryKey === "motherboard" && (
                            <TableCell>
                              {(a as any).processorModel || "-"}
                            </TableCell>
                          )}
                          {categoryKey === "storage" && (
                            <TableCell>
                              {(a as any).storageType || "-"}
                            </TableCell>
                          )}
                          {categoryKey === "storage" && (
                            <TableCell>
                              {(a as any).storageCapacity || "-"}
                            </TableCell>
                          )}
                          <TableCell>{a.vendorName}</TableCell>
                          <TableCell>{a.purchaseDate}</TableCell>
                          <TableCell>{a.warrantyEndDate}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {categoryKey && (
              <Badge
                className="bg-slate-700 text-slate-300"
                variant="secondary"
              >
                {categoryKey}
              </Badge>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
