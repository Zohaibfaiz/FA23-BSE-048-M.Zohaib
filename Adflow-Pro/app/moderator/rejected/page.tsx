export const dynamic = 'force-dynamic';

import { XCircle, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getModeratorRejectedAdsData } from '@/lib/dashboard';

export default async function ModeratorRejectedPage() {
  const ads = await getModeratorRejectedAdsData();

  return (
    <>
      <div className="page-title-bar">
        <h1>Rejected Ads</h1>
        <p>Ads that were rejected during moderation.</p>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <XCircle className="h-5 w-5 text-rose-500" />
            <p className="text-sm font-medium text-slate-700">{ads.length} rejected ads</p>
          </div>

          {ads.length > 0 ? (
            <div className="space-y-4">
              {ads.map((ad: any) => (
                <div key={ad.id} className="rounded-[1.5rem] border border-red-100 bg-red-50/40 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">{ad.title}</h3>
                      <p className="text-sm text-slate-600">
                        {ad.user?.full_name || ad.user?.email} • {ad.category?.name} • {ad.city?.name}
                      </p>
                      {ad.rejection_reason && (
                        <div className="rounded-xl bg-red-100/50 border border-red-200/60 px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-red-600 mb-1">Rejection Reason</p>
                          <p className="text-sm text-red-800">{ad.rejection_reason}</p>
                        </div>
                      )}
                      {ad.moderation_notes && (
                        <p className="text-sm text-slate-500 italic">
                          Notes: {ad.moderation_notes}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ad.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Inbox className="h-10 w-10 text-slate-400" />
              <h3>No rejected ads</h3>
              <p>Rejected ads with their reasons will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
