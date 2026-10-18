import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { toAuthMessageKey } from "@/modules/auth/utils/messages";
import { consumeReturnPath } from "@/modules/auth/utils/redirect_to";
import { RouteHelpers } from "@/routes/routes";

import { useLogin } from "../use_login";
import {
  LOGIN_DEFAULT_VALUES,
  loginSchema,
  type LoginFormValues,
} from "../../schemas";

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

export const useLoginForm = () => {
  const { t } = useTranslation(NS.auth);
  const navigate = useNavigate();
  const mutation = useLogin();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: LOGIN_DEFAULT_VALUES,
  });

  const applyFieldErrors = (fields: Record<string, string> | null): boolean => {
    if (fields === null) return false;

    let applied = false;
    for (const [field, key] of Object.entries(fields)) {
      const name = toFormFieldName(field);
      if (name === null) continue;
      setError(
        name,
        { type: "server", message: toAuthMessageKey(key) },
        { shouldFocus: !applied },
      );
      applied = true;
    }
    return applied;
  };

  const notifyError = (error: unknown): void => {
    if (isApiError(error)) {
      if (
        error.code === API_ERROR_CODES.INVALID_CREDENTIALS ||
        error.code === API_ERROR_CODES.ACCOUNT_USES_GOOGLE
      ) {
        return;
      }
      if (
        error.code === API_ERROR_CODES.VALIDATION_ERROR &&
        applyFieldErrors(error.fields)
      ) {
        return;
      }
    }
    toast.error(authErrorMessage(error, t));
  };

  return {
    errors,
    register,
    isPending: mutation.isPending,
    formErrorKind: describeFormError(mutation.error),
    submit: handleSubmit((values) => {
      mutation.mutate(values, {
        onSuccess: () => {
          void navigate(consumeReturnPath() ?? RouteHelpers.home(), {
            replace: true,
          });
        },
        onError: notifyError,
      });
    }),
  };
};
