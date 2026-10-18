import { Button } from "arxatec-ui";
import { Loader2 } from "lucide-react";

import { SESSION_CLOSE_TARGETS, type SessionCloseTarget } from "../../types";

export interface SessionExpiredActionsProps {
  primaryLabel: string;
  secondaryLabel: string;
  pendingTarget: SessionCloseTarget | null;
  onSelect: (target: SessionCloseTarget) => void;
}

export const SessionExpiredActions = ({
  primaryLabel,
  secondaryLabel,
  pendingTarget,
  onSelect,
}: SessionExpiredActionsProps) => {
  const isBusy = pendingTarget !== null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        className="w-full"
        aria-busy={pendingTarget === SESSION_CLOSE_TARGETS.login}
        disabled={isBusy}
        onClick={() => {
          onSelect(SESSION_CLOSE_TARGETS.login);
        }}
      >
        {pendingTarget === SESSION_CLOSE_TARGETS.login ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : null}
        {primaryLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        aria-busy={pendingTarget === SESSION_CLOSE_TARGETS.catalog}
        disabled={isBusy}
        onClick={() => {
          onSelect(SESSION_CLOSE_TARGETS.catalog);
        }}
      >
        {pendingTarget === SESSION_CLOSE_TARGETS.catalog ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : null}
        {secondaryLabel}
      </Button>
    </div>
  );
};
