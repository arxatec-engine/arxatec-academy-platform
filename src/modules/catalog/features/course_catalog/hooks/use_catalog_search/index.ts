import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { COURSE_LEVELS, COURSE_TOPICS } from "@/modules/catalog/constants";

export const useCatalogSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const topic = COURSE_TOPICS.find(
    (entry) => entry === searchParams.get("topic"),
  );
  const level = COURSE_LEVELS.find(
    (entry) => entry === searchParams.get("level"),
  );
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(search);
  const pendingSearch = useRef(search);
  useEffect(() => {
    if (pendingSearch.current === search) return;
    pendingSearch.current = search;
    setSearchInput(search);
  }, [search]);
  useEffect(() => {
    const value = searchInput.trim();
    if (value === search) return;
    const timeout = window.setTimeout(() => {
      pendingSearch.current = value;
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (value) next.set("search", value);
        else next.delete("search");
        return next;
      }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, search, setSearchParams]);
  const filters = {
    topic: topic ? [topic] : [],
    level: level ? [level] : [],
    search,
  };
  const updateFilter = (name: "topic" | "level", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next);
  };
  return {
    topic,
    level,
    search,
    searchInput,
    filters,
    updateFilter,
    setSearchInput,
  };
};
