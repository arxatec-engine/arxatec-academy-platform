export const NS = {
  common: "common",
  auth: "auth",
} as const;

export type Namespace = (typeof NS)[keyof typeof NS];

export const NAMESPACES = [NS.common, NS.auth] as const;

export const DEFAULT_NS = NS.common;
