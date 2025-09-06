import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings,
  LogOut,
  User,
  Menu,
  LogIn,
  Users,
  Building2,
  LayoutDashboard,
  Database,
  RefreshCw,
  CloudUpload,
  ServerCog,
} from "lucide-react";

export default function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"unknown" | "online" | "offline">(
    "unknown",
  );

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
    } catch (e) {
      // swallow
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const id = setInterval(syncAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // DB health check
  useEffect(() => {
    let cancelled = false;
    const check = () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const url = `${window.location.origin}/api/db/health`;
      fetch(url, { signal: controller.signal })
        .then((r) => {
          clearTimeout(timeout);
          if (!r.ok) {
            return r
              .text()
              .catch(() => "")
              .then((text) => {
                if (!cancelled) setDbStatus("offline");
                console.debug("DB health check non-ok", r.status, text);
              });
          }
          return r
            .json()
            .catch(() => null)
            .then((j) => {
              if (!cancelled) setDbStatus(j?.connected ? "online" : "offline");
            });
        })
        .catch((err) => {
          clearTimeout(timeout);
          if (!cancelled) setDbStatus("offline");
          console.debug("DB health check failed (caught)", err?.message || err);
        });
    };
    try {
      check();
    } catch (err) {
      console.debug("DB health check sync error", err);
    }
    const id = setInterval(check, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");
    const user = localStorage.getItem("currentUser");

    setIsAuthenticated(!!auth);
    setUserRole(role || "");
    setCurrentUser(user || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setUserRole("");
    setCurrentUser("");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleViewUsers = () => {
    // Navigate to admin dashboard and scroll to users section
    if (location.pathname === "/admin") {
      const usersSection = document.getElementById("users-section");
      if (usersSection) {
        usersSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/admin");
    }
  };

  const handleHRDashboard = () => {
    navigate("/hr");
  };

  const handleMainDashboard = () => {
    navigate("/deshbord");
  };

  const handleMasterAdmin = () => {
    navigate("/master-admin");
  };

  const deployNetlify = async () => {
    try {
      alert(
        "To deploy: use the platform’s Netlify MCP. Click ‘Connect Netlify MCP’ in the top bar and deploy.",
      );
    } catch {}
  };

  const dbBackfill = async () => {
    try {
      const r = await fetch("/api/hr/admin/backfill-asset-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-role": "admin" },
      });
      const j = await r.json();
      alert(
        j?.ok
          ? `Backfill done (mirrored: ${j.mirrored || 0})`
          : `Backfill failed`,
      );
    } catch (e) {
      alert("Backfill failed");
    }
  };

  const dbHealth = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const url = `${window.location.origin}/api/db/health`;
    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        clearTimeout(timeout);
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          alert(`Database check failed: HTTP ${r.status} ${txt}`);
          return;
        }
        const j = await r.json().catch(() => null);
        if (j?.connected) alert("Database connected");
        else alert(`Database offline: ${j?.reason || j?.error || "Unknown"}`);
      })
      .catch((e) => {
        clearTimeout(timeout);
        alert(`Database check failed: ${e?.message || "Network error"}`);
      });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-blue-400 hover:scale-110">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-white">
                {isAuthenticated
                  ? userRole === "admin"
                    ? "Admin Dashboard"
                    : `Welcome, ${currentUser}`
                  : "User Management System"}
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Admin Options */}
                {userRole === "admin" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewUsers}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMainDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      IT Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHRDashboard}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      HR Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMasterAdmin}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Master Admin
                    </Button>
                    <div
                      className="hidden md:flex items-center px-2 py-1 rounded-md border border-slate-600 text-xs text-slate-300"
                      title={
                        dbStatus === "online"
                          ? "Database connected"
                          : dbStatus === "offline"
                            ? "Database offline"
                            : "Checking database"
                      }
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full mr-2 ${dbStatus === "online" ? "bg-green-500" : dbStatus === "offline" ? "bg-red-500" : "bg-yellow-500"}`}
                      />
                      {dbStatus === "online"
                        ? "DB Connected"
                        : dbStatus === "offline"
                          ? "DB Offline"
                          : "DB Checking"}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncAll}
                      disabled={syncing}
                      title={lastSync ? `Last sync: ${lastSync}` : "Sync to DB"}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                      />
                      {syncing ? "Syncing" : "Sync"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/deploy")}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                      title="Deploy & Database"
                    >
                      <CloudUpload className="h-4 w-4 mr-2" />
                      Deploy
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                          title="Admin tools"
                        >
                          <ServerCog className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-slate-800 border-slate-700 text-white"
                        align="end"
                      >
                        <DropdownMenuItem
                          className="focus:bg-slate-700 cursor-pointer"
                          onClick={dbHealth}
                        >
                          <ServerCog className="h-4 w-4 mr-2" />
                          DB Health Check
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="focus:bg-slate-700 cursor-pointer"
                          onClick={dbBackfill}
                        >
                          <ServerCog className="h-4 w-4 mr-2" />
                          DB Backfill Categories
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {currentUser}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-slate-800 border-slate-700 text-white"
                    align="end"
                  >
                    <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="focus:bg-red-600 cursor-pointer text-red-400 focus:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Login Button for non-authenticated users */
              <Button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 border-slate-700 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white">
                    {isAuthenticated ? `${currentUser}` : "Menu"}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                  {isAuthenticated ? (
                    <>
                      {/* Admin Mobile Options */}
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleViewUsers();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            View Users
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleMainDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            IT Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleHRDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            HR Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                            onClick={() => {
                              handleMasterAdmin();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Master Admin
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
