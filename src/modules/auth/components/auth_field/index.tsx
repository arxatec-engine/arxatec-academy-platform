import { Label } from "arxatec-ui";
import type { ReactNode } from "react";

export interface AuthFieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

export interface AuthFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
  children: (control: AuthFieldControlProps) => ReactNode;
}

export const AuthField = ({ id, label, hint, error, action, children }: AuthFieldProps) => {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
    .filter((value): value is string => value !== null)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children({
        id,
        "aria-invalid": error !== undefined,
        "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
      })}
      {hint === undefined ? null : (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error === undefined ? null : (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
