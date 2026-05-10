import { Bell, ChevronDown, Search, UserRound } from "lucide-react";

const routeTitles: Array<{ match: (pathname: string) => boolean; title: string; subtitle: string }> = [
  { match: (pathname) => pathname === "/" || pathname === "/dashboard", title: "Dashboard", subtitle: "Clinical workflow at a glance" },
  { match: (pathname) => pathname.startsWith("/patients/"), title: "Patient Workspace", subtitle: "Course-centered care" },
  { match: (pathname) => pathname === "/patients", title: "Patients", subtitle: "Master patient registry" },
  { match: (pathname) => pathname === "/courses", title: "Courses", subtitle: "Treatment course registry" },
  { match: (pathname) => pathname === "/workflow", title: "Workflow", subtitle: "Carepath workflow engine" },
  { match: (pathname) => pathname.startsWith("/workflow/igsrt"), title: "Treatment Planning", subtitle: "IGSRT workspace" },
  { match: (pathname) => pathname.startsWith("/workflow/templates"), title: "Templates", subtitle: "Workflow templates" },
  { match: (pathname) => pathname === "/tasks", title: "Tasks", subtitle: "Clinical work queue" },
  { match: (pathname) => pathname === "/schedule", title: "Schedule", subtitle: "Appointments and timing" },
  { match: (pathname) => pathname === "/clinical-forms", title: "Clinical Forms", subtitle: "Structured clinical forms" },
  { match: (pathname) => pathname === "/treatment-planning", title: "Treatment Planning", subtitle: "Plans and prescriptions" },
  { match: (pathname) => pathname === "/imaging", title: "Imaging", subtitle: "Images and attachments" },
  { match: (pathname) => pathname === "/documents", title: "Documents", subtitle: "Generated clinical documents" },
  { match: (pathname) => pathname === "/billing", title: "Billing", subtitle: "Coding readiness" },
  { match: (pathname) => pathname === "/audit", title: "Audit & QA", subtitle: "Course closeout readiness" },
  { match: (pathname) => pathname === "/analytics" || pathname === "/reports", title: "Analytics", subtitle: "Operational insights" },
  { match: (pathname) => pathname === "/settings/users", title: "Users & Roles", subtitle: "Access configuration" },
  { match: (pathname) => pathname === "/settings/templates", title: "Templates", subtitle: "Template configuration" },
  { match: (pathname) => pathname === "/settings", title: "Settings", subtitle: "System configuration" },
  { match: (pathname) => pathname === "/security-logs" || pathname === "/audit-logs", title: "Security Logs", subtitle: "Audit trail" },
  { match: (pathname) => pathname === "/upcoming", title: "Upcoming", subtitle: "Patients before treatment" },
  { match: (pathname) => pathname === "/on-treatment", title: "On Treatment", subtitle: "Active treatment courses" },
  { match: (pathname) => pathname === "/post", title: "Post Treatment", subtitle: "Closeout workflows" },
  { match: (pathname) => pathname === "/records", title: "Master Records", subtitle: "Controlled patient index" }
];

function titleForPath(pathname = "") {
  return routeTitles.find((route) => route.match(pathname)) ?? {
    title: "CureRays",
    subtitle: "Clinical workflow command center"
  };
}

export function Topbar({ pathname }: { pathname?: string }) {
  const { title, subtitle } = titleForPath(pathname);

  return (
    <header className="border-b border-[#DDE6F5] bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#061A55]">
            {title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#3D5A80]">
            {subtitle}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1 md:w-[520px]" aria-label="Search patients and actions">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2B2F5F]"
              aria-hidden="true"
            />
            <input
              className="h-12 w-full rounded-lg border border-[#DDE6F5] bg-white pl-12 pr-16 text-sm font-semibold text-[#061A55] outline-none transition placeholder:text-[#3D5A80]/68 focus:border-[#0033A0]/40 focus:ring-4 focus:ring-[#0033A0]/10"
              placeholder="Search patients, MRN, tasks, forms..."
              type="search"
            />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#DDE6F5] bg-[#F5F7FB] px-2 py-1 text-xs font-bold text-[#2B2F5F] sm:inline-flex">
              ⌘ K
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              className="relative grid h-12 w-12 place-items-center rounded-full border border-[#DDE6F5] bg-white text-[#0033A0] transition hover:bg-[#F5F7FB]"
              type="button"
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#FF6620] text-[11px] font-bold text-white">
                3
              </span>
            </button>
            <span className="flex h-12 items-center gap-3 rounded-lg border border-[#DDE6F5] bg-white px-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EAF1FF] text-[#0033A0]">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold text-[#061A55]">Dr. Sarah Johnson</span>
                <span className="block text-xs font-semibold text-[#3D5A80]">Physician</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-[#0033A0] sm:block" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
