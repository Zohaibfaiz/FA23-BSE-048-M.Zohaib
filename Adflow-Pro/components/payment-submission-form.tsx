'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { submitPaymentAction } from '@/app/dashboard/ads/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PaymentSubmissionForm({ adId }: { adId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [transactionRef, setTransactionRef] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await submitPaymentAction({
        adId,
        transactionRef,
        proofUrl,
        notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Payment submitted for verification');
      setTransactionRef('');
      setProofUrl('');
      setNotes('');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transaction_ref">Transaction Reference</Label>
        <Input id="transaction_ref" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proof_url">Payment Screenshot URL</Label>
        <Input id="proof_url" type="url" placeholder="https://..." value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note for finance team" />
      </div>
      <Button type="submit" disabled={isPending} className="w-full rounded-full">
        {isPending ? 'Submitting...' : 'Submit Payment'}
      </Button>
    </form>
  );
}
