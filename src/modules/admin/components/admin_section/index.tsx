import { useId, type ReactNode } from "react";
import { cn } from "@/utilities/cn";

interface Props {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  showHeading?: boolean;
}

export const AdminSection = ({
  children,
  title,
  description,
  className,
  showHeading = true,
}: Props) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={showHeading ? titleId : undefined}
      aria-label={showHeading ? undefined : title}
      className={cn("min-w-0 space-y-3 border-t border-border pt-5", className)}
    >
      {(showHeading || description) && (
        <div className="space-y-1">
          {showHeading && (
            <h2 id={titleId} className="text-lg font-normal">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
