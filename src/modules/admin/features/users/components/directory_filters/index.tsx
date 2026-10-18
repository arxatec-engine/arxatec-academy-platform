import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "arxatec-ui";
import { ArrowDownWideNarrow, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NS } from "@/locales/namespaces";
import { DIRECTORY_TEXT } from "@/modules/admin/i18n";
import type { DirectoryFilters as Filters } from "@/modules/admin/types/users";
import { PROFILE_TEXT } from "@/modules/profile/i18n";
import { API_USER_CITIES } from "@/types/auth";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export const DirectoryFilters = ({ filters, onChange }: Props) => {
  const { t } = useTranslation(NS.common);
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    const value = search.trim();
    if (value === (filters.search ?? "")) return;
    const timeout = window.setTimeout(() => {
      onChange({ ...filters, search: value, page: 1 });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search, filters, onChange]);

  return (
    <div className="mb-5">
      <form
        className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]"
        onSubmit={(event) => {
          event.preventDefault();
          onChange({ ...filters, search: search.trim(), page: 1 });
        }}
      >
        <div className="relative col-span-2 min-w-0 sm:col-span-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            size="sm"
            id="directory-search"
            name="search"
            type="search"
            className="bg-card pl-10"
            value={search}
            aria-label={t(DIRECTORY_TEXT.search)}
            placeholder={t(DIRECTORY_TEXT.search)}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={filters.city?.[0] ?? ""}
          onValueChange={(value) => {
            const city = API_USER_CITIES.find((entry) => entry === value);
            onChange({ ...filters, city: city ? [city] : [], page: 1 });
          }}
        >
          <SelectTrigger
            size="sm"
            id="directory-city"
            className="relative w-full min-w-0 bg-card pr-2 pl-10 sm:pr-3"
            aria-label={t(DIRECTORY_TEXT.city)}
          >
            <MapPin
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <SelectValue
              className="min-w-0 flex-1 text-left"
              placeholder={t(DIRECTORY_TEXT.city)}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t(DIRECTORY_TEXT.allCities)}</SelectItem>
            <SelectItem value="LIMA">{t(PROFILE_TEXT.cityLima)}</SelectItem>
            <SelectItem value="AREQUIPA">
              {t(PROFILE_TEXT.cityArequipa)}
            </SelectItem>
            <SelectItem value="TRUJILLO">
              {t(PROFILE_TEXT.cityTrujillo)}
            </SelectItem>
            <SelectItem value="OTHER">
              {t(PROFILE_TEXT.cityOtherOption)}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sort ?? "created_at"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              sort: value === "full_name" ? "full_name" : "created_at",
              page: 1,
            })
          }
        >
          <SelectTrigger
            size="sm"
            id="directory-sort"
            className="relative w-full min-w-0 bg-card pr-2 pl-10 sm:pr-3"
            aria-label={t(DIRECTORY_TEXT.sort)}
          >
            <ArrowDownWideNarrow
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <SelectValue
              className="min-w-0 flex-1 text-left"
              placeholder={t(DIRECTORY_TEXT.sort)}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">
              {t(DIRECTORY_TEXT.recent)}
            </SelectItem>
            <SelectItem value="full_name">{t(DIRECTORY_TEXT.name)}</SelectItem>
          </SelectContent>
        </Select>
      </form>
    </div>
  );
};
