import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { API_ERROR_CODES } from "@/constants/api_error_codes";
import { isApiError } from "@/interceptors/api_error";
import { NS } from "@/locales/namespaces";
import { authErrorMessage } from "@/modules/auth/utils/auth_error_message";
import { toAuthMessageKey } from "@/modules/auth/utils/messages";

import { useForgotPassword } from "../use_forgot_password";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../schemas";

export interface UseForgotPasswordFormOptions {
  defaultEmail: string;
  onSent: (email: string) => void;
}

export const useForgotPasswordForm = ({
  defaultEmail,
  onSent,
}: UseForgotPasswordFormOptions) => {
  const { t } = useTranslation(NS.auth);
  const mutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  const reportFailure = (error: Error): void => {
    if (isApiError(error) && error.code === API_ERROR_CODES.VALIDATION_ERROR) {
      const serverKey = error.fields?.email;
      if (serverKey === undefined) toast.error(authErrorMessage(error, t));
      else
        setError(
          "email",
          { message: toAuthMessageKey(serverKey) },
          { shouldFocus: true },
        );
      return;
    }

    toast.error(authErrorMessage(error, t));
  };

  return {
    register,
    errors,
    isPending: mutation.isPending,
    submit: handleSubmit(({ email }) => {
      mutation.mutate(email, {
        onSuccess: () => onSent(email),
        onError: reportFailure,
      });
    }),
  };
};
