import { Badge } from '@/components/ui/badge';
import { AD_STATUS_COLORS, AD_STATUS_LABELS, type AdStatus } from '@/lib/types';

export function StatusPill({ status }: { status: AdStatus }) {
  return (
    <Badge className={`rounded-full border-0 px-3 py-1 ${AD_STATUS_COLORS[status]}`}>
      {AD_STATUS_LABELS[status]}
    </Badge>
  );
}
