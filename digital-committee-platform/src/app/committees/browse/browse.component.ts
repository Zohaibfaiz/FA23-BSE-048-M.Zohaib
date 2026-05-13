import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommitteeService } from '../../core/services/committee.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { Committee, CommitteeFilter } from '../../core/models';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div>
      <h2 class="page-title">Browse Committees</h2>
      <p class="page-subtitle">Find and join public committees</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="glass-card p-4 mb-6 flex flex-wrap gap-3 items-end">
    <div class="flex-1 min-w-40 form-field">
      <label>Search</label>
      <input [(ngModel)]="filter.search" (ngModelChange)="onFilter()" placeholder="Search committees..." type="text">
    </div>
    <div class="form-field w-36">
      <label>Status</label>
      <select [(ngModel)]="filter.status" (ngModelChange)="onFilter()">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
      </select>
    </div>
    <div class="form-field w-36">
      <label>Sort By</label>
      <select [(ngModel)]="filter.sortBy" (ngModelChange)="onFilter()">
        <option value="created_at">Newest</option>
        <option value="monthly_amount">Amount</option>
        <option value="members">Members</option>
      </select>
    </div>
    <button (click)="resetFilter()" class="btn-secondary text-xs px-4 py-2.5">Reset</button>
  </div>

  <!-- Results count -->
  <p class="text-sm text-slate-500 mb-4">{{ committees().length }} committees found</p>

  @if (loading()) {
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (i of [1,2,3,4,5,6]; track i) {
        <div class="glass-card p-5 space-y-3">
          <div class="skeleton h-4 w-3/4"></div>
          <div class="skeleton h-3 w-full"></div>
          <div class="skeleton h-3 w-2/3"></div>
          <div class="skeleton h-8 w-24 rounded-xl mt-2"></div>
        </div>
      }
    </div>
  } @else if (committees().length === 0) {
    <app-empty-state icon="🔍" title="No committees found" description="Try adjusting your search or filters."></app-empty-state>
  } @else {
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (c of committees(); track c.id) {
        <div class="glass-card-hover p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-display font-semibold text-white mb-0.5">{{ c.title }}</h3>
              <p class="text-xs text-slate-500 flex items-center gap-1">
                by {{ c['creator']?.full_name || 'Unknown' }}
                <span class="text-warning-500">★ {{ c['creator']?.reputation_score || 0 }}</span>
              </p>
            </div>
            <span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span>
          </div>
          <p class="text-xs text-slate-500 mb-4 line-clamp-2">{{ c.description || 'No description provided.' }}</p>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-2 rounded-lg bg-white/3 text-center">
              <p class="text-sm font-bold text-white">₨{{ c.monthly_amount | number }}</p>
              <p class="text-[10px] text-slate-600">Per Month</p>
            </div>
            <div class="p-2 rounded-lg bg-white/3 text-center">
              <p class="text-sm font-bold text-white">{{ c.duration_months }} mo</p>
              <p class="text-[10px] text-slate-600">Duration</p>
            </div>
          </div>

          <!-- Members bar -->
          <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{{ c.current_members }}/{{ c.max_members }} members</span>
            <span>{{ getSlotsLeft(c) }} slots left</span>
          </div>
          <div class="progress-bar mb-4">
            <div class="progress-fill" [style.width]="getMemberPct(c) + '%'"
              [style.background]="getSlotsLeft(c) === 0 ? '#ef4444' : undefined"></div>
          </div>

          <div class="flex gap-2">
            <a [routerLink]="['/committees', c.id]" class="btn-secondary flex-1 justify-center text-xs py-2">View Details</a>
            @if (getSlotsLeft(c) > 0 && !isMyCommittee(c)) {
              <button (click)="requestJoin(c)" class="btn-primary flex-1 justify-center text-xs py-2"
                [disabled]="joining() === c.id">
                @if (joining() === c.id) { <span class="spinner w-3 h-3"></span> } @else { Request Join }
              </button>
            }
            @if (getSlotsLeft(c) === 0) {
              <div class="flex-1 text-center text-xs text-slate-500 py-2">Full</div>
            }
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class BrowseComponent implements OnInit {
  private cs    = inject(CommitteeService);
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  loading    = signal(true);
  joining    = signal<string | null>(null);
  committees = signal<Committee[]>([]);
  filter: CommitteeFilter = { sortBy: 'created_at', sortDir: 'desc' };

  getSlotsLeft(c: Committee) { return c.max_members - c.current_members; }
  getMemberPct(c: Committee) { return Math.round((c.current_members / c.max_members) * 100); }
  isMyCommittee(c: Committee) { return c.creator_id === this.auth.currentUser()?.id; }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) { this.filter.search = params['q']; }
    });
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try { this.committees.set(await this.cs.getPublicCommittees(this.filter)); }
    finally { this.loading.set(false); }
  }

  async onFilter() { await this.load(); }

  resetFilter() {
    this.filter = { sortBy: 'created_at', sortDir: 'desc' };
    this.load();
  }

  async requestJoin(c: Committee) {
    this.joining.set(c.id);
    try {
      await this.cs.requestJoin(c.id);
      this.toast.success('Request sent!', 'The committee creator will review your request.');
    } catch (e: any) {
      this.toast.error('Failed', e.message);
    } finally {
      this.joining.set(null);
    }
  }
}
