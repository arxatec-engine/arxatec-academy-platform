import {
  Button,
  Card,
  CardContent,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "arxatec-ui";
import { ChevronDown, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import motion from "@/components/shared/collapsible_motion.module.css";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";

interface Props {
  transcript: string;
}

export const LessonTranscript = ({ transcript }: Props) => {
  const { t } = useTranslation(NS.common);
  return (
    <Card className="mt-6 gap-0 overflow-hidden rounded-md py-0 shadow-none">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="group h-auto w-full justify-between rounded-md p-5 text-sm font-normal"
          >
            <span className="flex items-center gap-3">
              <FileText
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              {t(LESSON_TEXT.transcript)}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className={motion.content}>
          <CardContent className="border-t border-border p-5 sm:p-6">
            <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed font-normal text-muted-foreground">
              {transcript}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
