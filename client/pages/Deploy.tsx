import { useEffect, useState } from "react";
import AppNav from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CloudUpload, ServerCog, Database } from "lucide-react";

export default function DeployPage() {
  const [dbStatus, setDbStatus] = useState<"unknown" | "online" | "offline">(
    "unknown",
  );
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const checkDb = () => {
    setChecking(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const url = `${window.location.origin}/api/db/health`;
    fetch(url, { signal: controller.signal })
      .then((r) => {
        clearTimeout(timeout);
        if (!r.ok) {
          setDbStatus("offline");
          return;
        }
        return r
          .json()
          .catch(() => null)
          .then((j) => setDbStatus(j?.connected ? "online" : "offline"));
      })
      .catch(() => {
        clearTimeout(timeout);
        setDbStatus("offline");
      })
      .finally(() => setChecking(false));
  };

  useEffect(() => {
    checkDb();
    const id = setInterval(checkDb, 10000);
    return () => clearInterval(id);
  }, []);

  const backfill = async () => {
    try {
      const r = await fetch(`/api/hr/admin/backfill-asset-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-role": "admin" },
      });
      const j = await r.json();
      alert(
        j?.ok
          ? `Backfill complete (mirrored: ${j.mirrored || 0})`
          : `Backfill failed`,
      );
    } catch (e) {
      alert("Backfill failed");
    }
  };

  // Simple env KV editor (for guidance + local testing)
  type EnvRow = { key: string; value: string };
  const [envs, setEnvs] = useState<EnvRow[]>([
    { key: "DATABASE_URL", value: "" },
    { key: "NETLIFY_DATABASE_URL", value: "" },
    { key: "NETLIFY_DATABASE_URL_UNPOOLED", value: "" },
  ]);
  const updateEnv = (i: number, patch: Partial<EnvRow>) => {
    setEnvs((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  };
  const addEnv = () => setEnvs((p) => [...p, { key: "", value: "" }]);
  const removeEnv = (i: number) =>
    setEnvs((p) => p.filter((_, idx) => idx !== i));

  const testEnteredDbUrl = async () => {
    const row = envs.find((r) => r.value && /postgres/i.test(r.value));
    if (!row) return alert("Enter a Postgres connection string in Value.");
    try {
      const r = await fetch("/api/config/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: row.value }),
      });
      const j = await r.json();
      if (r.ok && j?.connected) alert("DB URL is valid and reachable.");
      else alert(`DB test failed: ${j?.error || "Unknown error"}`);
    } catch (e: any) {
      alert(`DB test failed: ${e?.message || e}`);
    }
  };

  const syncAll = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-role": "admin",
      } as const;
      const sysRaw = localStorage.getItem("systemAssets");
      const sys = sysRaw ? JSON.parse(sysRaw) : [];
      if (Array.isArray(sys) && sys.length) {
        await fetch("/api/hr/assets/upsert-batch", {
          method: "POST",
          headers,
          body: JSON.stringify({ items: sys }),
        });
      }
      const itRaw = localStorage.getItem("itAccounts");
      const it = itRaw ? JSON.parse(itRaw) : [];
      if (Array.isArray(it)) {
        for (const rec of it) {
          await fetch("/api/hr/it-accounts", {
            method: "POST",
            headers,
            body: JSON.stringify(rec),
          });
        }
      }
      const empRaw = localStorage.getItem("hrEmployees");
      const emps = empRaw ? JSON.parse(empRaw) : [];
      if (Array.isArray(emps)) {
        for (const e of emps) {
          await fetch("/api/hr/employees", {
            method: "POST",
            headers,
            body: JSON.stringify(e),
          });
        }
      }
      const pcRaw = localStorage.getItem("pcLaptopAssets");
      const pcs = pcRaw ? JSON.parse(pcRaw) : [];
      if (Array.isArray(pcs) && pcs.length) {
        await fetch("/api/hr/pc-laptops/upsert-batch", {
          method: "POST",
          headers,
          body: JSON.stringify({ items: pcs }),
        });
      }
      setLastSync(new Date().toLocaleTimeString());
      alert("Synced to database");
    } catch (e) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const deployNetlify = () => {
    alert(
      "Deployment: Click 'Open MCP popover' in the top bar, then 'Connect Netlify'. After connecting, use the Netlify MCP to deploy. In Netlify, set DATABASE_URL and NETLIFY_DATABASE_URL.",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CloudUpload className="h-7 w-7" />
          Deploy & Database
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${dbStatus === "online" ? "bg-green-500" : dbStatus === "offline" ? "bg-red-500" : "bg-yellow-500"}`}
                ></span>
                <span>
                  Status:{" "}
                  {dbStatus === "online"
                    ? "Connected"
                    : dbStatus === "offline"
                      ? "Offline"
                      : "Checking"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkDb}
                  disabled={checking}
                  className="ml-auto border-slate-600 text-slate-300"
                >
                  <ServerCog className="h-4 w-4 mr-2" />
                  {checking ? "Checking" : "Check"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncAll}
                  disabled={syncing}
                  className="border-slate-600 text-slate-300"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing ? "Syncing" : "Sync Now"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={backfill}
                  className="border-slate-600 text-slate-300"
                >
                  <ServerCog className="h-4 w-4 mr-2" />
                  Backfill Categories
                </Button>
              </div>

              {/* Env KV inputs for provider setup */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-400">
                  Add the following Key/Value in your hosting provider (Netlify
                  → Site settings → Environment variables):
                </p>
                {envs.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="w-1/2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                      placeholder="KEY (e.g. DATABASE_URL)"
                      value={row.key}
                      onChange={(e) => updateEnv(i, { key: e.target.value })}
                    />
                    <input
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
                      placeholder="VALUE (paste Postgres URL)"
                      value={row.value}
                      onChange={(e) => updateEnv(i, { value: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600"
                      onClick={() => removeEnv(i)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                    onClick={addEnv}
                  >
                    Add Variable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600"
                    onClick={testEnteredDbUrl}
                  >
                    <ServerCog className="h-4 w-4 mr-2" /> Test DB URL
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Required: set at least one of DATABASE_URL or
                  NETLIFY_DATABASE_URL (or NETLIFY_DATABASE_URL_UNPOOLED). After
                  saving, redeploy without cache, then click Check.
                </p>
              </div>

              {lastSync ? (
                <p className="text-xs text-slate-400">Last sync: {lastSync}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CloudUpload className="h-5 w-5" />
                Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>
                Deploy with Netlify directly from this platform using MCP
                integration.
              </p>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>Click "Open MCP popover" (top bar) and connect Netlify.</li>
                <li>After connecting, use Netlify MCP to deploy this repo.</li>
                <li>
                  Set env: DATABASE_URL and NETLIFY_DATABASE_URL. Optional:
                  AUTO_SEED_DEMO=0, AUTO_WIPE_IT_HR=0.
                </li>
                <li>Verify: /api/health and /api/db/health show OK.</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                onClick={deployNetlify}
                className="border-slate-600 text-slate-300"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                Deploy via Netlify MCP
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
