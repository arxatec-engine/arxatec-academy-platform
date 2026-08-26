export interface ApiForgotPasswordRequest {
  email: string;
  redirect_to?: string;
}

export interface ForgotPasswordInput {
  email: string;
  redirectTo: string | null;
}
