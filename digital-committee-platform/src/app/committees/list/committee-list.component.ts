import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommitteeService } from '../../core/services/committee.service';
import { AuthService } from '../../core/services/auth.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { SkeletonCardComponent } from '../../shared/skeleton/skeleton.component';
import { Committee } from '../../core/models';

@Component({
  selector: 'app-committee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent, SkeletonCardComponent],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div>
      <h2 class="page-title">My Committees</h2>
      <p class="page-subtitle">Committees you created or joined</p>
    </div>
    <a routerLink="/committees/create" class="btn-primary">+ New Committee</a>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
    @for (tab of tabs; track tab.key) {
      <button (click)="activeTab.set(tab.key)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        [class]="activeTab() === tab.key ? 'bg-primary-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'">
        {{ tab.label }}
        <span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">{{ getCount(tab.key) }}</span>
      </button>
    }
  </div>

  @if (loading()) {
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (i of [1,2,3]; track i) { <app-skeleton-card></app-skeleton-card> }
    </div>
  } @else if (filtered().length === 0) {
    <app-empty-state icon="🏦" title="No committees found"
      description="Start by creating a new committee or browse public ones to join.">
      <a routerLink="/committees/create" class="btn-primary mt-2">Create Committee</a>
    </app-empty-state>
  } @else {
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (c of filtered(); track c.id) {
        <a [routerLink]="['/committees', c.id]" class="glass-card-hover p-5 block">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))">🏦</div>
            <span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span>
          </div>
          <!-- Title -->
          <h3 class="font-display font-semibold text-white mb-1 truncate">{{ c.title }}</h3>
          <p class="text-xs text-slate-500 line-clamp-2 mb-4">{{ c.description || 'No description' }}</p>
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="text-center p-2 rounded-lg bg-white/3">
              <p class="text-sm font-bold text-white">₨{{ c.monthly_amount | number }}</p>
              <p class="text-[10px] text-slate-600">Monthly</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-white/3">
              <p class="text-sm font-bold text-white">{{ c.duration_months }}</p>
              <p class="text-[10px] text-slate-600">Months</p>
            </div>
            <div class="text-center p-2 rounded-lg bg-white/3">
              <p class="text-sm font-bold text-white">{{ c.current_members }}/{{ c.max_members }}</p>
              <p class="text-[10px] text-slate-600">Members</p>
            </div>
          </div>
          <!-- Progress -->
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="getProgress(c) + '%'"></div>
          </div>
          <div class="flex justify-between mt-1.5">
            <span class="text-[10px] text-slate-600">Month {{ c.current_month }}/{{ c.duration_months }}</span>
            <span class="text-[10px] text-primary-400">{{ getProgress(c) }}%</span>
          </div>
          <!-- Creator badge -->
          @if (c.creator_id === auth.currentUser()?.id) {
            <div class="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
              👑 Creator
            </div>
          }
        </a>
      }
    </div>
  }
</div>
  `,
})
export class CommitteeListComponent implements OnInit {
  private cs = inject(CommitteeService);
  auth       = inject(AuthService);

  loading    = signal(true);
  committees = signal<Committee[]>([]);
  activeTab  = signal<string>('all');

  tabs = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'pending',   label: 'Pending' },
    { key: 'completed', label: 'Completed' },
  ];

  get filtered() {
    return this.activeTab() === 'all'
      ? this.committees
      : signal(this.committees().filter(c => c.status === this.activeTab()));
  }

  getCount(tab: string) {
    return tab === 'all' ? this.committees().length : this.committees().filter(c => c.status === tab).length;
  }

  getProgress(c: Committee) {
    return c.duration_months > 0 ? Math.round((c.current_month / c.duration_months) * 100) : 0;
  }

  async ngOnInit() {
    try { this.committees.set(await this.cs.getMyCommittees()); }
    finally { this.loading.set(false); }
  }
}
