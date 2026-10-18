import { Button, Input } from "arxatec-ui";
import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { cn } from "@/utilities/cn";
import { PASSWORD_TEXT } from "./i18n";

type Props = Omit<ComponentProps<typeof Input>, "type">;

export const PasswordInput = ({
  className,
  disabled,
  size = "sm",
  placeholder,
  ...props
}: Props) => {
  const { t } = useTranslation(NS.auth);
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? t(PASSWORD_TEXT.hide) : t(PASSWORD_TEXT.show);

  return (
    <div className="relative">
      <Input
        {...props}
        size={size}
        placeholder={placeholder ?? t(PASSWORD_TEXT.placeholder)}
        type={isVisible ? "text" : "Password"}
        disabled={disabled}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        disabled={disabled}
        size="icon"
        variant="ghost"
        aria-label={toggleLabel}
        aria-pressed={isVisible}
        title={toggleLabel}
        className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setIsVisible((visible) => !visible);
        }}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  );
};
