import { Skeleton } from "arxatec-ui";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AuthCard } from "@/modules/auth/components/auth_card";
import { cn } from "@/utilities/cn";

export interface VerificationStateCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: ReactNode;
  secondary?: ReactNode;
  busy?: boolean;
  announce?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}

export const VerificationStateCard = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  secondary,
  busy = false,
  announce = false,
  children,
  footer,
}: VerificationStateCardProps) => (
  <div
    aria-live={announce ? "polite" : undefined}
    aria-busy={busy}
    className="flex w-full justify-center"
  >
    <AuthCard title={title} footer={footer}>
      {busy ? (
        <Skeleton
          aria-hidden="true"
          className="h-32 w-full motion-reduce:animate-none"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
        >
          <Icon className={cn("size-4", iconClassName)} />
        </span>
      )}
      {description === undefined ? null : (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {secondary === undefined ? null : (
        <p className="text-sm text-muted-foreground">{secondary}</p>
      )}
      {children === undefined ? null : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </AuthCard>
  </div>
);
