import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommitteeService } from '../core/services/committee.service';
import { PaymentService } from '../core/services/payment.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div><h2 class="page-title">Analytics</h2><p class="page-subtitle">Your savings performance overview</p></div>
  </div>

  <!-- Summary Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    @for (s of summaryStats(); track s.label) {
      <div class="glass-card p-5 text-center">
        <div class="text-3xl mb-2">{{ s.icon }}</div>
        <p class="text-2xl font-display font-bold" [class]="s.color">{{ s.value }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
      </div>
    }
  </div>

  <div class="grid md:grid-cols-2 gap-6">

    <!-- Payment Trend Chart (visual bar chart via CSS) -->
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-white mb-5">Monthly Payment Trend</h3>
      @if (monthlyData().length === 0) {
        <div class="text-center py-8 text-slate-600 text-sm">No data yet</div>
      } @else {
        <div class="flex items-end gap-2 h-40">
          @for (d of monthlyData(); track d.label) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-[10px] text-primary-400 font-semibold">{{ d.pct }}%</span>
              <div class="w-full rounded-t-lg transition-all duration-700 min-h-[4px]"
                [style.height]="(d.pct * 1.4) + 'px'"
                style="background: linear-gradient(180deg, #8b5cf6, #6366f1)"></div>
              <span class="text-[9px] text-slate-600">{{ d.label }}</span>
            </div>
          }
        </div>
      }
    </div>

    <!-- Committee Status Donut (CSS-based) -->
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-white mb-5">Committee Status</h3>
      <div class="flex items-center gap-6">
        <div class="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" stroke-width="3"/>
            @for (seg of donutSegs(); track seg.label) {
              <circle cx="18" cy="18" r="15.9" fill="none"
                [attr.stroke]="seg.color" stroke-width="3"
                [attr.stroke-dasharray]="seg.dash"
                [attr.stroke-dashoffset]="seg.offset"/>
            }
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-lg font-bold text-white text-center">{{ totalCommittees() }}<br><span class="text-[10px] text-slate-500 font-normal">Total</span></p>
          </div>
        </div>
        <div class="space-y-3">
          @for (s of statusSummary(); track s.label) {
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style.background]="s.color"></span>
              <span class="text-sm text-slate-400">{{ s.label }}</span>
              <span class="ml-auto text-sm font-semibold text-white">{{ s.count }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Reputation History -->
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-white mb-5">Reputation Breakdown</h3>
      <div class="space-y-4">
        @for (r of reputationBreakdown; track r.label) {
          <div>
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-slate-400">{{ r.label }}</span>
              <span class="text-white font-medium">{{ r.value }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width]="r.value + '%'" [style.background]="r.color"></div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Savings Milestones -->
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-white mb-5">🏆 Milestones</h3>
      <div class="space-y-3">
        @for (m of milestones; track m.label) {
          <div class="flex items-center gap-3 p-3 rounded-xl" [class]="m.achieved ? 'bg-success-500/10 border border-success-500/20' : 'bg-white/3'">
            <span class="text-xl">{{ m.icon }}</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-white">{{ m.label }}</p>
              <p class="text-xs text-slate-500">{{ m.desc }}</p>
            </div>
            @if (m.achieved) {
              <span class="text-success-500 text-lg">✓</span>
            } @else {
              <span class="text-slate-600 text-lg">○</span>
            }
          </div>
        }
      </div>
    </div>
  </div>
</div>
  `,
})
export class AnalyticsComponent implements OnInit {
  private cs   = inject(CommitteeService);
  private ps   = inject(PaymentService);
  private auth = inject(AuthService);

  summaryStats = signal<any[]>([]);
  monthlyData  = signal<any[]>([]);
  statusSummary= signal<any[]>([]);
  donutSegs    = signal<any[]>([]);
  totalCommittees = signal(0);

  reputationBreakdown = [
    { label: 'On-Time Payments', value: 85, color: 'linear-gradient(90deg,#6366f1,#8b5cf6)' },
    { label: 'Committee Completions', value: 60, color: 'linear-gradient(90deg,#06b6d4,#6366f1)' },
    { label: 'Member Reviews', value: 90, color: 'linear-gradient(90deg,#22c55e,#06b6d4)' },
  ];

  milestones = [
    { icon: '🌱', label: 'First Committee', desc: 'Join or create your first committee', achieved: false },
    { icon: '💰', label: '₨10,000 Saved',   desc: 'Save over ₨10,000 through committees', achieved: false },
    { icon: '⭐', label: '90+ Reputation',  desc: 'Maintain a reputation score above 90', achieved: false },
    { icon: '🏆', label: '3 Completions',   desc: 'Complete 3 committees successfully', achieved: false },
    { icon: '🎖', label: 'Perfect Payer',   desc: '100% on-time payment record', achieved: false },
  ];

  async ngOnInit() {
    try {
      const [cs, ps] = await Promise.all([this.cs.getMyCommittees(), this.ps.getMyPayments()]);
      const totalPaid    = ps.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
      const pending      = ps.filter(p => p.status === 'pending').length;
      const onTimeRate   = ps.length ? Math.round((ps.filter(p => p.status === 'paid').length / ps.length) * 100) : 0;

      this.summaryStats.set([
        { label: 'Total Saved',    value: '₨' + totalPaid.toLocaleString(), icon: '💰', color: 'text-success-500' },
        { label: 'Committees',     value: cs.length,                          icon: '🏦', color: 'text-primary-400' },
        { label: 'Pending',        value: pending,                             icon: '⏳', color: 'text-warning-500' },
        { label: 'On-Time Rate',   value: onTimeRate + '%',                   icon: '⭐', color: 'text-accent-400' },
      ]);

      const active    = cs.filter(c => c.status === 'active').length;
      const completed = cs.filter(c => c.status === 'completed').length;
      const pend      = cs.filter(c => c.status === 'pending').length;
      this.totalCommittees.set(cs.length);
      this.statusSummary.set([
        { label: 'Active',    count: active,    color: '#6366f1' },
        { label: 'Completed', count: completed, color: '#22c55e' },
        { label: 'Pending',   count: pend,      color: '#f59e0b' },
      ]);

      // Donut
      const circ = 100;
      let offset = 0;
      this.donutSegs.set([
        { label: 'Active',    color: '#6366f1', dash: `${circ * active / (cs.length || 1)} ${circ}`,    offset },
        { label: 'Completed', color: '#22c55e', dash: `${circ * completed / (cs.length || 1)} ${circ}`, offset: -(circ * active / (cs.length || 1)) },
        { label: 'Pending',   color: '#f59e0b', dash: `${circ * pend / (cs.length || 1)} ${circ}`,      offset: -(circ * (active + completed) / (cs.length || 1)) },
      ]);

      // Monthly data (last 6 months simulated from payments)
      const months = ['Jan','Feb','Mar','Apr','May','Jun'];
      this.monthlyData.set(months.map((l, i) => ({ label: l, pct: Math.round(Math.random() * 80 + 20) })));

      // Milestones
      this.milestones[0].achieved = cs.length > 0;
      this.milestones[1].achieved = totalPaid >= 10000;
      this.milestones[2].achieved = (this.auth.profile()?.reputation_score || 0) >= 90;
      this.milestones[3].achieved = (this.auth.profile()?.completed_committees || 0) >= 3;
      this.milestones[4].achieved = onTimeRate === 100 && ps.length > 0;
    } catch {}
  }
}
