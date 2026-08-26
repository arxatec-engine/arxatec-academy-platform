export interface ResponseMeta {
  code?: string;
  fields?: Record<string, string>;
  retry_after_seconds?: number;
}

export interface Response<T = void> {
  status: number;
  message: string;
  description: string;
  timestamp: string;
  path: string;
  data?: T;
  meta?: ResponseMeta;
}
