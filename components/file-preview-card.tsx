import { ExternalLink, FileText } from "lucide-react";

export function FilePreviewCard({
  title,
  description,
  href
}: {
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/46 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-curerays-blue/10 text-curerays-blue">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h4 className="font-semibold text-curerays-dark-plum">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-curerays-indigo">{description}</p>
          {href ? (
            <a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-curerays-blue" href={href}>
              Open source file
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
