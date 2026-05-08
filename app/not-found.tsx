import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="glass-panel rounded-glass p-6">
      <div className="flex max-w-2xl items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-curerays-orange/10 text-curerays-orange">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase text-curerays-orange">Not found</p>
          <h1 className="mt-2 text-3xl font-semibold text-curerays-dark-plum">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-curerays-indigo">
            This workspace route is not available. Return to the command center or use the module navigation.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-lg bg-curerays-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
