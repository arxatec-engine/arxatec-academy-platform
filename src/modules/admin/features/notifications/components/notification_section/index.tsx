import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "arxatec-ui";
import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import motion from "@/components/shared/collapsible_motion.module.css";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
}

export const NotificationSection = ({ title, description, children }: Props) => {
  const titleId = useId();

  return (
    <Collapsible className="min-w-0 text-sm">
      <h2 id={titleId}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="group h-auto w-full justify-between gap-2 rounded-none p-2 text-left text-sm font-normal whitespace-normal "
          >
            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              {title}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
            />
          </Button>
        </CollapsibleTrigger>
      </h2>
      <CollapsibleContent
        role="region"
        aria-labelledby={titleId}
        className={motion.content}
      >
        <div className="space-y-3 border-t border-border p-3 sm:p-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
