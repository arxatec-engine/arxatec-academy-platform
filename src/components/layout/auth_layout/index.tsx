import { Logo } from "arxatec-ui";
import { Outlet } from "react-router-dom";
import { useAuthReturnPath } from "@/modules/auth/hooks/use_auth_return_path";

export const AuthLayout = () => {
  useAuthReturnPath();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <Logo variant="academy" className="text-foreground h-auto w-52" />
        <div className="mt-4 flex flex-col gap-4 bg-card border-border border rounded-md p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
