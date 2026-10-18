import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  readReturnPathFromSearch,
  rememberReturnPath,
} from "@/modules/auth/utils/redirect_to";

export const useAuthReturnPath = (): void => {
  const { search } = useLocation();
  const returnPath = readReturnPathFromSearch(search);

  useEffect(() => {
    if (returnPath !== null) rememberReturnPath(returnPath);
  }, [returnPath]);
};
