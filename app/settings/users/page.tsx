import { LockKeyhole, Settings, ShieldCheck, UserRoundCog } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const roles = [
  "Virtual Assistant",
  "Medical Assistant",
  "Therapist",
  "NP / PA",
  "Doctor PCP",
  "Rad Onc",
  "Physicist",
  "Admin"
];

export default function UsersSettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Access model"
        title="Users and Roles"
        description="Frontend placeholder for role-based access, secure session cues, and permission-aware workflow actions."
        icon={Settings}
        stat="RBAC"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <article key={role} className="glass-panel rounded-glass p-5">
            <UserRoundCog className="h-5 w-5 text-curerays-blue" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-curerays-dark-plum">{role}</h2>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              Placeholder role for task queues, document review, signatures, and audit visibility.
            </p>
          </article>
        ))}
      </section>
      <section className="glass-panel rounded-glass p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-curerays-blue" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-curerays-dark-plum">Security posture</h2>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              Real authentication is not implemented in this frontend phase. The UI is prepared for
              backend-enforced RBAC, audit logging, and restricted actions.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-curerays-dark-plum/20 px-4 py-2 text-sm font-semibold text-curerays-dark-plum/60"
        >
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Invite user requires backend auth
        </button>
      </section>
    </div>
  );
}
