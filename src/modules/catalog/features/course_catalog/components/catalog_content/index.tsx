import { AsyncBoundary, StatusMessage } from "arxatec-ui";
import { SearchX, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "@/components/shared/loading_screen";
import { NS } from "@/locales/namespaces";
import { CATALOG_SECTION_ID } from "@/modules/catalog/constants";
import { useCatalog } from "@/modules/catalog/hooks";
import { CATALOG_TEXT } from "@/modules/catalog/i18n";
import { useCatalogSearch } from "../../hooks/use_catalog_search";
import { CatalogCard } from "../catalog_card";
import { CatalogFilters } from "../catalog_filters";

export const CatalogContent = () => {
  const { t } = useTranslation(NS.common);
  const searchState = useCatalogSearch();
  const query = useCatalog(searchState.filters);
  const hasFilters = Boolean(
    searchState.search || searchState.topic || searchState.level,
  );
  return (
    <section id={CATALOG_SECTION_ID} aria-labelledby="catalog-title">
      <div className="mb-4 max-w-2xl">
        <h1 id="catalog-title" className="text-2xl ">
          {t(CATALOG_TEXT.title)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(CATALOG_TEXT.subtitle)}
        </p>
      </div>
      <CatalogFilters searchState={searchState} facets={query.data?.facets} />
      <div className=" flex min-h-8 items-center gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {query.data &&
            t(CATALOG_TEXT.coursesCount, { count: query.data.courses.length })}
        </p>
      </div>
      <AsyncBoundary
        isLoading={query.isPending}
        isError={query.isError}
        data={query.data}
        LoadingComponent={<LoadingScreen />}
        ErrorComponent={
          <div role="alert" className="space-y-3">
            <StatusMessage
              size="sm"
              color="rose"
              icon={TriangleAlert}
              title={t(CATALOG_TEXT.loadErrorTitle)}
              description={t(CATALOG_TEXT.loadErrorDescription)}
            />
          </div>
        }
      >
        {(catalog) =>
          catalog.courses.length === 0 ? (
            <StatusMessage
              size="sm"
              color="white"
              icon={SearchX}
              title={t(hasFilters ? CATALOG_TEXT.noResults : CATALOG_TEXT.noCourses)}
              description={t(
                hasFilters ? CATALOG_TEXT.emptyHint : CATALOG_TEXT.noCoursesHint,
              )}
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.courses.map((course) => (
                <CatalogCard key={course.slug} course={course} />
              ))}
            </div>
          )
        }
      </AsyncBoundary>
    </section>
  );
};
