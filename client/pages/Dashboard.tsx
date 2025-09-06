import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Shield, ArrowRight, ServerCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Overview and quick actions</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-orange-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors duration-300">
                  <ServerCog className="h-6 w-6 text-orange-400" />
                </div>
                <Button
                  onClick={() => navigate("/it-dashboard")}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">IT</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                  IT accounts and credentials management
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-green-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                  <Building2 className="h-6 w-6 text-green-400" />
                </div>
                <Button
                  onClick={() => navigate("/system-info")}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  System Info
                </h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                  IT systems overview and records
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors duration-300">
                  <Users className="h-6 w-6 text-cyan-400" />
                </div>
                <Button
                  onClick={() => navigate("/pc-laptop-info")}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Go <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  PC/Laptop Info
                </h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">
                  Track PC and laptop assets
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
