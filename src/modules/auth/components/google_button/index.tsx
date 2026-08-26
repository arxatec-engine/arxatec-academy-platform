import { Button, GoogleIsotype } from "arxatec-ui";

export interface GoogleButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const GoogleButton = ({ label, onClick, disabled = false, loading = false }: GoogleButtonProps) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    className="w-full"
    aria-busy={loading}
    disabled={disabled || loading}
    onClick={onClick}
  >
    <GoogleIsotype className="size-4" />
    {label}
  </Button>
);
