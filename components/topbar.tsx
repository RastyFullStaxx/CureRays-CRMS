import { Bell, LockKeyhole, Plus, Search, ShieldCheck, UserRound } from "lucide-react";

export function Topbar() {
  return (
    <header className="glass-panel rounded-glass px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-curerays-orange">Good afternoon, Clinical Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-curerays-dark-plum">
            CureRays clinical operations
          </h1>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1 md:w-80" aria-label="Search patients and actions">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-curerays-plum"
              aria-hidden="true"
            />
            <input
              className="h-11 w-full rounded-lg border border-white/80 bg-white/72 pl-10 pr-4 text-sm font-medium text-curerays-dark-plum outline-none transition placeholder:text-curerays-indigo/50 focus:border-curerays-blue/30 focus:ring-4 focus:ring-curerays-blue/10"
              placeholder="Search patient ID, staff, next action"
              type="search"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="grid h-11 w-11 place-items-center rounded-lg border border-white/80 bg-white/70 text-curerays-dark-plum shadow-sm transition hover:bg-white"
              type="button"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/80 bg-white/64 px-3 text-xs font-semibold text-curerays-indigo">
              <ShieldCheck className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
              RBAC preview
            </span>
            <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-curerays-plum/10 bg-curerays-plum/8 px-3 text-xs font-semibold text-curerays-dark-plum">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Clinical Admin
            </span>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-curerays-orange px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-[#f05f1b]"
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-curerays-indigo">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/58 px-3 py-2">
          <LockKeyhole className="h-3.5 w-3.5 text-curerays-plum" aria-hidden="true" />
          Operational view minimizes sensitive chart details
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/58 px-3 py-2">
          Phase changes are audit-visible
        </span>
      </div>
    </header>
  );
}
