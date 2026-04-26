export function ProgressBar({
  value,
  label
}: {
  value: number;
  label?: string;
}) {
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-curerays-indigo">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <div className="h-2 rounded-full bg-curerays-light-indigo/18">
        <div
          className="h-full rounded-full bg-gradient-to-r from-curerays-orange via-curerays-amber to-curerays-blue"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
