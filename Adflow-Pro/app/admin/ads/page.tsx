export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { FileText, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/status-pill';
import { getAdminAllAdsData } from '@/lib/dashboard';
import { AdFilters } from './ad-filters';

export default async function AdminAdsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams.status || 'all';
  const ads = await getAdminAllAdsData(statusFilter === 'all' ? undefined : statusFilter);

  return (
    <>
      <div className="page-title-bar">
        <h1>Ads Management</h1>
        <p>View and manage all ads across the marketplace.</p>
      </div>

      <div className="mb-6">
        <AdFilters currentFilter={statusFilter} />
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-0 overflow-x-auto">
          {ads.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Views</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad: any) => (
                  <tr key={ad.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900 truncate max-w-[200px]">
                          {ad.title}
                        </span>
                      </div>
                    </td>
                    <td className="text-slate-600 text-sm">
                      {ad.user?.full_name || ad.user?.email || '—'}
                    </td>
                    <td>
                      <StatusPill status={ad.status} />
                    </td>
                    <td className="text-slate-600 text-sm">{ad.category?.name || '—'}</td>
                    <td className="text-slate-600 text-sm">{ad.city?.name || '—'}</td>
                    <td className="text-slate-600 text-sm">{ad.view_count}</td>
                    <td className="text-slate-500 text-sm">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state m-6">
              <Inbox className="h-10 w-10 text-slate-400" />
              <h3>No ads found</h3>
              <p>No ads match the selected filter.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
