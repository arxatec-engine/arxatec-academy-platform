import { AsyncBoundary, Card, CardContent, Skeleton } from "arxatec-ui";
import { CalendarDays, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { useProfileSummary } from "@/modules/profile/hooks";
import { PROFILE_TEXT } from "@/modules/profile/i18n";

export const ProfileSummary = () => {
  const { t, i18n } = useTranslation(NS.common);
  const query = useProfileSummary();
  return (
    <AsyncBoundary
      isLoading={query.isPending}
      isError={query.isError}
      data={query.data}
      LoadingComponent={
        <Skeleton
          role="status"
          aria-label={t(PROFILE_TEXT.loading)}
          aria-busy="true"
          className="h-24 w-full motion-reduce:animate-none"
        />
      }
      ErrorComponent={
        <p className="text-sm text-muted-foreground">
          {t(PROFILE_TEXT.failed)}
        </p>
      }
    >
      {(summary) => (
        <Card className="rounded-md bg-card border-border border py-3 shadow-none">
          <CardContent className="space-y-2 px-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <span>
                {t(PROFILE_TEXT.memberSince, {
                  date: new Date(summary.member_since).toLocaleDateString(
                    i18n.language,
                    {
                      month: "long",
                      year: "numeric",
                    },
                  ),
                })}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <GraduationCap
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <span>
                {t(PROFILE_TEXT.completedCourses, {
                  count: summary.completed_courses,
                })}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </AsyncBoundary>
  );
};
