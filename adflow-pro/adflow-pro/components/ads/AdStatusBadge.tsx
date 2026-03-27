// components/ads/AdStatusBadge.tsx
import type { AdStatus } from '@/types';

const STATUS_CONFIG: Record<AdStatus, { label: string; className: string }> = {
  draft:             { label: 'Draft',            className: 'badge-draft' },
  submitted:         { label: 'Submitted',        className: 'badge-review' },
  under_review:      { label: 'Under Review',     className: 'badge-review' },
  payment_pending:   { label: 'Payment Pending',  className: 'badge-pending' },
  payment_submitted: { label: 'Payment Submitted',className: 'badge-pending' },
  payment_verified:  { label: 'Payment Verified', className: 'badge-published' },
  scheduled:         { label: 'Scheduled',        className: 'badge-review' },
  published:         { label: 'Published',        className: 'badge-published' },
  expired:           { label: 'Expired',          className: 'badge-expired' },
  archived:          { label: 'Archived',         className: 'badge-draft' },
};

export default function AdStatusBadge({ status }: { status: AdStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'badge-draft' };
  return (
    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
