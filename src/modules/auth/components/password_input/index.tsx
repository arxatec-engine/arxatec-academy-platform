import { inputVariants } from "arxatec-ui";
import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";
import { cn } from "@/utilities/cn";

export type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

export const PasswordInput = ({ className, disabled, ...props }: PasswordInputProps) => {
  const { t } = useTranslation(NS.auth);
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? t("shared.password_hide") : t("shared.password_show");

  return (
    <div className="relative">
      <input
        {...props}
        disabled={disabled}
        data-slot="input"
        type={isVisible ? "text" : "password"}
        className={cn(inputVariants({ size: "sm" }), "pr-11", className)}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        title={toggleLabel}
        className="absolute inset-y-0 right-0 flex items-center rounded-md px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
        onClick={() => {
          setIsVisible((visible) => !visible);
        }}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
};
