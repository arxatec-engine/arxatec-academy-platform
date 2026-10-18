import { Navigate, Outlet } from "react-router-dom";
import { RouteHelpers } from "@/routes/routes";
import { useUserStore } from "@/store/user";

export const Admin = () => {
  const user = useUserStore((state) => state.user);
  return user?.role === "ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to={RouteHelpers.home()} replace />
  );
};
