import type { ReactNode } from "react";

export interface AuthFormErrorProps {
  message: string;
  action?: ReactNode;
}

export const AuthFormError = ({ message, action }: AuthFormErrorProps) => (
  <div
    role="alert"
    className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
  >
    <p className="text-sm text-destructive">{message}</p>
    {action}
  </div>
);
