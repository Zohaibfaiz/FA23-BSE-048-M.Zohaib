import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommitteeService } from '../core/services/committee.service';
import { PaymentService } from '../core/services/payment.service';
import { SkeletonCardComponent } from '../shared/skeleton/skeleton.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonCardComponent],
  template: `
<div class="space-y-8 animate-fade-in">

  <!-- Welcome Banner -->
  <div class="glass-card p-6 md:p-8 relative overflow-hidden"
    style="background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.1) 100%)">
    <div class="absolute right-0 top-0 w-64 h-64 opacity-10"
      style="background: radial-gradient(circle, #6366f1 0%, transparent 70%)"></div>
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <p class="text-slate-400 text-sm font-medium mb-1">Good {{ timeOfDay }},</p>
        <h2 class="text-2xl md:text-3xl font-display font-bold text-white">
          {{ auth.profile()?.full_name || 'Welcome back!' }} 👋
        </h2>
        <p class="text-slate-500 text-sm mt-1">Here's your committee summary for today</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <p class="text-xl font-display font-bold gradient-text">{{ auth.profile()?.reputation_score || 0 }}</p>
          <p class="text-[10px] text-slate-500 uppercase tracking-wider">Reputation</p>
        </div>
        <a routerLink="/committees/create" class="btn-primary">+ Create Committee</a>
      </div>
    </div>
  </div>

  <!-- Stats Grid -->
  @if (loading()) {
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      @for (i of [1,2,3,4]; track i) { <app-skeleton-card></app-skeleton-card> }
    </div>
  } @else {
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      @for (stat of stats; track stat.label) {
        <div class="stat-card glass-card-hover">
          <div class="flex items-center justify-between">
            <div class="stat-icon" [style.background]="stat.bg">{{ stat.icon }}</div>
            <span class="stat-change" [class]="stat.changeDir">{{ stat.change }}</span>
          </div>
          <div>
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      }
    </div>
  }

  <!-- Main Grid -->
  <div class="grid md:grid-cols-3 gap-6">

    <!-- Recent Committees -->
    <div class="md:col-span-2 glass-card p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display font-semibold text-white">My Active Committees</h3>
        <a routerLink="/committees" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all →</a>
      </div>
      @if (committees().length === 0) {
        <div class="text-center py-10">
          <p class="text-3xl mb-3">🏦</p>
          <p class="text-slate-500 text-sm">No committees yet.</p>
          <a routerLink="/committees/create" class="btn-primary mt-4 inline-flex text-xs px-4 py-2">Create one</a>
        </div>
      }
      <div class="space-y-3">
        @for (c of committees().slice(0,4); track c.id) {
          <a [routerLink]="['/committees', c.id]"
            class="flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-primary-500/20 transition-all duration-200 group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))">🏦</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate group-hover:text-primary-300 transition-colors">{{ c.title }}</p>
              <p class="text-xs text-slate-500">{{ c.current_members }}/{{ c.max_members }} members · ₨{{ c.monthly_amount | number }}/mo</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span>
              <div class="text-slate-600 group-hover:text-primary-400 transition-colors">→</div>
            </div>
          </a>
        }
      </div>
    </div>

    <!-- Upcoming Turns & Quick Actions -->
    <div class="flex flex-col gap-6">

      <!-- Reputation Card -->
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-white mb-4">Reputation Score</h3>
        <div class="flex items-center gap-4 mb-4">
          <div class="text-4xl font-display font-bold gradient-text">{{ auth.profile()?.reputation_score || 0 }}</div>
          <div class="flex-1">
            <div class="flex gap-0.5 mb-2">
              @for (s of stars; track s) {
                <span class="text-lg" [class]="s <= starRating ? 'text-warning-500' : 'text-slate-700'">★</span>
              }
            </div>
            <p class="text-xs text-slate-500">{{ reputationLabel }}</p>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width]="(auth.profile()?.reputation_score || 0) + '%'"></div>
        </div>
        <div class="flex justify-between mt-1.5">
          <span class="text-[10px] text-slate-600">0</span>
          <span class="text-[10px] text-slate-600">100</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="glass-card p-5">
        <h3 class="font-display font-semibold text-white mb-4">Quick Actions</h3>
        <div class="space-y-2">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.route" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
              <span class="text-lg">{{ action.icon }}</span>
              <span class="text-sm text-slate-400 group-hover:text-white transition-colors">{{ action.label }}</span>
              <span class="ml-auto text-slate-600 group-hover:text-primary-400 text-xs transition-colors">→</span>
            </a>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Timeline -->
  <div class="glass-card p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-display font-semibold text-white">Recent Payments</h3>
      <a routerLink="/payments" class="text-xs text-primary-400 hover:text-primary-300">View all →</a>
    </div>
    @if (payments().length === 0) {
      <p class="text-center text-slate-600 py-8 text-sm">No payment history yet.</p>
    }
    <div class="space-y-3">
      @for (p of payments().slice(0,5); track p.id) {
        <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-colors">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            [class]="p.status === 'paid' ? 'bg-success-500/15 text-success-500' : 'bg-warning-500/15 text-warning-500'">
            {{ p.status === 'paid' ? '✓' : '⏳' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white">Month {{ p.month_number }} Payment</p>
            <p class="text-xs text-slate-500">Due {{ p.due_date | date:'mediumDate' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-white">₨{{ p.amount | number }}</p>
            <span class="badge" [class]="'badge-' + (p.status === 'paid' ? 'active' : 'pending')">{{ p.status }}</span>
          </div>
        </div>
      }
    </div>
  </div>

</div>
  `,
})
export class DashboardComponent implements OnInit {
  auth       = inject(AuthService);
  private cs = inject(CommitteeService);
  private ps = inject(PaymentService);

