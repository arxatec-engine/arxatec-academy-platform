import {
  AsyncBoundary,
  PaginationController,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusMessage,
} from "arxatec-ui";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { AdminPage } from "@/modules/admin/components/admin_page";
import {
  useModeration,
  useModerationCounts,
} from "@/modules/admin/hooks/moderation";
import { MODERATION_TEXT } from "@/modules/admin/i18n";
import type { ModerationTab } from "@/modules/admin/types/moderation";
import { ModerationRow } from "../moderation_row";

export const ModerationContent = () => {
  const { t } = useTranslation(NS.common);
  const [tab, setTab] = useState<ModerationTab>("recent");
  const [page, setPage] = useState(1);
  const query = useModeration(tab, page);
  const counts = useModerationCounts();
  if (query.isError) throw query.error;
  return (
    <AdminPage
      title={t(MODERATION_TEXT.title)}
      description={t(MODERATION_TEXT.subtitle)}
      action={
        <Select
          value={tab}
          onValueChange={(value: ModerationTab) => {
            setTab(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            size="sm"
            className="min-w-40 shrink-0 bg-card"
            aria-label={t(MODERATION_TEXT.tab)}
          >
            <SelectValue placeholder={t(MODERATION_TEXT.tab)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t(MODERATION_TEXT.recent)}</SelectItem>
            <SelectItem value="reported">
              {t(MODERATION_TEXT.reported)}
            </SelectItem>
            <SelectItem value="hidden">{t(MODERATION_TEXT.hidden)}</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {counts.data && (
        <div
          className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
          role="status"
        >
          <span>
            {t(MODERATION_TEXT.pending, { count: counts.data.pending })}
          </span>
          <span>
            {t(MODERATION_TEXT.reports, { count: counts.data.reported })}
          </span>
        </div>
      )}
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
      >
        {(data) => (
          <>
            {data.comments.length === 0 ? (
              <div role="status">
                <StatusMessage
                  size="sm"
                  color="white"
                  icon={MessageCircle}
                  title={t(UI_TEXT.emptyTitle)}
                  description={t(MODERATION_TEXT.empty)}
                />
              </div>
            ) : (
              <ol className="space-y-2">
                {data.comments.map((comment) => (
                  <ModerationRow key={comment.id} comment={comment} />
                ))}
              </ol>
            )}
            <div className="mt-4">
              <PaginationController
                pagination={{
                  page,
                  limit: data.pagination.page_size,
                  total: data.pagination.total,
                  total_pages: Math.ceil(
                    data.pagination.total / data.pagination.page_size,
                  ),
                }}
                setPage={(nextPage) => {
                  const totalPages = Math.ceil(
                    data.pagination.total / data.pagination.page_size,
                  );
                  if (nextPage >= 1 && nextPage <= totalPages) setPage(nextPage);
                }}
              />
            </div>
          </>
        )}
      </AsyncBoundary>
    </AdminPage>
  );
};
