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

export const AuthField = ({
  id,
  label,
  hint,
  error,
  action,
  children,
}: AuthFieldProps) => {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [
    hint === undefined ? null : hintId,
    error === undefined ? null : errorId,
  ]
    .filter((value): value is string => value !== null)
    .join(" ");

  return (
    <div>
      {action === undefined ? (
        <Label htmlFor={id} className="mb-2 flex items-center gap-2">
          {label}
        </Label>
      ) : (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <Label htmlFor={id}>{label}</Label>
          {action}
        </div>
      )}
      {children({
        id,
        "aria-invalid": error !== undefined,
        "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
      })}
      {hint === undefined ? null : (
        <p id={hintId} className="mt-2 text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error === undefined ? null : (
        <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
