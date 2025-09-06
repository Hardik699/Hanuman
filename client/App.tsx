import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import NotFound from "./pages/NotFound";
import Salary from "./pages/Salary";
import Dashboard from "./pages/Dashboard";
import ITDashboard from "./pages/ITDashboard";
import SystemInfo from "./pages/SystemInfo";
import SystemInfoDetail from "./pages/SystemInfoDetail";
import PCLaptopInfo from "./pages/PCLaptopInfo";
import DemoDataView from "./pages/DemoDataView";
import MasterAdmin from "./pages/MasterAdmin";
import DeployPage from "./pages/Deploy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deshbord" element={<Dashboard />} />
          <Route path="/it-dashboard" element={<ITDashboard />} />
          <Route path="/it-deshbord" element={<ITDashboard />} />
          <Route path="/system-info" element={<SystemInfo />} />
          <Route path="/system-info/:slug" element={<SystemInfoDetail />} />
          <Route path="/pc-laptop-info" element={<PCLaptopInfo />} />
          <Route path="/demo-data" element={<DemoDataView />} />
          <Route path="/master-admin" element={<MasterAdmin />} />
          <Route path="/deploy" element={<DeployPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
