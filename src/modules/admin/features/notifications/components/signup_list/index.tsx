import {
  AsyncBoundary,
  Badge,
  Button,
  PaginationController,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusMessage,
} from "arxatec-ui";
import { Download, Inbox } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import {
  useExportNoticeSignups,
  useNoticeSignups,
} from "@/modules/admin/hooks/notifications";
import { ADMIN_TEXT, NOTICES_TEXT } from "@/modules/admin/i18n";
import type { SignupFilters } from "@/modules/admin/types/notifications";
import { NotificationSection } from "../notification_section";

interface Props {
  onExported: (cutoff: string) => void;
}

export const SignupList = ({ onExported }: Props) => {
  const { t } = useTranslation(NS.common);
  const [filters, setFilters] = useState<SignupFilters>({ page: 1 });
  const query = useNoticeSignups(filters);
  const download = useExportNoticeSignups();
  if (query.isError) throw query.error;
  const exportCsv = () => {
    const cutoff = new Date().toISOString();
    void toast.promise(
      download.mutateAsync(filters).then(() => onExported(cutoff)),
      {
        loading: t(NOTICES_TEXT.export),
        success: t(NOTICES_TEXT.export),
        error: t(ADMIN_TEXT.failed),
      },
    );
  };
  return (
    <NotificationSection title={t(NOTICES_TEXT.signups)}>
      <div className="flex flex-wrap gap-2">
        <Select
          value={
            filters.notified === undefined ? "all" : String(filters.notified)
          }
          onValueChange={(value) =>
            setFilters({
              page: 1,
              notified: value === "all" ? undefined : value === "true",
            })
          }
        >
          <SelectTrigger
            size="sm"
            className="min-w-0 flex-1 bg-card sm:max-w-xs"
            aria-label={t(ADMIN_TEXT.status)}
          >
            <SelectValue placeholder={t(ADMIN_TEXT.status)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(NOTICES_TEXT.all)}</SelectItem>
            <SelectItem value="false">{t(NOTICES_TEXT.new)}</SelectItem>
            <SelectItem value="true">{t(NOTICES_TEXT.notified)}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          type="button"
          variant="outline"
          disabled={download.isPending}
          onClick={exportCsv}
        >
          <Download aria-hidden="true" className="size-4" />
          {t(NOTICES_TEXT.export)}
        </Button>
      </div>
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
      >
        {(data) => (
          <>
            {data.signups.length === 0 ? (
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
                {data.signups.map((signup) => (
                  <li
                    key={signup.id}
                    className="flex flex-wrap items-start justify-between gap-2 border-border px-3 py-3 text-sm first:border-t last:border-b sm:px-4"
                  >
                    <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <p>{signup.email}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        {signup.course?.title ?? t(NOTICES_TEXT.general)}
                      </p>
                    </div>
                    <Badge
                      variant={signup.notified_at ? "outline" : "secondary"}
                      className="shrink-0 text-sm font-normal"
                    >
                      {t(
                        signup.notified_at
                          ? NOTICES_TEXT.notified
                          : NOTICES_TEXT.new,
                      )}
                    </Badge>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4">
              <PaginationController
                pagination={{
                  page: filters.page,
                  limit: data.pagination.per_page,
                  total: data.pagination.total,
                  total_pages: Math.ceil(
                    data.pagination.total / data.pagination.per_page,
                  ),
                }}
                setPage={(page) => {
                  const totalPages = Math.ceil(
                    data.pagination.total / data.pagination.per_page,
                  );
                  if (page >= 1 && page <= totalPages)
                    setFilters((previous) => ({ ...previous, page }));
                }}
              />
            </div>
          </>
        )}
      </AsyncBoundary>
    </NotificationSection>
  );
};
