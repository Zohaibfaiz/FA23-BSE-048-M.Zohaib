import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { CommitteeService } from '../../core/services/committee.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div>
      <h2 class="page-title">Payment Tracker</h2>
      <p class="page-subtitle">{{ committee()?.title }}</p>
    </div>
    <a routerLink="/payments" class="btn-secondary">← Back</a>
  </div>

  @if (loading()) {
    <div class="flex items-center justify-center py-20"><div class="spinner w-8 h-8"></div></div>
  } @else {
    <!-- Payment Grid -->
    <div class="glass-card overflow-auto">
      <div class="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 class="font-semibold text-white">Monthly Payment Matrix</h3>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-success-500"></span> Paid</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-warning-500"></span> Pending</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-danger-500"></span> Overdue</span>
        </div>
      </div>
      <div class="p-4 overflow-x-auto">
        <table class="data-table min-w-full">
          <thead>
            <tr>
              <th>Member</th>
              @for (m of months; track m) {
                <th class="text-center">Month {{ m }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (member of members(); track member.id) {
              <tr>
                <td>
                  <div class="flex items-center gap-2">
                    <app-avatar [name]="member['profile']?.full_name || 'U'" size="xs"></app-avatar>
                    <span class="text-xs font-medium text-white">{{ member['profile']?.full_name }}</span>
                  </div>
                </td>
                @for (m of months; track m) {
                  <td class="text-center">
                    <span class="w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold"
                      [class]="getCellClass(member.id, m)">
                      {{ getCellIcon(member.id, m) }}
                    </span>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Stats -->
    <div class="grid md:grid-cols-3 gap-5 mt-6">
      @for (s of payStats(); track s.label) {
        <div class="glass-card p-5 text-center">
          <p class="text-2xl font-display font-bold" [class]="s.color">{{ s.value }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class PaymentDetailComponent implements OnInit {
  private ps    = inject(PaymentService);
  private cs    = inject(CommitteeService);
  private route = inject(ActivatedRoute);
  auth          = inject(AuthService);

  loading    = signal(true);
  payments   = signal<any[]>([]);
  members    = signal<any[]>([]);
  committee  = signal<any>(null);
  payStats   = signal<any[]>([]);
  months: number[] = [];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('committeeId')!;
    try {
      const [c, m, p] = await Promise.all([
        this.cs.getById(id), this.cs.getMembers(id), this.ps.getCommitteePayments(id)
      ]);
      this.committee.set(c);
      this.members.set(m);
      this.payments.set(p);
      this.months = Array.from({ length: c?.duration_months || 0 }, (_, i) => i + 1);
      const paid    = p.filter((x: any) => x.status === 'paid').reduce((s: number, x: any) => s + x.amount, 0);
      const pending = p.filter((x: any) => x.status === 'pending').length;
      const overdue = p.filter((x: any) => x.status === 'overdue').length;
      this.payStats.set([
        { label: 'Total Collected', value: '₨' + paid.toLocaleString(), color: 'text-success-500' },
        { label: 'Pending',         value: pending,                       color: 'text-warning-500' },
        { label: 'Overdue',         value: overdue,                       color: 'text-danger-500' },
      ]);
    } finally { this.loading.set(false); }
  }

  getPayment(memberId: string, month: number) {
    return this.payments().find((p: any) => p.member_id === memberId && p.month_number === month);
  }

  getCellClass(memberId: string, month: number) {
    const p = this.getPayment(memberId, month);
    if (!p) return 'bg-surface-700 text-slate-600';
    const map: Record<string, string> = { paid: 'bg-success-500/20 text-success-500', pending: 'bg-warning-500/20 text-warning-500', overdue: 'bg-danger-500/20 text-danger-500' };
    return map[p.status] || 'bg-surface-700';
  }

  getCellIcon(memberId: string, month: number) {
    const p = this.getPayment(memberId, month);
    if (!p) return '–';
    const map: Record<string, string> = { paid: '✓', pending: '○', overdue: '!' };
    return map[p.status] || '?';
  }
}
