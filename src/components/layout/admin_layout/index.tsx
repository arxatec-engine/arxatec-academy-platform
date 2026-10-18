import { Outlet } from "react-router-dom";
import { PageShell } from "@/components/layout/page_shell";
import { AdminNavigation } from "@/components/shared/admin_navigation";

export const AdminLayout = () => (
  <PageShell adminMode navigation={<AdminNavigation />}>
    <Outlet />
  </PageShell>
);
