import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { AuthField } from "../auth_field";
import { PasswordInput } from "../password_input";

export type PasswordAutoComplete = "current-password" | "new-password";

export interface PasswordFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  autoComplete: PasswordAutoComplete;
  registration: UseFormRegisterReturn;
}

export const PasswordField = ({
  id,
  label,
  hint,
  error,
  action,
  autoFocus = false,
  disabled = false,
  autoComplete,
  registration,
}: PasswordFieldProps) => (
  <AuthField id={id} label={label} hint={hint} error={error} action={action}>
    {(control) => (
      <PasswordInput
        {...registration}
        {...control}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
      />
    )}
  </AuthField>
);
