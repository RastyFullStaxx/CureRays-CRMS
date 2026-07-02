export const uiTypography = {
  size: {
    label: 12,
    body: 13,
    heading: 14,
    title: 18,
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export function resolveUiFontFamily(): string {
  if (typeof document === 'undefined') {
    return 'Inter, Arial, sans-serif';
  }

  return getComputedStyle(document.documentElement).fontFamily;
}
