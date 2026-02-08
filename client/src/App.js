// client/src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ ייבוא
import AdminTenants from "./pages/AdminTenants";
import AdminFaults from "./pages/AdminFaults";
import AdminAnnouncements from "./pages/AdminAnnouncements";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
