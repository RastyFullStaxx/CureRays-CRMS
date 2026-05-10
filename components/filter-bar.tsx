import { Filter, Search } from "lucide-react";

export function FilterBar({
  searchPlaceholder = "Search",
  filters
}: {
  searchPlaceholder?: string;
  filters: string[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.06)] md:flex-row md:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#D8E4F5] bg-white px-3 py-2.5 text-sm text-[#3D5A80]">
        <Search className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:text-[#3D5A80]/60"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            className="inline-flex min-w-fit items-center gap-2 rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-xs font-bold text-[#061A55]"
            type="button"
          >
            <Filter className="h-3.5 w-3.5 text-[#0033A0]" aria-hidden="true" />
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