  loading     = signal(true);
  committees  = signal<any[]>([]);
  payments    = signal<any[]>([]);

  stars = [1,2,3,4,5];
  get starRating() { return Math.round((this.auth.profile()?.reputation_score || 0) / 20); }
  get reputationLabel() {
    const s = this.auth.profile()?.reputation_score || 0;
    if (s >= 90) return 'Excellent — Highly trusted';
    if (s >= 70) return 'Good — Reliable member';
    if (s >= 50) return 'Fair — Building trust';
    return 'New — No history yet';
  }

  get timeOfDay() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  stats: any[] = [];

  quickActions = [
    { icon: '➕', label: 'Create Committee', route: '/committees/create' },
    { icon: '🔍', label: 'Browse Committees', route: '/committees/browse' },
    { icon: '💳', label: 'Track Payments',    route: '/payments' },
    { icon: '📊', label: 'View Analytics',    route: '/analytics' },
    { icon: '🔔', label: 'Notifications',     route: '/notifications' },
  ];

  async ngOnInit() {
    try {
      const [cs, ps] = await Promise.all([
        this.cs.getMyCommittees(),
        this.ps.getMyPayments(),
      ]);
      this.committees.set(cs);
      this.payments.set(ps);
      const paid    = ps.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
      const pending = ps.filter(p => p.status === 'pending').length;
      const overdue = ps.filter(p => p.status === 'overdue').length;
      this.stats = [
        { label: 'Active Committees', value: cs.filter(c => c.status === 'active').length, icon: '🏦', bg: 'rgba(99,102,241,0.15)',  change: '+' + cs.length, changeDir: 'up' },
        { label: 'Total Saved',       value: '₨' + paid.toLocaleString(),  icon: '💰', bg: 'rgba(34,197,94,0.15)',  change: '↑', changeDir: 'up' },
        { label: 'Pending Payments',  value: pending, icon: '⏳', bg: 'rgba(245,158,11,0.15)', change: pending > 0 ? '⚠' : '✓', changeDir: pending > 0 ? 'down' : 'up' },
        { label: 'Overdue',           value: overdue, icon: '🚨', bg: 'rgba(239,68,68,0.15)',  change: overdue > 0 ? 'Action needed' : 'All clear ✓', changeDir: overdue > 0 ? 'down' : 'up' },
      ];
    } finally {
      this.loading.set(false);
    }
  }
}
