import {
  Button,
  Card,
  CardContent,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
  cn,
} from "arxatec-ui";
import { ChevronDown, ExternalLink, FileText, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import motion from "@/components/shared/collapsible_motion.module.css";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";
import type { Lesson } from "@/modules/catalog/types";

interface Props {
  resources: Lesson["resources"];
  grouped?: boolean;
}

export const LessonResources = ({ resources, grouped = false }: Props) => {
  const { t } = useTranslation(NS.common);
  const [open, setOpen] = useState(false);
  return (
    <section
      className={grouped ? undefined : "mt-6"}
      aria-labelledby="resources-title"
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden py-0 shadow-none",
          grouped ? "rounded-none border-0" : "rounded-md",
        )}
      >
        <Collapsible open={open} onOpenChange={setOpen}>
          <h2 id="resources-title">
            <CollapsibleTrigger
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group h-auto w-full justify-between p-2 text-sm",
                grouped ? "rounded-none" : "rounded-md",
              )}
            >
              <span className="flex items-center gap-3">
                <FolderOpen
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
                {t(LESSON_TEXT.resources)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none group-data-[state=open]:rotate-180"
              />
            </CollapsibleTrigger>
          </h2>
          <CollapsibleContent className={motion.content}>
            <CardContent className="border-t border-border px-0">
              <Table classNameFather="rounded-none border-0" className="table-fixed">
                <TableCaption className="sr-only">
                  {t(LESSON_TEXT.resources)}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="px-4 sm:px-5">
                      {t(LESSON_TEXT.resourceFile)}
                    </TableHead>
                    <TableHead scope="col" className="w-16 px-2 text-right">
                      {t(LESSON_TEXT.resourceLink)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.fileUrl}>
                      <TableCell className="px-4 whitespace-normal sm:px-5">
                        <span className="flex min-w-0 items-center gap-3">
                          <FileText
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                          <span className="min-w-0 break-words">
                            {resource.title}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="px-2 text-right">
                        <Button asChild variant="ghost" size="sm" className="size-8">
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t(LESSON_TEXT.openResource, {
                              title: resource.title,
                            })}
                          >
                            <ExternalLink aria-hidden="true" className="size-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </section>
  );
};
