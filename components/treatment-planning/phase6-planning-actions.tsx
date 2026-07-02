"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase6PlanningActionsProps = {
  courseId: string;
  disabled?: boolean;
};

export function Phase6PlanningActions({ courseId, disabled = false }: Phase6PlanningActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generateSchedule() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/igsrt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-curerays-role": "RAD_ONC"
        },
        body: JSON.stringify({
          action: "generateFractionSchedule",
          data: { courseId }
        })
      });

      if (!response.ok) {
        setMessage("Schedule not ready");
        return;
      }

      setMessage("Schedule generated");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" disabled={disabled || pending} onClick={generateSchedule}>
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
        {pending ? "Generating" : "Generate Schedule"}
      </Button>
      {message ? <span className="type-supporting text-[var(--color-text-muted)]">{message}</span> : null}
    </div>
  );
}
