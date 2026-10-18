import { Button } from "arxatec-ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";
import type { LessonView } from "@/modules/catalog/types";
import { RouteHelpers } from "@/routes/routes";

interface Props {
  view: LessonView;
  courseSlug: string;
}

export const LessonNavigation = ({ view, courseSlug }: Props) => {
  const { t } = useTranslation(NS.common);
  if (!view.navigation.previous && !view.navigation.next) return null;
  return (
    <nav
      aria-label={t(LESSON_TEXT.navigation)}
      className="mt-6 grid gap-3 sm:grid-cols-2"
    >
      {view.navigation.previous && (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-auto min-w-0 justify-start gap-3 p-2 text-left whitespace-normal"
        >
          <Link to={RouteHelpers.lesson(courseSlug, view.navigation.previous.slug)}>
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0">
              <span className=" block text-sm font-normal">
                {t(LESSON_TEXT.previous)}
              </span>
              <span className="text-sm text-muted-foreground">{view.navigation.previous.title}</span>
            </span>
          </Link>
        </Button>
      )}
      {view.navigation.next && (
        <Button
          asChild
          size="sm"
          className="h-auto min-w-0 justify-between gap-3 p-2 text-left whitespace-normal sm:col-start-2"
        >
          <Link to={RouteHelpers.lesson(courseSlug, view.navigation.next.slug)}>
            <span className="min-w-0">
              <span className="block text-sm font-normal">
                {t(LESSON_TEXT.next)}
              </span>
              <span className="text-sm text-muted-foreground">{view.navigation.next.title}</span>
            </span>
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </Button>
      )}
    </nav>
  );
};
