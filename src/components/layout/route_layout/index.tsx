import { Outlet, ScrollRestoration } from "react-router-dom";

export const RouteLayout = () => (
  <>
    <Outlet />
    <ScrollRestoration />
  </>
);
