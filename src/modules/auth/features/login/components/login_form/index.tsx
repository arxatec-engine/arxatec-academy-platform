import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, Input, Label } from "arxatec-ui";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { AuthField } from "@/modules/auth/components/auth_field";
import { AuthFormError } from "@/modules/auth/components/auth_form_error";
import { AuthSubmitButton } from "@/modules/auth/components/auth_submit_button";
import { GoogleButton } from "@/modules/auth/components/google_button";
import { PasswordField } from "@/modules/auth/components/password_field";
import { useAuthMessage } from "@/modules/auth/hooks/use_auth_message";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { toAuthMessageKey } from "@/modules/auth/utils/messages";
import { consumeReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";

import { useLogin } from "../../hooks/use_login";
import { LOGIN_DEFAULT_VALUES, loginSchema, type LoginFormValues } from "../../schemas";

const EMAIL_FIELD_ID = "login-email";
const PASSWORD_FIELD_ID = "login-password";
const REMEMBER_ME_FIELD_ID = "login-remember-me";

type LoginFormErrorKind = "credentials" | "google" | null;

type LoginFormFieldName = "email" | "password";

const describeFormError = (error: unknown): LoginFormErrorKind => {
  if (!isApiError(error)) return null;
  if (error.code === API_ERROR_CODES.INVALID_CREDENTIALS) return "credentials";
  if (error.code === API_ERROR_CODES.ACCOUNT_USES_GOOGLE) return "google";
  return null;
};

const toFormFieldName = (field: string): LoginFormFieldName | null => {
  if (field === "email") return "email";
  if (field === "password") return "password";
  return null;
};

export interface LoginFormProps {
  onGoogleLogin: () => void;
}

export const LoginForm = ({ onGoogleLogin }: LoginFormProps) => {
  const { t } = useTranslation(NS.auth);
  const readMessage = useAuthMessage();
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLogin();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_DEFAULT_VALUES,
  });

  const emailRegistration = register("email");
  const passwordRegistration = register("password");

  const formErrorKind = describeFormError(error);

  const applyFieldErrors = (fields: Record<string, string> | null): boolean => {
    if (fields === null) return false;

    let applied = false;
    for (const [field, key] of Object.entries(fields)) {
      const name = toFormFieldName(field);
      if (name === null) continue;
      setError(name, { type: "server", message: toAuthMessageKey(key) }, { shouldFocus: !applied });
      applied = true;
    }
    return applied;
  };

  const notifyError = (mutationError: unknown): void => {
    if (isApiError(mutationError)) {
      if (
        mutationError.code === API_ERROR_CODES.INVALID_CREDENTIALS ||
        mutationError.code === API_ERROR_CODES.ACCOUNT_USES_GOOGLE
      ) {
        return;
      }

      if (
        mutationError.code === API_ERROR_CODES.VALIDATION_ERROR &&
        applyFieldErrors(mutationError.fields)
      ) {
        return;
      }
    }

    toast.error(authErrorMessage(mutationError, t));
  };

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: () => {
        void navigate(consumeReturnPath() ?? RouteHelpers.home(), { replace: true });
      },
      onError: notifyError,
    });
  });

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
      <AuthField
        id={EMAIL_FIELD_ID}
        label={t("shared.fields.email.label")}
        error={readMessage(errors.email?.message)}
      >
        {(field) => (
          <Input
            {...field}
            {...emailRegistration}
            size="sm"
            type="email"
            autoComplete="email"
            placeholder={t("shared.fields.email.placeholder")}
          />
        )}
      </AuthField>

      <PasswordField
        id={PASSWORD_FIELD_ID}
        label={t("shared.fields.password.label")}
        autoComplete="current-password"
        registration={passwordRegistration}
        error={readMessage(errors.password?.message)}
        action={
          <Link
            to={RouteHelpers.forgotPassword()}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t("login.forgot_link")}
          </Link>
        }
      />

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <Checkbox
              id={REMEMBER_ME_FIELD_ID}
              name={field.name}
              checked={field.value}
              onBlur={field.onBlur}
              onCheckedChange={(checked) => {
                field.onChange(checked === true);
              }}
            />
          )}
        />
        <Label htmlFor={REMEMBER_ME_FIELD_ID} className="text-sm font-normal text-muted-foreground">
          {t("shared.fields.remember_me.label")}
        </Label>
      </div>

      {formErrorKind === "credentials" ? (
        <AuthFormError message={t("errors.invalid_credentials")} />
      ) : null}

      {formErrorKind === "google" ? (
        <AuthFormError
          message={t("login.google_account.message")}
          action={<GoogleButton label={t("login.google_account.action")} onClick={onGoogleLogin} />}
        />
      ) : null}

      <AuthSubmitButton
        label={t("login.submit")}
        loadingLabel={t("login.submitting")}
        loading={isPending}
      />
    </form>
  );
};
