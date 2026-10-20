import { StatusMessage } from "arxatec-ui";
import { Info, TriangleAlert } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { Header } from "@/modules/auth/components/header";
import { cn } from "@/utilities/cn";

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  status?: "info" | "error";
  icon?: ElementType;
}

export const AuthCard = ({
  title,
  subtitle,
  children,
  footer,
  className,
  status,
  icon,
}: Props) => (
  <div className={cn("flex w-full flex-col gap-6", className)}>
    {status === undefined ? (
      <Header title={title} description={subtitle} />
    ) : (
      <div role={status === "error" ? "alert" : "status"}>
        <StatusMessage
          size="sm"
          color={status === "error" ? "rose" : "white"}
          icon={icon ?? (status === "error" ? TriangleAlert : Info)}
          title={title}
          description={subtitle ?? ""}
        />
      </div>
    )}
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
