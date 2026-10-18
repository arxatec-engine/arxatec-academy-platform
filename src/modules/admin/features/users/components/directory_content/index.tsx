import {
  AsyncBoundary,
  Button,
  PaginationController,
} from "arxatec-ui";
import { Download } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ErrorScreen } from "@/components/shared/error_screen";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { AdminPage } from "@/modules/admin/components/admin_page";
import { useDirectory, useExportDirectory } from "@/modules/admin/hooks/users";
import { ADMIN_TEXT, DIRECTORY_TEXT } from "@/modules/admin/i18n";
import type { DirectoryFilters as Filters } from "@/modules/admin/types/users";
import { DirectoryFilters } from "../directory_filters";
import { DirectoryUser } from "../directory_user";

export const DirectoryContent = () => {
  const { t } = useTranslation(NS.common);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    search: "",
    city: [],
    sort: "created_at",
  });
  const query = useDirectory(filters);
  const download = useExportDirectory();
  const exportCsv = () => {
    void toast.promise(download.mutateAsync(filters), {
      loading: t(DIRECTORY_TEXT.export),
      success: t(DIRECTORY_TEXT.export),
      error: t(ADMIN_TEXT.failed),
    });
  };
  return (
    <AdminPage
      title={t(DIRECTORY_TEXT.title)}
      description={t(DIRECTORY_TEXT.subtitle)}
      action={
        <Button
          size="sm"
          type="button"
          variant="outline"
          className="font-normal"
          disabled={download.isPending}
          onClick={exportCsv}
        >
          <Download aria-hidden="true" className="size-4" />
          {t(DIRECTORY_TEXT.export)}
        </Button>
      }
    >
      <DirectoryFilters filters={filters} onChange={setFilters} />
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
        ErrorComponent={<ErrorScreen />}
      >
        {(data) => (
          <>
            <div
              className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
              role="status"
            >
              <span>
                {t(DIRECTORY_TEXT.total, {
                  count: data.stats.total_registered,
                })}
              </span>
              <span>
                {t(DIRECTORY_TEXT.newThisWeek, {
                  count: data.stats.registered_this_week,
                })}
              </span>
            </div>
            {data.users.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                {t(DIRECTORY_TEXT.empty)}
              </p>
            ) : (
              <ol className="grid gap-2 sm:grid-cols-2">
                {data.users.map((user) => (
                  <DirectoryUser key={user.id} user={user} />
                ))}
              </ol>
            )}
            <div className="mt-4">
              <PaginationController
                pagination={{
                  page: filters.page,
                  limit: data.pagination.per_page,
                  total: data.pagination.total,
                  total_pages: data.pagination.total_pages,
                }}
                setPage={(page) => {
                  if (page >= 1 && page <= data.pagination.total_pages)
                    setFilters((previous) => ({ ...previous, page }));
                }}
              />
            </div>
          </>
        )}
      </AsyncBoundary>
    </AdminPage>
  );
};
