import { Filter, Search } from "lucide-react";

export function FilterBar({
  searchPlaceholder = "Search",
  filters
}: {
  searchPlaceholder?: string;
  filters: string[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/70 bg-white/42 p-3 md:flex-row md:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-curerays-indigo">
        <Search className="h-4 w-4 shrink-0 text-curerays-plum" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-curerays-indigo/58"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            className="inline-flex min-w-fit items-center gap-2 rounded-lg bg-white/64 px-3 py-2 text-xs font-semibold text-curerays-dark-plum ring-1 ring-curerays-plum/10"
            type="button"
          >
            <Filter className="h-3.5 w-3.5 text-curerays-plum" aria-hidden="true" />
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
