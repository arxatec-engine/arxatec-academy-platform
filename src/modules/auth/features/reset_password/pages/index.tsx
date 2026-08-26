import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { NS } from "@/locales/namespaces";
import { AuthCard } from "@/modules/auth/components/auth_card";
import { AuthFooterLink } from "@/modules/auth/components/auth_footer_link";
import { ROUTE_QUERY_PARAM_NAMES, RouteHelpers } from "@/routes/routes";

import { ResetLinkInvalid } from "../components/reset_link_invalid";
import { ResetPasswordForm } from "../components/reset_password_form";
import { ResetPasswordSuccess } from "../components/reset_password_success";
import { useResetPassword } from "../hooks/use_reset_password";
import { useResetPasswordFeedback } from "../hooks/use_reset_password_feedback";
import type { ResetPasswordFormValues } from "../schemas";

const ResetPasswordPage = () => {
  const { t } = useTranslation(NS.auth);
  const [searchParams] = useSearchParams();
  const { submit, isPending, isSuccess, error } = useResetPassword();
  const { describe } = useResetPasswordFeedback();

  const token = searchParams.get(ROUTE_QUERY_PARAM_NAMES.token)?.trim() ?? "";
  const feedback = describe(error);

  if (token.length === 0) return <ResetLinkInvalid reason="missing_token" />;
  if (isSuccess) return <ResetPasswordSuccess />;
  if (feedback.kind === "expired") return <ResetLinkInvalid reason="expired" />;

  const handleSubmit = (values: ResetPasswordFormValues) => {
    submit(
      { token, password: values.password },
      {
        onError: (submitError) => {
          const result = describe(submitError);
          if (result.kind === "toast") toast.error(result.message);
        },
      },
    );
  };

  return (
    <AuthCard
      title={t("reset_password.title")}
      subtitle={t("reset_password.subtitle")}
      footer={<AuthFooterLink label={t("shared.back_to_login")} to={RouteHelpers.login()} />}
    >
      <ResetPasswordForm
        isPending={isPending}
        errorMessage={feedback.kind === "inline" ? feedback.message : null}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  );
};

export default ResetPasswordPage;
