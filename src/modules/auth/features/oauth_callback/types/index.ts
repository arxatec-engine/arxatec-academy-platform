export interface GoogleExchangeRequest {
  code: string;
}

export const OAUTH_EXCHANGE_REASONS = ["missing_code", "failed"] as const;

export type OauthExchangeReason = (typeof OAUTH_EXCHANGE_REASONS)[number];

export type OauthExchange =
  | { status: "loading"; target: string }
  | {
      status: "error";
      reason: OauthExchangeReason;
      error: unknown;
      target: string;
    }
  | { status: "done"; target: string };
