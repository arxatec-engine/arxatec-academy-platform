import { Button } from "arxatec-ui";
import { Loader2 } from "lucide-react";

export interface AuthSubmitButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const AuthSubmitButton = ({
  label,
  loadingLabel,
  loading = false,
  disabled = false,
}: AuthSubmitButtonProps) => (
  <Button
    type="submit"
    size="sm"
    className="w-full"
    aria-busy={loading}
    disabled={disabled || loading}
  >
    {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
    {loading && loadingLabel !== undefined ? loadingLabel : label}
  </Button>
);
