import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loader from "../components/ui/Loader";

const ROLE_HOME = {
  ADMIN:   "/admin",
  DOCTOR:  "/doctor",
  MIDWIFE: "/midwife",
  MOTHER:  "/dashboard",
};

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Wait for the /me call to resolve before deciding whether to redirect.
  // Without this, a user with valid sessionStorage cache would briefly see
  // the login page before isAuthenticated becomes true.
  if (loading) return <Loader />;

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[userRole] ?? "/"} replace />;
  }

  return children;
}
