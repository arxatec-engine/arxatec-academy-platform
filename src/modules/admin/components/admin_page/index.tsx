import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export const AdminPage = ({ children, title, description, action }: Props) => {
  return (
    <>
      {title && (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 max-w-2xl space-y-1">
            <h1 className="text-2xl font-normal [overflow-wrap:anywhere]">
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
