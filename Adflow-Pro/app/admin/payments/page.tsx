export const dynamic = 'force-dynamic';

import { CreditCard, DollarSign, Clock3, CheckCircle2, XCircle, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getAdminAllPaymentsData } from '@/lib/dashboard';
import { formatCurrency } from '@/lib/utils';

export default async function AdminPaymentsPage() {
  const payments = await getAdminAllPaymentsData();

  const verified = payments.filter((p: any) => p.status === 'verified');
  const pending = payments.filter((p: any) => p.status === 'pending');
  const submitted = payments.filter((p: any) => p.status === 'submitted');
  const rejected = payments.filter((p: any) => p.status === 'rejected');

  const totalRevenue = verified.reduce(
    (sum: number, p: any) => sum + (typeof p.amount === 'number' ? p.amount : Number(p.amount ?? 0)),
    0
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <>
      <div className="page-title-bar">
        <h1>Payments</h1>
        <p>View all payments and revenue overview.</p>
      </div>

      <div className="stat-card-grid mb-6">
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Awaiting Verification</p>
            <Clock3 className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{submitted.length}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Verified</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{verified.length}</p>
        </div>
        <div className="surface-card rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-950">{rejected.length}</p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <CardContent className="p-0 overflow-x-auto">
          {payments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>User</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Ref</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="font-medium text-slate-900 truncate max-w-[180px]">
                      {payment.ad?.title || '—'}
                    </td>
                    <td className="text-slate-600 text-sm">
                      {payment.user?.full_name || payment.user?.email || '—'}
                    </td>
                    <td className="text-slate-600 text-sm">
                      {payment.package?.name || '—'}
                    </td>
                    <td className="font-medium text-slate-900">
                      {formatCurrency(Number(payment.amount ?? 0))}
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs font-mono">
                      {payment.transaction_ref || '—'}
                    </td>
                    <td className="text-slate-500 text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state m-6">
              <Inbox className="h-10 w-10 text-slate-400" />
              <h3>No payments yet</h3>
              <p>Payments will appear here once users submit them.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
