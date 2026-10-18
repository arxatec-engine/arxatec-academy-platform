import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "arxatec-ui";
import { ChartNoAxesColumnIncreasing, Layers, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { COURSE_LEVELS, COURSE_TOPICS } from "@/modules/catalog/constants";
import { CATALOG_TEXT, COURSE_LEVEL_LABELS, COURSE_TOPIC_LABELS } from "@/modules/catalog/i18n";
import type { Catalog } from "@/modules/catalog/types";
import type { useCatalogSearch } from "../../hooks/use_catalog_search";

interface Props { searchState: ReturnType<typeof useCatalogSearch>; facets?: Catalog["facets"] }

export const CatalogFilters = ({ searchState, facets }: Props) => {
  const { t } = useTranslation(NS.common);

  return <div className="mb-5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2">
    <div className="relative min-w-0">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input size="sm" id="catalog-search" name="search" type="search" value={searchState.searchInput}
        onChange={(event) => searchState.setSearchInput(event.target.value)} maxLength={120}
        aria-label={t(CATALOG_TEXT.searchLabel)} placeholder={t(CATALOG_TEXT.searchLabel)}
        className="bg-card pl-10" />
    </div>
    <Select value={searchState.topic ?? ""}
      onValueChange={(value) => searchState.updateFilter("topic", value === "ALL" ? "" : value)}>
      <SelectTrigger size="sm" id="catalog-topic" aria-label={t(CATALOG_TEXT.topicLabel)} className="relative w-full min-w-0 bg-card pr-2 pl-10 sm:pr-3">
        <Layers aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <SelectValue className="min-w-0 flex-1 text-left" placeholder={t(CATALOG_TEXT.topicLabel)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t(CATALOG_TEXT.allTopics)}</SelectItem>
        {COURSE_TOPICS.map((topic) => <SelectItem key={topic} value={topic}>
          {t(COURSE_TOPIC_LABELS[topic])}{facets ? ` (${facets.topic[topic]})` : ""}
        </SelectItem>)}
      </SelectContent>
    </Select>
    <Select value={searchState.level ?? ""}
      onValueChange={(value) => searchState.updateFilter("level", value === "ALL" ? "" : value)}>
      <SelectTrigger size="sm" id="catalog-level" aria-label={t(CATALOG_TEXT.levelLabel)} className="relative w-full min-w-0 bg-card pr-2 pl-10 sm:pr-3">
        <ChartNoAxesColumnIncreasing aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <SelectValue className="min-w-0 flex-1 text-left" placeholder={t(CATALOG_TEXT.levelLabel)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">{t(CATALOG_TEXT.allLevels)}</SelectItem>
        {COURSE_LEVELS.map((level) => <SelectItem key={level} value={level}>
          {t(COURSE_LEVEL_LABELS[level])}{facets ? ` (${facets.level[level]})` : ""}
        </SelectItem>)}
      </SelectContent>
    </Select>
  </div>;
};
