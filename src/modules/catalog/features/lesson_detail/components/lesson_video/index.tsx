import { Button, Card, CardContent } from "arxatec-ui";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { LESSON_TEXT } from "@/modules/catalog/i18n";
import type { Lesson } from "@/modules/catalog/types";
import { getVideoUrls } from "../../utils";

interface Props {
  lesson: Lesson;
}

export const LessonVideo = ({ lesson }: Props) => {
  const { t } = useTranslation(NS.common);
  const video = lesson.video ? getVideoUrls(lesson.video) : null;
  return (
    <section className="mt-4" aria-label={t(LESSON_TEXT.videoLabel)}>
      <Card className="gap-0 overflow-hidden rounded-md py-0 shadow-none">
        {video && (
          <div className="aspect-video bg-muted">
            <iframe
              title={lesson.title}
              src={video.embed}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="size-full border-0"
            />
          </div>
        ) }
        {video && (
          <CardContent className="flex flex-col justify-between gap-2 p-3 sm:flex-row sm:items-center ">
            <p className="max-w-xl text-sm text-muted-foreground">
              {t(LESSON_TEXT.videoHelp)}
            </p>
            <Button size="sm" asChild variant="outline" className="shrink-0">
              <a
                href={video.external}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(LESSON_TEXT.openVideo)}
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </Button>
          </CardContent>
        )}
      </Card>
    </section>
  );
};
