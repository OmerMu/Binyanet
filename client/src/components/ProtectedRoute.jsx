import { Navigate } from "react-router-dom";

function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "company") return "/company";
  if (role === "committee") return "/committee";
  return "/tenant";
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) return <Navigate to="/" replace />;

  let user = null;
  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={roleHome(user.role)} replace />;
    }
  }

  return children;
}
