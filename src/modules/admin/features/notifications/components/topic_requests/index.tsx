import { AsyncBoundary } from "arxatec-ui";
import { useTranslation } from "react-i18next";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { AdminSection } from "@/modules/admin/components/admin_section";
import { useTopicRequests } from "@/modules/admin/hooks/notifications";
import { NOTICES_TEXT } from "@/modules/admin/i18n";

export const TopicRequests = () => {
  const { t } = useTranslation(NS.common);
  const query = useTopicRequests();
  return (
    <AdminSection title={t(NOTICES_TEXT.topics)}>
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
        ErrorComponent={<ErrorScreen />}
      >
        {(data) =>
          data.topics.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              {t(NOTICES_TEXT.empty)}
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {data.topics.map((topic) => (
                <li
                  key={topic.search_term_normalized}
                  className="py-3 [overflow-wrap:anywhere]"
                >
                  <h3 className="text-sm font-normal">{topic.search_term}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(NOTICES_TEXT.requests, { count: topic.request_count })} ·{" "}
                    {t(NOTICES_TEXT.uniqueEmails, {
                      count: topic.distinct_emails,
                    })}
                  </p>
                </li>
              ))}
            </ol>
          )
        }
      </AsyncBoundary>
    </AdminSection>
  );
};
