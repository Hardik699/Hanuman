import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";

type Asset = {
  id: string;
  createdAt: string;
  mouseId?: string;
  keyboardId?: string;
  motherboardId?: string;
  cameraId?: string;
  headphoneId?: string;
  powerSupplyId?: string;
  storageId?: string;
  ramId?: string;
  ramId2?: string;
};

type SysAsset = {
  id: string;
  category: string;
  storageType?: string;
  storageCapacity?: string;
};

const STORAGE_KEY = "pcLaptopAssets";
const SYS_STORAGE_KEY = "systemAssets";

function nextWxId(list: Asset[]): string {
  let max = 0;
  for (const a of list) {
    const m = a.id.match(/^WX-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }
  const next = String(max + 1).padStart(3, "0");
  return `WX-${next}`;
}

export default function PCLaptopInfo() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Asset[]>([]);
  const [mouseAssets, setMouseAssets] = useState<SysAsset[]>([]);
  const [keyboardAssets, setKeyboardAssets] = useState<SysAsset[]>([]);
  const [motherboardAssets, setMotherboardAssets] = useState<SysAsset[]>([]);
  const [cameraAssets, setCameraAssets] = useState<SysAsset[]>([]);
  const [headphoneAssets, setHeadphoneAssets] = useState<SysAsset[]>([]);
  const [powerSupplyAssets, setPowerSupplyAssets] = useState<SysAsset[]>([]);
  const [storageAssets, setStorageAssets] = useState<SysAsset[]>([]);
  const [ramAssets, setRamAssets] = useState<SysAsset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | null>(null);
  const [form, setForm] = useState({
    id: "",
    mouseId: "",
    keyboardId: "",
    motherboardId: "",
    cameraId: "",
    headphoneId: "",
    powerSupplyId: "",
    storageId: "",
    ramId: "",
    ramId2: "",
  });
  const [totalRam, setTotalRam] = useState("0GB");

  // Helper function to get used IDs for a specific component type
  const getUsedIds = (items: Asset[], field: keyof Asset): string[] => {
    return items
      .map((item) => item[field])
      .filter((id): id is string => !!id && id !== "none");
  };

  // Helper function to filter available assets (not used)
  const getAvailableAssets = (
    allAssets: SysAsset[],
    usedIds: string[],
  ): SysAsset[] => {
    return allAssets.filter((asset) => !usedIds.includes(asset.id));
  };

  // Calculate total RAM whenever RAM selections change
  const calculateTotalRam = () => {
    const sysRaw = localStorage.getItem("systemAssets");
    const sysList = sysRaw ? JSON.parse(sysRaw) : [];

    let total = 0;

    // Get RAM 1 size
    if (form.ramId && form.ramId !== "none") {
      const ram1Details = sysList.find((item: any) => item.id === form.ramId);
      if (ram1Details?.ramSize) {
        const size1 = parseInt(ram1Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        total += size1;
      }
    }

    // Get RAM 2 size
    if (form.ramId2 && form.ramId2 !== "none") {
      const ram2Details = sysList.find((item: any) => item.id === form.ramId2);
      if (ram2Details?.ramSize) {
        const size2 = parseInt(ram2Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        total += size2;
      }
    }

    return total > 0 ? `${total}GB` : "0GB";
  };

  // Update total RAM when RAM selections change
  useEffect(() => {
    setTotalRam(calculateTotalRam());
  }, [form.ramId, form.ramId2]);

  useEffect(() => {
    // Reset editing state on component load
    setEditingItem(null);
    setShowForm(false);

    const raw = localStorage.getItem(STORAGE_KEY);
    const currentItems = raw ? JSON.parse(raw) : [];
    setItems(currentItems);

    const sysRaw = localStorage.getItem(SYS_STORAGE_KEY);
    const sysList: SysAsset[] = sysRaw ? JSON.parse(sysRaw) : [];

    // Get all used IDs for each component type
    const usedMouseIds = getUsedIds(currentItems, "mouseId");
    const usedKeyboardIds = getUsedIds(currentItems, "keyboardId");
    const usedMotherboardIds = getUsedIds(currentItems, "motherboardId");
    const usedCameraIds = getUsedIds(currentItems, "cameraId");
    const usedHeadphoneIds = getUsedIds(currentItems, "headphoneId");
    const usedPowerSupplyIds = getUsedIds(currentItems, "powerSupplyId");
    const usedStorageIds = getUsedIds(currentItems as any, "storageId" as any);
    const usedRamIds = Array.from(
      new Set([
        ...getUsedIds(currentItems, "ramId"),
        ...getUsedIds(currentItems as any, "ramId2" as any),
      ]),
    );

    // Filter out used IDs from available assets
    const allMouseAssets = sysList.filter((s) => s.category === "mouse");
    const allKeyboardAssets = sysList.filter((s) => s.category === "keyboard");
    const allMotherboardAssets = sysList.filter(
      (s) => s.category === "motherboard",
    );
    const allCameraAssets = sysList.filter((s) => s.category === "camera");
    const allHeadphoneAssets = sysList.filter(
      (s) => s.category === "headphone",
    );
    const allPowerSupplyAssets = sysList.filter(
      (s) => s.category === "power-supply",
    );
    const allStorageAssets = sysList.filter((s) => s.category === "storage");
    const allRamAssets = sysList.filter((s) => s.category === "ram");

    setMouseAssets(getAvailableAssets(allMouseAssets, usedMouseIds));
    setKeyboardAssets(getAvailableAssets(allKeyboardAssets, usedKeyboardIds));
    setMotherboardAssets(
      getAvailableAssets(allMotherboardAssets, usedMotherboardIds),
    );
    setCameraAssets(getAvailableAssets(allCameraAssets, usedCameraIds));
    setHeadphoneAssets(
      getAvailableAssets(allHeadphoneAssets, usedHeadphoneIds),
    );
    setPowerSupplyAssets(
      getAvailableAssets(allPowerSupplyAssets, usedPowerSupplyIds),
    );
    setStorageAssets(getAvailableAssets(allStorageAssets, usedStorageIds));
    setRamAssets(getAvailableAssets(allRamAssets, usedRamIds));
  }, []);

  const addNew = () => {
    // Force reset all edit state
    setEditingItem(null);
    setShowForm(false);

    // Then open form in add mode
    openForm();
  };

  const openForm = (itemToEdit?: Asset) => {
    // Reset form state first
    if (!itemToEdit) {
      setEditingItem(null);
    }

    // Refresh available assets before opening form
    const raw = localStorage.getItem(STORAGE_KEY);
    const currentItems = raw ? JSON.parse(raw) : [];

    const sysRaw = localStorage.getItem(SYS_STORAGE_KEY);
    const sysList: SysAsset[] = sysRaw ? JSON.parse(sysRaw) : [];

    // Get all used IDs for each component type
    // When editing, exclude the current item's IDs from "used" so they appear as available
    const itemsToCheck = itemToEdit
      ? currentItems.filter((item) => item.id !== itemToEdit.id)
      : currentItems;

    const usedMouseIds = getUsedIds(itemsToCheck, "mouseId");
    const usedKeyboardIds = getUsedIds(itemsToCheck, "keyboardId");
    const usedMotherboardIds = getUsedIds(itemsToCheck, "motherboardId");
    const usedCameraIds = getUsedIds(itemsToCheck, "cameraId");
    const usedHeadphoneIds = getUsedIds(itemsToCheck, "headphoneId");
    const usedPowerSupplyIds = getUsedIds(itemsToCheck, "powerSupplyId");
    const usedStorageIds = getUsedIds(itemsToCheck as any, "storageId" as any);
    const usedRamIds = Array.from(
      new Set([
        ...getUsedIds(itemsToCheck, "ramId"),
        ...getUsedIds(itemsToCheck as any, "ramId2" as any),
      ]),
    );

    // Get fresh available assets
    const freshMouseAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "mouse"),
      usedMouseIds,
    );
    const freshKeyboardAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "keyboard"),
      usedKeyboardIds,
    );
    const freshMotherboardAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "motherboard"),
      usedMotherboardIds,
    );
    const freshCameraAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "camera"),
      usedCameraIds,
    );
    const freshHeadphoneAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "headphone"),
      usedHeadphoneIds,
    );
    const freshPowerSupplyAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "power-supply"),
      usedPowerSupplyIds,
    );
    const freshStorageAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "storage"),
      usedStorageIds,
    );
    const freshRamAssets = getAvailableAssets(
      sysList.filter((s) => s.category === "ram"),
      usedRamIds,
    );

    // Update state with fresh data
    setMouseAssets(freshMouseAssets);
    setKeyboardAssets(freshKeyboardAssets);
    setMotherboardAssets(freshMotherboardAssets);
    setCameraAssets(freshCameraAssets);
    setHeadphoneAssets(freshHeadphoneAssets);
    setPowerSupplyAssets(freshPowerSupplyAssets);
    setStorageAssets(freshStorageAssets);
    setRamAssets(freshRamAssets);

    if (itemToEdit) {
      // Edit mode - populate form with existing data
      setEditingItem(itemToEdit);
      setForm({
        id: itemToEdit.id,
        mouseId: itemToEdit.mouseId || "none",
        keyboardId: itemToEdit.keyboardId || "none",
        motherboardId: itemToEdit.motherboardId || "none",
        cameraId: itemToEdit.cameraId || "none",
        headphoneId: itemToEdit.headphoneId || "none",
        powerSupplyId: itemToEdit.powerSupplyId || "none",
        storageId: (itemToEdit as any).storageId || "none",
        ramId: itemToEdit.ramId || "none",
        ramId2: itemToEdit.ramId2 || "none",
      });
    } else {
      // Add mode - generate new ID and set defaults
      const id = nextWxId(currentItems);
      setEditingItem(null);
      setForm({
        id,
        mouseId: "none",
        keyboardId: "none",
        motherboardId: "none",
        cameraId: "none",
        headphoneId: "none",
        powerSupplyId: "none",
        storageId: "none",
        ramId: "none",
        ramId2: "none",
      });
    }
    setShowForm(true);

    // Debug log to verify mode
    console.log(
      "Form opened in mode:",
      itemToEdit ? "EDIT" : "ADD",
      "Item:",
      itemToEdit?.id || "none",
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const record: Asset = {
      id: form.id || nextWxId(items),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      mouseId:
        form.mouseId && form.mouseId !== "none"
          ? form.mouseId.trim()
          : undefined,
      keyboardId:
        form.keyboardId && form.keyboardId !== "none"
          ? form.keyboardId.trim()
          : undefined,
      motherboardId:
        form.motherboardId && form.motherboardId !== "none"
          ? form.motherboardId.trim()
          : undefined,
      cameraId:
        form.cameraId && form.cameraId !== "none"
          ? form.cameraId.trim()
          : undefined,
      headphoneId:
        form.headphoneId && form.headphoneId !== "none"
          ? form.headphoneId.trim()
          : undefined,
      powerSupplyId:
        form.powerSupplyId && form.powerSupplyId !== "none"
          ? form.powerSupplyId.trim()
          : undefined,
      storageId:
        (form as any).storageId && (form as any).storageId !== "none"
          ? (form as any).storageId.trim()
          : undefined,
      ramId:
        form.ramId && form.ramId !== "none" ? form.ramId.trim() : undefined,
      ramId2:
        form.ramId2 && form.ramId2 !== "none" ? form.ramId2.trim() : undefined,
    };

    let next: Asset[];
    if (editingItem) {
      // Update existing item
      next = items.map((item) => (item.id === editingItem.id ? record : item));
    } else {
      // Add new item
      next = [record, ...items];
    }

    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Refresh available assets after saving
    const sysRaw = localStorage.getItem(SYS_STORAGE_KEY);
    const sysList: SysAsset[] = sysRaw ? JSON.parse(sysRaw) : [];

    // Get all used IDs including the one we just saved
    const usedMouseIds = getUsedIds(next, "mouseId");
    const usedKeyboardIds = getUsedIds(next, "keyboardId");
    const usedMotherboardIds = getUsedIds(next, "motherboardId");
    const usedCameraIds = getUsedIds(next, "cameraId");
    const usedHeadphoneIds = getUsedIds(next, "headphoneId");
    const usedPowerSupplyIds = getUsedIds(next, "powerSupplyId");
    const usedStorageIds = getUsedIds(next as any, "storageId" as any);
    const usedRamIds = Array.from(
      new Set([
        ...getUsedIds(next, "ramId"),
        ...getUsedIds(next as any, "ramId2" as any),
      ]),
    );

    // Update available assets
    setMouseAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "mouse"),
        usedMouseIds,
      ),
    );
    setKeyboardAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "keyboard"),
        usedKeyboardIds,
      ),
    );
    setMotherboardAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "motherboard"),
        usedMotherboardIds,
      ),
    );
    setCameraAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "camera"),
        usedCameraIds,
      ),
    );
    setHeadphoneAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "headphone"),
        usedHeadphoneIds,
      ),
    );
    setPowerSupplyAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "power-supply"),
        usedPowerSupplyIds,
      ),
    );
    setStorageAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "storage"),
        usedStorageIds,
      ),
    );
    setRamAssets(
      getAvailableAssets(
        sysList.filter((s) => s.category === "ram"),
        usedRamIds,
      ),
    );

    setShowForm(false);
    setEditingItem(null);

    // Reset form to clear any residual state
    setForm({
      id: "",
      mouseId: "none",
      keyboardId: "none",
      motherboardId: "none",
      cameraId: "none",
      headphoneId: "none",
      powerSupplyId: "none",
      storageId: "none",
      ramId: "none",
      ramId2: "none",
    });

    alert(editingItem ? "Updated successfully!" : "Saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">PC/Laptop Info</h1>
            <p className="text-slate-400">Manage PCs and laptops</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={addNew}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Home
            </Button>
          </div>
        </header>

        {showForm && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                {editingItem
                  ? `Edit PC/Laptop - ${editingItem.id}`
                  : "Add PC/Laptop"}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Only available (unused) component IDs are shown. Already
                assigned IDs are automatically filtered out.
              </p>
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
                  <Label className="text-slate-300">Mouse (IDs)</Label>
                  <Select
                    value={form.mouseId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, mouseId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          mouseAssets.length
                            ? "Select available mouse"
                            : "No available mouse"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Mouse --</span>
                      </SelectItem>
                      {mouseAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available mouse items
                        </div>
                      ) : (
                        mouseAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Keyboard (IDs)</Label>
                  <Select
                    value={form.keyboardId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, keyboardId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          keyboardAssets.length
                            ? "Select available keyboard"
                            : "No available keyboard"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Keyboard --
                        </span>
                      </SelectItem>
                      {keyboardAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available keyboard items
                        </div>
                      ) : (
                        keyboardAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Motherboard (IDs)</Label>
                  <Select
                    value={form.motherboardId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, motherboardId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          motherboardAssets.length
                            ? "Select available motherboard"
                            : "No available motherboard"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Motherboard --
                        </span>
                      </SelectItem>
                      {motherboardAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available motherboard items
                        </div>
                      ) : (
                        motherboardAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Camera (IDs)</Label>
                  <Select
                    value={form.cameraId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, cameraId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          cameraAssets.length
                            ? "Select available camera"
                            : "No available camera"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Camera --</span>
                      </SelectItem>
                      {cameraAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available camera items
                        </div>
                      ) : (
                        cameraAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Headphone (IDs)</Label>
                  <Select
                    value={form.headphoneId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, headphoneId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          headphoneAssets.length
                            ? "Select available headphone"
                            : "No available headphone"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Headphone --
                        </span>
                      </SelectItem>
                      {headphoneAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available headphone items
                        </div>
                      ) : (
                        headphoneAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Power Supply (IDs)</Label>
                  <Select
                    value={form.powerSupplyId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, powerSupplyId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          powerSupplyAssets.length
                            ? "Select available power supply"
                            : "No available power supply"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Power Supply --
                        </span>
                      </SelectItem>
                      {powerSupplyAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available power supply items
                        </div>
                      ) : (
                        powerSupplyAssets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">RAM (IDs)</Label>
                  <Select
                    value={form.ramId}
                    onValueChange={(v) => setForm((s) => ({ ...s, ramId: v }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          ramAssets.length
                            ? "Select available RAM"
                            : "No available RAM"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No RAM --</span>
                      </SelectItem>
                      {ramAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available RAM items
                        </div>
                      ) : (
                        ramAssets.map((m) => {
                          // Get RAM details from systemAssets
                          const sysRaw = localStorage.getItem("systemAssets");
                          const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                          const ramDetails = sysList.find(
                            (item: any) => item.id === m.id,
                          );

                          return (
                            <SelectItem key={m.id} value={m.id}>
                              {m.id} ({ramDetails?.ramSize || "RAM"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Storage (SSD/HDD)</Label>
                  <Select
                    value={(form as any).storageId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, storageId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          storageAssets.length
                            ? "Select available storage"
                            : "No available storage"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Storage --</span>
                      </SelectItem>
                      {storageAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available storage items
                        </div>
                      ) : (
                        storageAssets.map((s) => {
                          // Get storage details from systemAssets
                          const sysRaw = localStorage.getItem("systemAssets");
                          const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                          const storageDetails = sysList.find(
                            (item: any) => item.id === s.id,
                          );

                          return (
                            <SelectItem key={s.id} value={s.id}>
                              {s.id} ({storageDetails?.storageType || "Storage"}{" "}
                              - {storageDetails?.storageCapacity || "Unknown"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">RAM (Slot 2)</Label>
                  <Select
                    value={form.ramId2}
                    onValueChange={(v) => setForm((s) => ({ ...s, ramId2: v }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          ramAssets.length
                            ? "Select available RAM"
                            : "No available RAM"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No RAM --</span>
                      </SelectItem>
                      {ramAssets.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available RAM items
                        </div>
                      ) : (
                        ramAssets.map((m) => {
                          // Get RAM details from systemAssets
                          const sysRaw = localStorage.getItem("systemAssets");
                          const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                          const ramDetails = sysList.find(
                            (item: any) => item.id === m.id,
                          );

                          return (
                            <SelectItem key={m.id} value={m.id}>
                              {m.id} ({ramDetails?.ramSize || "RAM"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Total RAM</Label>
                  <Input
                    value={totalRam}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white font-semibold"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {editingItem ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Saved Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-slate-300">No records</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Mouse ID</TableHead>
                      <TableHead>Keyboard ID</TableHead>
                      <TableHead>Motherboard ID</TableHead>
                      <TableHead>Camera ID</TableHead>
                      <TableHead>Headphone ID</TableHead>
                      <TableHead>Power Supply ID</TableHead>
                      <TableHead>Storage ID</TableHead>
                      <TableHead>RAM Slot 1</TableHead>
                      <TableHead>RAM Slot 2</TableHead>
                      <TableHead>Total RAM</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.id}</TableCell>
                        <TableCell>{a.mouseId || "-"}</TableCell>
                        <TableCell>{a.keyboardId || "-"}</TableCell>
                        <TableCell>{a.motherboardId || "-"}</TableCell>
                        <TableCell>{a.cameraId || "-"}</TableCell>
                        <TableCell>{a.headphoneId || "-"}</TableCell>
                        <TableCell>{a.powerSupplyId || "-"}</TableCell>
                        <TableCell>
                          {(() => {
                            const storageId = (a as any).storageId;
                            if (!storageId) return "-";

                            // Get storage details from systemAssets
                            const sysRaw = localStorage.getItem("systemAssets");
                            const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                            const storageDetails = sysList.find(
                              (item: any) => item.id === storageId,
                            );

                            return storageDetails
                              ? `${storageId} (${storageDetails.storageType || "Storage"} - ${storageDetails.storageCapacity || "Unknown"})`
                              : storageId;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const ramId = a.ramId;
                            if (!ramId) return "-";

                            // Get RAM details from systemAssets
                            const sysRaw = localStorage.getItem("systemAssets");
                            const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                            const ramDetails = sysList.find(
                              (item: any) => item.id === ramId,
                            );

                            return ramDetails
                              ? `${ramId} (${ramDetails.ramSize || "RAM"})`
                              : ramId;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const ramId2 = (a as any).ramId2;
                            if (!ramId2) return "-";

                            // Get RAM details from systemAssets
                            const sysRaw = localStorage.getItem("systemAssets");
                            const sysList = sysRaw ? JSON.parse(sysRaw) : [];
                            const ramDetails = sysList.find(
                              (item: any) => item.id === ramId2,
                            );

                            return ramDetails
                              ? `${ramId2} (${ramDetails.ramSize || "RAM"})`
                              : ramId2;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // Calculate total RAM from both slots
                            const sysRaw = localStorage.getItem("systemAssets");
                            const sysList = sysRaw ? JSON.parse(sysRaw) : [];

                            let total = 0;

                            // Get RAM 1 size
                            if (a.ramId) {
                              const ram1Details = sysList.find(
                                (item: any) => item.id === a.ramId,
                              );
                              if (ram1Details?.ramSize) {
                                const size1 =
                                  parseInt(
                                    ram1Details.ramSize.replace(/[^0-9]/g, ""),
                                  ) || 0;
                                total += size1;
                              }
                            }

                            // Get RAM 2 size
                            if ((a as any).ramId2) {
                              const ram2Details = sysList.find(
                                (item: any) => item.id === (a as any).ramId2,
                              );
                              if (ram2Details?.ramSize) {
                                const size2 =
                                  parseInt(
                                    ram2Details.ramSize.replace(/[^0-9]/g, ""),
                                  ) || 0;
                                total += size2;
                              }
                            }

                            return total > 0 ? `${total}GB` : "-";
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => openForm(a)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
