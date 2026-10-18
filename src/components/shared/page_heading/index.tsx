import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export const PageHeading = ({ title, description, eyebrow, action }: Props) => (
  <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
    {action}
  </div>
);
