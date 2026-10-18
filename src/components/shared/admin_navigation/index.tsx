import { ScrollArea, ScrollBar } from "arxatec-ui";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, matchPath, useLocation } from "react-router-dom";
import { UI_TEXT } from "@/components/shared/i18n";
import { NS } from "@/locales/namespaces";
import { ROUTES } from "@/routes/routes";
import { ADMIN_NAVIGATION } from "./constants";

export const AdminNavigation = () => {
  const { t } = useTranslation(NS.common);
  const { pathname } = useLocation();
  const activePath = matchPath(ROUTES.admin_lesson, pathname)
    ? ROUTES.admin_courses
    : pathname;
  const navigationRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const indicator = indicatorRef.current;
    if (!navigation || !indicator) return;

    const updateIndicator = () => {
      const activeLink = navigation.querySelector<HTMLAnchorElement>(
        '[aria-current="page"]',
      );
      indicator.hidden = activeLink === null;
      if (!activeLink) return;

      const firstPosition = indicator.style.width === "";
      if (firstPosition) indicator.style.transition = "none";
      indicator.style.width = `${activeLink.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;

      if (firstPosition) {
        // Commit the initial position before enabling movement between sections.
        indicator.getBoundingClientRect();
        indicator.style.removeProperty("transition");
      }
    };

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(navigation);
    navigation.querySelectorAll("a").forEach((link) => observer.observe(link));

    return () => observer.disconnect();
  }, [activePath]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl border-x border-b border-border bg-background px-4 sm:px-6">
      <ScrollArea className="w-full">
        <nav
          ref={navigationRef}
          aria-label={t(UI_TEXT.administration)}
          className="relative flex w-max min-w-full gap-4"
        >
          {ADMIN_NAVIGATION.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              aria-current={
                matchPath({ path, end: false }, activePath) ? "page" : undefined
              }
              className="inline-flex h-10 shrink-0 items-center gap-2 border-b-2 border-transparent px-1 text-sm font-normal text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring aria-[current=page]:text-foreground"
            >
              <Icon aria-hidden="true" className="size-4" />
              {t(label)}
            </Link>
          ))}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-foreground transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
          />
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
