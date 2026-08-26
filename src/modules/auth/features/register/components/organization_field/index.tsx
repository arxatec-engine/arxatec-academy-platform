import { Checkbox, Input, Label } from "arxatec-ui";
import { Controller, type UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthField } from "@/modules/auth/components/auth_field";

import type { RegisterFormControl } from "../../types";

export interface OrganizationFieldProps {
  id: string;
  checkboxId: string;
  control: RegisterFormControl;
  registration: UseFormRegisterReturn<"organization">;
  error?: string;
  disabled: boolean;
  isIndependent: boolean;
  onIndependentChange: (checked: boolean) => void;
}

export const OrganizationField = ({
  id,
  checkboxId,
  control,
  registration,
  error,
  disabled,
  isIndependent,
  onIndependentChange,
}: OrganizationFieldProps) => {
  const { t } = useTranslation(NS.auth);

  return (
    <div className="flex flex-col gap-2">
      <AuthField id={id} label={t("shared.fields.organization.label")} error={error}>
        {(field) => (
          <Input
            {...field}
            {...registration}
            size="sm"
            type="text"
            autoComplete="organization"
            placeholder={t("shared.fields.organization.placeholder")}
            disabled={disabled || isIndependent}
          />
        )}
      </AuthField>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isIndependent"
          render={({ field }) => (
            <Checkbox
              id={checkboxId}
              ref={field.ref}
              name={field.name}
              checked={field.value}
              onBlur={field.onBlur}
              onCheckedChange={(checked) => {
                const next = checked === true;
                field.onChange(next);
                onIndependentChange(next);
              }}
              disabled={disabled}
            />
          )}
        />
        <Label htmlFor={checkboxId} className="font-normal text-muted-foreground">
          {t("shared.fields.is_independent.label")}
        </Label>
      </div>
    </div>
  );
};
