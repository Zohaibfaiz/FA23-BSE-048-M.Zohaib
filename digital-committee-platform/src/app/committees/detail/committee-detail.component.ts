import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommitteeService } from '../../core/services/committee.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Committee, CommitteeMember, JoinRequest, Payment } from '../../core/models';

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  template: `
<div class="animate-fade-in space-y-6">
  @if (loading()) {
    <div class="flex items-center justify-center py-20">
      <div class="spinner w-8 h-8"></div>
    </div>
  } @else if (!committee()) {
    <div class="text-center py-20">
      <p class="text-4xl mb-4">🏦</p>
      <p class="text-slate-400">Committee not found.</p>
      <a routerLink="/committees" class="btn-primary mt-4 inline-flex">Back to Committees</a>
    </div>
  } @else {
    <!-- Header -->
    <div class="glass-card p-6 md:p-8 relative overflow-hidden"
      style="background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.05))">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="badge" [class]="'badge-' + committee()!.status">{{ committee()!.status }}</span>
            @if (isCreator()) { <span class="badge bg-warning-500/20 text-warning-500">👑 Creator</span> }
          </div>
          <h2 class="text-2xl font-display font-bold text-white mb-1">{{ committee()!.title }}</h2>
          <p class="text-slate-400 text-sm">{{ committee()!.description }}</p>
        </div>
        @if (isCreator()) {
          <div class="flex gap-2 flex-shrink-0">
            @if (committee()!.status === 'pending') {
              <button (click)="activate()" class="btn-primary text-sm">▶ Activate</button>
            }
            @if (committee()!.status === 'active') {
              <button (click)="generatePayments()" class="btn-secondary text-sm">+ Generate Payments</button>
            }
          </div>
        }
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        @for (s of committeeStats; track s.label) {
          <div class="text-center p-3 rounded-xl bg-white/5">
            <p class="text-lg font-display font-bold text-white">{{ s.value }}</p>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider">{{ s.label }}</p>
          </div>
        }
      </div>

      <!-- Progress -->
      <div class="mt-6">
        <div class="flex justify-between text-sm mb-2">
          <span class="text-slate-400">Committee Progress</span>
          <span class="text-primary-400 font-semibold">{{ progress() }}%</span>
        </div>
        <div class="progress-bar h-3">
          <div class="progress-fill" [style.width]="progress() + '%'"></div>
        </div>
        <p class="text-xs text-slate-600 mt-1">Month {{ committee()!.current_month }} of {{ committee()!.duration_months }}</p>
      </div>
    </div>

    <!-- Join Requests (creator only) -->
    @if (isCreator() && joinRequests().length > 0) {
      <div class="glass-card p-6">
        <h3 class="font-display font-semibold text-white mb-4 flex items-center gap-2">
          🔔 Join Requests
          <span class="badge bg-warning-500/20 text-warning-500">{{ joinRequests().length }}</span>
        </h3>
        <div class="space-y-3">
          @for (req of joinRequests(); track req.id) {
            <div class="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
              <app-avatar [name]="req['profile']?.full_name || 'U'" size="sm"></app-avatar>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white">{{ req['profile']?.full_name }}</p>
                <p class="text-xs text-slate-500">{{ req['profile']?.email }}</p>
                @if (req.message) { <p class="text-xs text-slate-400 mt-1">{{ req.message }}</p> }
              </div>
              <div class="flex gap-2">
                <button (click)="approve(req)" class="btn-primary text-xs px-3 py-1.5">✓ Approve</button>
                <button (click)="reject(req)" class="btn-danger text-xs px-3 py-1.5">✕ Reject</button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Members Grid -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display font-semibold text-white">
          👥 Members
          <span class="text-slate-500 font-normal text-sm ml-2">({{ members().length }}/{{ committee()!.max_members }})</span>
        </h3>
      </div>
      <div class="grid md:grid-cols-2 gap-3">
        @for (m of members(); track m.id) {
          <div class="flex items-center gap-3 p-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors group">
            <div class="relative flex-shrink-0">
              <app-avatar [src]="m['profile']?.avatar_url || ''" [name]="m['profile']?.full_name || 'U'" size="md"></app-avatar>
              @if (m.turn_number === committee()!.current_month) {
                <span class="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-surface-800 flex items-center justify-center text-[8px]">★</span>
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ m['profile']?.full_name }}</p>
              <p class="text-[10px] text-slate-500">Turn #{{ m.turn_number }} · {{ m.status }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-white">₨{{ m.total_paid | number }}</p>
              <p class="text-[10px] text-slate-600">paid</p>
            </div>
            @if (isCreator() && m.user_id !== auth.currentUser()?.id) {
              <button (click)="removeMember(m)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-danger-500 hover:text-danger-400 ml-2 text-xs">✕</button>
            }
          </div>
        }
      </div>
    </div>

    <!-- Recent Payments -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display font-semibold text-white">💳 Payment History</h3>
        <a [routerLink]="['/payments', committee()!.id]" class="text-xs text-primary-400 hover:text-primary-300">Full tracker →</a>
      </div>
      @if (payments().length === 0) {
        <p class="text-center text-slate-600 py-6 text-sm">No payments generated yet.</p>
      }
      <div class="space-y-2">
        @for (p of payments().slice(0,8); track p.id) {
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/3 transition-colors">
            <span class="text-lg">{{ getPaymentIcon(p.status) }}</span>
            <div class="flex-1">
              <p class="text-sm text-white">Month {{ p.month_number }}</p>
              <p class="text-xs text-slate-500">Due {{ p.due_date | date:'mediumDate' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-white">₨{{ p.amount | number }}</p>
              <span class="badge" [class]="getPaymentBadge(p.status)">{{ p.status }}</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Rules -->
    @if (committee()!.rules) {
      <div class="glass-card p-6">
        <h3 class="font-display font-semibold text-white mb-3">📜 Committee Rules</h3>
        <p class="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{{ committee()!.rules }}</p>
      </div>
    }
  }
</div>
  `,
})
export class CommitteeDetailComponent implements OnInit {
  private cs    = inject(CommitteeService);
  private ps    = inject(PaymentService);
  private toast = inject(ToastService);
  auth          = inject(AuthService);
  private route = inject(ActivatedRoute);

