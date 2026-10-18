import { useIsMutating } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  matchPath,
  useBeforeUnload,
  useBlocker,
  useNavigate,
} from "react-router-dom";
import { ROUTES, RouteHelpers } from "@/routes/routes";

export const useCourseDialog = () => {
  const navigate = useNavigate();
  const isSaving = useIsMutating() > 0;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      !matchPath(ROUTES.admin_course, nextLocation.pathname),
  );

  useBeforeUnload(
    useCallback((event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    }, []),
  );

  const requestClose = () => {
    if (!isSaving) void navigate(RouteHelpers.adminCourses());
  };

  return {
    isSaving,
    requestClose,
    confirmationOpen: blocker.state === "blocked",
    cancelClose: () => {
      if (blocker.state === "blocked") blocker.reset();
    },
    confirmClose: () => {
      if (blocker.state === "blocked" && !isSaving) blocker.proceed();
    },
  };
};
