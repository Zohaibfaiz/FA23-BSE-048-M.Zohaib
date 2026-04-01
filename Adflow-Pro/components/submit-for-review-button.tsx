'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { submitAdForReviewAction } from '@/app/dashboard/ads/actions';
import { Button } from '@/components/ui/button';

export function SubmitForReviewButton({ adId }: { adId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await submitAdForReviewAction(adId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Ad submitted for moderation');
      router.refresh();
    });
  };

  return (
    <Button onClick={handleSubmit} disabled={isPending} className="w-full rounded-full bg-orange-500 text-slate-950 hover:bg-orange-400">
      {isPending ? 'Submitting...' : 'Submit For Review'}
    </Button>
  );
}
