import type { ReactNode } from "react";
import { Header } from "@/modules/auth/components/header";
import { cn } from "@/utilities/cn";

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const AuthCard = ({
  title,
  subtitle,
  children,
  footer,
  className,
}: Props) => (
  <div className={cn("flex w-full flex-col gap-6", className)}>
    <Header title={title} description={subtitle} />
    <div>
      {children === undefined ? null : (
        <div className="flex flex-col gap-4">{children}</div>
      )}
      {footer === undefined ? null : (
        <div className="mt-4 text-center text-sm text-secondary-foreground">
          {footer}
        </div>
      )}
    </div>
  </div>
);
