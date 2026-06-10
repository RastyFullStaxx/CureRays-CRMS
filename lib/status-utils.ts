/**
 * Maps data-layer tone strings to Badge/StatusBadge variant values.
 * Used across pages to keep status color mapping consistent.
 */
export function mapTone(t: string) {
  if (t === "green" || t === "emerald") return "success";
  if (t === "orange") return "warning";
  if (t === "red") return "error";
  if (t === "purple") return "primary";
  if (t === "blue") return "info";
  return "default" as const;
}
