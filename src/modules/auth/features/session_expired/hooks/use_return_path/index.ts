import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import {
  readReturnPath,
  rememberReturnPath,
  RETURN_PATH_QUERY_PARAM,
} from "@/modules/auth/utils/redirect_to";

import { parseReturnPath } from "../../schemas";

export interface ReturnPathState {
  returnPath: string | null;
  hasReturnPath: boolean;
}

export const useReturnPath = (): ReturnPathState => {
  const [searchParams] = useSearchParams();
  const fromQuery = parseReturnPath(searchParams.get(RETURN_PATH_QUERY_PARAM));

  useEffect(() => {
    if (fromQuery === null) return;
    rememberReturnPath(fromQuery);
  }, [fromQuery]);

  const returnPath = fromQuery ?? readReturnPath();

  return { returnPath, hasReturnPath: returnPath !== null };
};
