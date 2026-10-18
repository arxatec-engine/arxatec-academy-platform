import {
  AsyncBoundary,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "arxatec-ui";
import { Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { AdminPagination } from "@/modules/admin/components/admin_pagination";
import { AdminSection } from "@/modules/admin/components/admin_section";
import {
  useExportNoticeSignups,
  useNoticeSignups,
} from "@/modules/admin/hooks/notifications";
import { ADMIN_TEXT, NOTICES_TEXT } from "@/modules/admin/i18n";
import type { SignupFilters } from "@/modules/admin/types/notifications";

interface Props {
  onExported: (cutoff: string) => void;
}

export const SignupList = ({ onExported }: Props) => {
  const { t } = useTranslation(NS.common);
  const [filters, setFilters] = useState<SignupFilters>({ page: 1 });
  const query = useNoticeSignups(filters);
  const download = useExportNoticeSignups();
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
    <AdminSection title={t(NOTICES_TEXT.signups)} className="border-t-0 pt-0">
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
        ErrorComponent={<ErrorScreen />}
      >
        {(data) => (
          <>
            {data.signups.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                {t(NOTICES_TEXT.empty)}
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {data.signups.map((signup) => (
                  <li
                    key={signup.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                      <p>{signup.email}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        {signup.course?.title ?? t(NOTICES_TEXT.general)}
                      </p>
                    </div>
                    <Badge
                      variant={signup.notified_at ? "outline" : "secondary"}
                      className="shrink-0 font-normal"
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
            <AdminPagination
              page={filters.page}
              hasNext={data.pagination.has_next}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </>
        )}
      </AsyncBoundary>
    </AdminSection>
  );
};
