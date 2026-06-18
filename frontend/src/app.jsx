import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./login";
import ProtectedRoute from "./context/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./views/Dashboard";
import AdminDashboard from "./views/AdminDashboard";
import TechnicianDashboard from "./views/TechnicianDashboard";
import EmployeeDashboard from "./views/EmployeeDashboard";

import Tickets from "./views/Tickets";
import KnowledgeBase from "./views/KnowledgeBase";
import Assets from "./views/Assets";
import CMDB from "./views/CMDB";
import ChangeManagement from "./views/ChangeManagement";
import ProblemManagement from "./views/ProblemManagement";
import Analytics from "./views/Analytics";
import EndpointMonitoring from "./views/EndpointMonitoring";
import Settings from "./views/Settings";

function ServiceCatalog() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Service Catalog</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          Service Catalog module coming soon.
        </p>
      </div>
    </div>
  );
}

function SLAMonitor() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">SLA Monitor</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          SLA monitoring module coming soon.
        </p>
      </div>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-2xl bg-white p-10 text-center text-slate-900 shadow-2xl">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="mt-3 text-slate-500">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["Admin", "Technician", "Employee"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

        <Route path="/tickets" element={<Tickets />} />
        <Route path="/service-catalog" element={<ServiceCatalog />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/sla-monitor" element={<SLAMonitor />} />

        <Route path="/assets" element={<Assets />} />
        <Route path="/cmdb" element={<CMDB />} />
        <Route path="/change-management" element={<ChangeManagement />} />
        <Route path="/problem-management" element={<ProblemManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/endpoint-monitoring" element={<EndpointMonitoring />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}