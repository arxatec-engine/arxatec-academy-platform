import { Button } from "arxatec-ui";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { NS } from "@/locales/namespaces";
import { checkEmail } from "@/modules/auth/features/verify_email/i18n";
import { shared } from "@/modules/auth/i18n";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { cn } from "@/utilities/cn";

import { useResendVerificationEmail } from "../../hooks/use_resend_verification_email";

export interface ResendVerificationButtonProps {
  initialCooldownSeconds?: number;
}

export const ResendVerificationButton = ({
  initialCooldownSeconds,
}: ResendVerificationButtonProps) => {
  const { t } = useTranslation(NS.auth);

  const { resend, isPending, isBlocked, seconds } = useResendVerificationEmail({
    initialCooldownSeconds,
    onSent: () => {
      toast.success(t(checkEmail.resendSent));
    },
    onFailed: (error) => {
      toast.error(authErrorMessage(error, t));
    },
  });

  const label = (): string => {
    if (isPending) return t(shared.sending);
    if (seconds > 0) return t(checkEmail.resendCountdown, { seconds });
    return t(checkEmail.resendAction);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("w-full", isBlocked && "opacity-70")}
      aria-disabled={isBlocked}
      aria-busy={isPending}
      onClick={resend}
    >
      {isPending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {label()}
    </Button>
  );
};
