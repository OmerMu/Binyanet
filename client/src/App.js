// client/src/App.js

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import AdminTenants from "./pages/AdminTenants";
import AdminFaults from "./pages/AdminFaults";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import TenantDashboard from "./pages/TenantDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

function RoleRedirect() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return <Navigate to="/" replace />;

  let user;
  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "company") return <Navigate to="/company" replace />;
  if (user.role === "committee") return <Navigate to="/committee" replace />;
  return <Navigate to="/tenant" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Redirect old route to correct dashboard */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RoleRedirect />} />
            {/* TENANT */}
            <Route
              path="/tenant"
              element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />

            {/* COMMITTEE */}
            <Route
              path="/committee"
              element={
                <ProtectedRoute allowedRoles={["committee"]}>
                  <CommitteeDashboard />
                </ProtectedRoute>
              }
            />

            {/* COMPANY */}
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={["company"]}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminTenants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faults"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminFaults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
