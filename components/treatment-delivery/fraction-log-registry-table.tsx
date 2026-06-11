"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import type { FractionLogRegistryRow } from "@/lib/services/fraction-log-registry-service";
import { formatDate } from "@/lib/workflow";

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status: string): "default" | "success" | "warning" | "error" | "info" | "primary" {
  if (["APPROVED", "SIGNED", "EXPORTED", "COMPLETED"].includes(status)) {
    return "success";
  }

  if (["REVISION_NEEDED", "MISSING", "VOIDED"].includes(status)) {
    return "error";
  }

  if (["NEEDS_REVIEW", "READY_FOR_REVIEW", "PENDING"].includes(status)) {
    return "warning";
  }

  return "default";
}

function approvalBadge(state: string) {
  return <Badge variant={statusVariant(state)}>{label(state)}</Badge>;
}

export function FractionLogRegistryTable({ rows }: { rows: FractionLogRegistryRow[] }) {
  return (
    <DataTable
      keyField="id"
      columns={[
        {
          key: "patientRef",
          label: "Patient Ref",
          render: (row) => <span className="font-bold text-[var(--color-text)]">{row.patientRef}</span>
        },
        {
          key: "courseRef",
          label: "Course Ref",
          render: (row) => <span className="font-bold text-[var(--color-primary)]">{row.courseRef}</span>
        },
        {
          key: "fractionNumber",
          label: "Fx",
          width: "72px",
          render: (row) => <span className="font-bold">Fx {row.fractionNumber}</span>
        },
        { key: "date", label: "Date", render: (row) => formatDate(row.date) },
        { key: "phase", label: "Phase" },
        { key: "doseCgy", label: "Dose", render: (row) => `${row.doseCgy.toLocaleString()} cGy` },
        { key: "cumulativeDoseCgy", label: "Cumulative", render: (row) => `${row.cumulativeDoseCgy.toLocaleString()} cGy` },
        { key: "dotApprovalState", label: "DOT", render: (row) => approvalBadge(row.dotApprovalState) },
        { key: "mdApprovalState", label: "MD", render: (row) => approvalBadge(row.mdApprovalState) },
        {
          key: "status",
          label: "Status",
          render: (row) => <Badge variant={statusVariant(row.status)}>{label(row.status)}</Badge>
        },
        {
          key: "document",
          label: "Document",
          render: (row) => <Badge variant={statusVariant(row.document)}>{label(row.document)}</Badge>
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <Link href={row.href}>
              <Button type="button" size="sm" variant="secondary">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Open
              </Button>
            </Link>
          )
        }
      ]}
      rows={rows}
      pageSize={12}
      empty="No active fraction rows."
      search={{
        placeholder: "Search patient ref, course ref, fraction, tech, status...",
        getText: (row) => [
          row.patientRef,
          row.courseRef,
          row.fractionNumber,
          row.phase,
          row.technicianInitials,
          row.review,
          row.status,
          row.document
        ].join(" ")
      }}
      filters={[
        { id: "review", label: "Review", getValue: (row) => row.review },
        { id: "status", label: "Status", getValue: (row) => label(row.status) },
        { id: "courseRef", label: "Course", getValue: (row) => row.courseRef },
        { id: "document", label: "Document", getValue: (row) => label(row.document) }
      ]}
      toolbarPrefix={
        <Badge variant={rows.some((row) => row.review !== "Clear") ? "warning" : "success"}>
          {rows.filter((row) => row.review !== "Clear").length} Review
        </Badge>
      }
    />
  );
}
