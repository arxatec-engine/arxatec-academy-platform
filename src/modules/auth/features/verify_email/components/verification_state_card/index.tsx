import { Skeleton } from "arxatec-ui";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AuthCard } from "@/modules/auth/components/auth_card";

export interface VerificationStateCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  secondary?: ReactNode;
  busy?: boolean;
  announce?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  status?: "info" | "error";
}

export const VerificationStateCard = ({
  icon,
  title,
  description,
  secondary,
  busy = false,
  announce = false,
  children,
  footer,
  status = "info",
}: VerificationStateCardProps) => (
  <div
    aria-live={announce ? "polite" : undefined}
    aria-busy={busy}
    className="flex w-full justify-center"
  >
    <AuthCard
      title={title}
      subtitle={description}
      status={busy ? undefined : status}
      icon={icon}
      footer={footer}
    >
      {busy ? (
        <Skeleton
          aria-hidden="true"
          className="h-32 w-full motion-reduce:animate-none"
        />
      ) : null}
      {secondary === undefined ? null : (
        <p className="text-sm text-muted-foreground">{secondary}</p>
      )}
      {children === undefined ? null : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </AuthCard>
  </div>
);
