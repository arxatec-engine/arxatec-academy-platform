import type { ReactNode } from "react";
import { cn } from "@/utilities/cn";

interface Props {
  children: ReactNode;
  title?: string;
  titleClassName?: string;
  description?: string;
  action?: ReactNode;
}

export const AdminPage = ({
  children,
  title,
  titleClassName,
  description,
  action,
}: Props) => {
  return (
    <>
      {title && (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 max-w-2xl space-y-1">
            <h1
              className={cn(
                "text-2xl font-normal [overflow-wrap:anywhere]",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="text-sm sr-only text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </>
  );
};
