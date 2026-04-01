'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminScheduleForm({ adId }: { adId: string }) {
  const router = useRouter();
  const defaultValue = useMemo(() => {
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    return nextHour.toISOString().slice(0, 16);
  }, []);

  const [publishAt, setPublishAt] = useState(defaultValue);
  const [adminBoost, setAdminBoost] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ads/${adId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publish_at: new Date(publishAt).toISOString(),
          admin_boost: Number(adminBoost),
          is_featured: isFeatured,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to schedule ad');
      }
      toast.success('Ad publishing plan saved');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to schedule ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
      <div className="space-y-2">
        <Label htmlFor={`publish-at-${adId}`}>Publish at</Label>
        <Input id={`publish-at-${adId}`} type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`boost-${adId}`}>Admin boost</Label>
        <Input id={`boost-${adId}`} type="number" min="0" max="100" value={adminBoost} onChange={(e) => setAdminBoost(e.target.value)} />
      </div>
      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        Mark as featured listing
      </label>
      <Button type="submit" disabled={loading} className="w-full rounded-full bg-orange-500 text-slate-950 hover:bg-orange-400">
        {loading ? 'Saving...' : 'Schedule / Publish'}
      </Button>
    </form>
  );
}
