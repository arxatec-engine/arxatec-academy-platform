const FORBIDDEN_PREFIXES = ["//", "/\\", "/%2f", "/%5c"];

const MAX_CONTROL_CODE_POINT = 0x20;
const DELETE_CODE_POINT = 0x7f;

const hasUnsafeCharacters = (value: string): boolean => {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint <= MAX_CONTROL_CODE_POINT || codePoint === DELETE_CODE_POINT) return true;
  }
  return false;
};

export const isSafeRedirectPath = (value: string): boolean => {
  if (value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  if (hasUnsafeCharacters(value)) return false;
  const lowercased = value.toLowerCase();
  return !FORBIDDEN_PREFIXES.some((prefix) => lowercased.startsWith(prefix));
};

export const sanitizeRedirectPath = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isSafeRedirectPath(trimmed) ? trimmed : null;
};
