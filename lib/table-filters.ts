export type FacetOption = {
  label: string;
  value: string;
};

type FacetValue = string | number | boolean | null | undefined;

export function createFacetOptions<T>(
  rows: T[],
  getValue: (row: T) => FacetValue | FacetValue[],
): FacetOption[] {
  const values = new Set<string>();

  rows.forEach((row) => {
    const rawValue = getValue(row);
    const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];

    rawValues.forEach((value) => {
      if (value === null || value === undefined) {
        return;
      }

      const normalized = String(value).trim();
      if (!normalized || normalized === '—' || normalized === '-') {
        return;
      }

      values.add(normalized);
    });
  });

  return Array.from(values)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((value) => ({ label: value, value }));
}
