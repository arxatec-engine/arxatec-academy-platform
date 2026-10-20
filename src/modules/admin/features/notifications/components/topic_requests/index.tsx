import { AsyncBoundary, StatusMessage } from "arxatec-ui";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { useTopicRequests } from "@/modules/admin/hooks/notifications";
import { NOTICES_TEXT } from "@/modules/admin/i18n";
import { NotificationSection } from "../notification_section";

export const TopicRequests = () => {
  const { t } = useTranslation(NS.common);
  const query = useTopicRequests();
  if (query.isError) throw query.error;
  return (
    <NotificationSection title={t(NOTICES_TEXT.topics)}>
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
      >
        {(data) =>
          data.topics.length === 0 ? (
            <div role="status">
              <StatusMessage
                size="sm"
                color="white"
                icon={Inbox}
                title={t(UI_TEXT.emptyTitle)}
                description={t(NOTICES_TEXT.empty)}
              />
            </div>
          ) : (
            <ol className="-mx-3 divide-y divide-border sm:-mx-4">
              {data.topics.map((topic) => (
                <li
                  key={topic.search_term_normalized}
                  className="px-3 py-2 [overflow-wrap:anywhere] sm:px-4"
                >
                  <h3 className="text-sm font-normal">{topic.search_term}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
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
    </NotificationSection>
  );
};
