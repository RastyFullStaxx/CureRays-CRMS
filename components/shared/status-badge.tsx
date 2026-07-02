import { statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';
import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusTone(status)} className={className}>
      {formatUiLabel(status)}
    </Badge>
  );
}
