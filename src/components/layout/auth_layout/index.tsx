import { Outlet } from "react-router-dom";

import { LanguageSelector } from "@/components/shared/language_selector";
import { ThemeSelector } from "@/components/shared/theme_selector";

export const AuthLayout = () => (
  <div className="flex min-h-svh w-full flex-col bg-background text-foreground">
    <header className="flex items-center justify-end gap-2 px-4 py-4">
      <LanguageSelector />
      <ThemeSelector />
    </header>
    <main className="flex flex-1 items-center justify-center px-4 pb-16">
      <Outlet />
    </main>
  </div>
);
