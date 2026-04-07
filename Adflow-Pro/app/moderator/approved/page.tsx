export const dynamic = 'force-dynamic';

import { CheckCircle2, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from '@/components/status-pill';
import { getModeratorApprovedAdsData } from '@/lib/dashboard';

export default async function ModeratorApprovedPage() {
  const ads = await getModeratorApprovedAdsData();

  return (
    <>
      <div className="page-title-bar">
        <h1>Approved Ads</h1>
        <p>Ads that have been approved and are progressing through the workflow.</p>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-medium text-slate-700">{ads.length} approved ads</p>
          </div>

          {ads.length > 0 ? (
            <div className="space-y-4">
              {ads.map((ad: any) => (
                <div key={ad.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{ad.title}</h3>
                        <StatusPill status={ad.status} />
                      </div>
                      <p className="text-sm text-slate-600">
                        {ad.user?.full_name || ad.user?.email} • {ad.category?.name} • {ad.city?.name}
                      </p>
                      {ad.moderation_notes && (
                        <p className="text-sm text-slate-500 italic">
                          Note: {ad.moderation_notes}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Updated {new Date(ad.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Inbox className="h-10 w-10 text-slate-400" />
              <h3>No approved ads yet</h3>
              <p>Approved ads will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
