import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "arxatec-ui";
import { Controller, type UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { AuthField } from "@/modules/auth/components/auth_field";
import { API_USER_CITIES, type ApiUserCity } from "@/types/auth";

import type { RegisterFormControl } from "../../types";

const CITY_LABEL_KEYS = {
  LIMA: "shared.fields.city.options.lima",
  AREQUIPA: "shared.fields.city.options.arequipa",
  TRUJILLO: "shared.fields.city.options.trujillo",
  OTHER: "shared.fields.city.options.other",
} as const satisfies Record<ApiUserCity, string>;

export interface CityFieldProps {
  id: string;
  otherId: string;
  control: RegisterFormControl;
  otherRegistration: UseFormRegisterReturn<"cityOther">;
  error?: string;
  otherError?: string;
  disabled: boolean;
  showOther: boolean;
  onCityChange: (value: string) => void;
}

export const CityField = ({
  id,
  otherId,
  control,
  otherRegistration,
  error,
  otherError,
  disabled,
  showOther,
  onCityChange,
}: CityFieldProps) => {
  const { t } = useTranslation(NS.auth);

  return (
    <div className="flex flex-col gap-4">
      <AuthField id={id} label={t("shared.fields.city.label")} error={error}>
        {(field) => (
          <Controller
            control={control}
            name="city"
            render={({ field: city }) => (
              <Select
                value={city.value}
                disabled={disabled}
                onValueChange={(value) => {
                  city.onChange(value);
                  onCityChange(value);
                }}
              >
                <SelectTrigger
                  {...field}
                  size="sm"
                  ref={city.ref}
                  name={city.name}
                  onBlur={city.onBlur}
                  className="w-full"
                >
                  <SelectValue placeholder={t("shared.fields.city.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {API_USER_CITIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(CITY_LABEL_KEYS[option])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </AuthField>
      {showOther ? (
        <AuthField id={otherId} label={t("shared.fields.city_other.label")} error={otherError}>
          {(field) => (
            <Input
              {...field}
              {...otherRegistration}
              size="sm"
              type="text"
              autoComplete="address-level2"
              placeholder={t("shared.fields.city_other.placeholder")}
              disabled={disabled}
            />
          )}
        </AuthField>
      ) : null}
    </div>
  );
};
