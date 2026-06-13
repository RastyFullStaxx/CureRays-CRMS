import { ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BillingCode } from "@/lib/types";

const readinessVariants: Record<BillingCode["readinessStatus"], "default" | "success" | "warning" | "error" | "info" | "primary"> = {
  READY: "success",
  NEEDS_REVIEW: "warning",
  BLOCKED: "error",
  NOT_APPLICABLE: "default"
};

export function BillingCodePanel({ codes }: { codes: BillingCode[] }) {
  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Billing and code tracking</h3>
          <p className="mt-1 text-sm text-curerays-indigo">
            UI representation only. Backend validation rules are deferred.
          </p>
        </div>
        <ReceiptText className="h-5 w-5 text-curerays-orange" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {codes.map((code) => (
          <article key={code.id} className="rounded-lg border border-white/70 bg-white/52 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold text-curerays-dark-plum">{code.code}</p>
                <p className="mt-1 text-sm font-medium leading-5 text-curerays-dark-plum/74">
                  {code.description}
                </p>
              </div>
              <Badge variant={readinessVariants[code.readinessStatus]}>
                {code.readinessStatus.replaceAll("_", " ")}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-curerays-indigo">
              <span className="rounded-lg bg-white/58 p-2">{code.frequency}</span>
              <span className="rounded-lg bg-white/58 p-2">{code.purpose.replaceAll("_", " ")}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
