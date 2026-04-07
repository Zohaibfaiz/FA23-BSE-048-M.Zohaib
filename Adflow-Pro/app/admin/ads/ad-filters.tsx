'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const FILTERS = [
  { value: 'all', label: 'All Ads' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'payment_verified', label: 'Payment Verified' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'expired', label: 'Expired' },
  { value: 'archived', label: 'Archived' },
];

export function AdFilters({ currentFilter }: { currentFilter: string }) {
  const router = useRouter();

  const handleFilter = (value: string) => {
    const params = new URLSearchParams();
    if (value !== 'all') params.set('status', value);
    router.push(`/admin/ads${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="filter-tabs">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleFilter(f.value)}
          className={`filter-tab ${currentFilter === f.value ? 'filter-tab-active' : ''}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