  loading      = signal(true);
  committee    = signal<Committee | null>(null);
  members      = signal<CommitteeMember[]>([]);
  joinRequests = signal<JoinRequest[]>([]);
  payments     = signal<Payment[]>([]);

  isCreator() { return this.committee()?.creator_id === this.auth.currentUser()?.id; }

  get progress() {
    return signal(this.committee()
      ? Math.round((this.committee()!.current_month / this.committee()!.duration_months) * 100)
      : 0);
  }

  get committeeStats() {
    const c = this.committee();
    if (!c) return [];
    return [
      { label: 'Monthly',    value: '₨' + c.monthly_amount.toLocaleString() },
      { label: 'Total Pool', value: '₨' + (c.monthly_amount * c.max_members * c.duration_months).toLocaleString() },
      { label: 'Members',    value: c.current_members + '/' + c.max_members },
      { label: 'Start Date', value: new Date(c.start_date).toLocaleDateString('en-PK') },
    ];
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const [c, m, jr, p] = await Promise.all([
        this.cs.getById(id),
        this.cs.getMembers(id),
        await this.isCreatorById(id) ? await this.cs.getJoinRequests(id) : [],
        this.ps.getCommitteePayments(id),
      ]);
      this.committee.set(c);
      this.members.set(m);
      this.joinRequests.set(jr);
      this.payments.set(p);
    } finally { this.loading.set(false); }
  }

  private async isCreatorById(id: string): Promise<boolean> {
    // We'll check after load, return [] for now
    return true;
  }

  async approve(req: JoinRequest) {
    try {
      await this.cs.approveJoin(req.id, req.committee_id, req.user_id);
      this.joinRequests.update(rs => rs.filter(r => r.id !== req.id));
      this.toast.success('Approved!', 'Member added to committee.');
      this.members.set(await this.cs.getMembers(this.committee()!.id));
    } catch (e: any) { this.toast.error('Failed', e.message); }
  }

  async reject(req: JoinRequest) {
    try {
      await this.cs.rejectJoin(req.id);
      this.joinRequests.update(rs => rs.filter(r => r.id !== req.id));
      this.toast.info('Rejected', 'Join request declined.');
    } catch (e: any) { this.toast.error('Failed', e.message); }
  }

  async removeMember(m: CommitteeMember) {
    if (!confirm('Remove this member?')) return;
    try {
      await this.cs.removeMember(m.id);
      this.members.update(ms => ms.filter(x => x.id !== m.id));
      this.toast.success('Member removed');
    } catch (e: any) { this.toast.error('Failed', e.message); }
  }

  async activate() {
    try {
      await this.cs.update(this.committee()!.id, { status: 'active' });
      this.committee.update(c => ({ ...c!, status: 'active' }));
      this.toast.success('Committee activated!');
    } catch (e: any) { this.toast.error('Failed', e.message); }
  }

  async generatePayments() {
    const c = this.committee()!;
    const nextMonth = c.current_month + 1;
    const due = new Date(c.start_date);
    due.setMonth(due.getMonth() + nextMonth - 1);
    try {
      await this.ps.generateMonthlyPayments(c.id, nextMonth, due.toISOString().split('T')[0]);
      await this.cs.update(c.id, { current_month: nextMonth });
      this.toast.success('Payments generated!', `Month ${nextMonth} payments created.`);
    } catch (e: any) { this.toast.error('Failed', e.message); }
  }

  getPaymentIcon(s: string) { return { paid: '✅', pending: '⏳', overdue: '🚨', waived: '✓' }[s] || '⏳'; }
  getPaymentBadge(s: string) { return { paid: 'badge-active', pending: 'badge-pending', overdue: 'badge-overdue' }[s] || 'badge-pending'; }
}
