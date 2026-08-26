import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/locales/namespaces";

import { AUTH_GENERIC_FIELD_MESSAGE_KEY, isAuthMessageKey } from "../../utils/messages";

export type AuthMessageReader = (message: string | undefined) => string | undefined;

export const useAuthMessage = (): AuthMessageReader => {
  const { t } = useTranslation(NS.auth);

  return useCallback(
    (message: string | undefined) => {
      if (message === undefined) return undefined;
      return t(isAuthMessageKey(message) ? message : AUTH_GENERIC_FIELD_MESSAGE_KEY);
    },
    [t],
  );
};
