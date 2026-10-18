export const SESSION_CLOSE_TARGETS = {
  login: "login",
  catalog: "catalog",
} as const;

export type SessionCloseTarget =
  (typeof SESSION_CLOSE_TARGETS)[keyof typeof SESSION_CLOSE_TARGETS];

export interface SessionCloseResult {
  revoked: boolean;
}

export interface SessionCloseOutcome extends SessionCloseResult {
  target: SessionCloseTarget;
}
