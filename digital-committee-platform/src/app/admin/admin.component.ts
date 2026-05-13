import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../core/services/supabase.service';
import { ToastService } from '../core/services/toast.service';
import { AvatarComponent } from '../shared/avatar/avatar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AvatarComponent],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div>
      <h2 class="page-title flex items-center gap-2">🛡️ Admin Panel</h2>
      <p class="page-subtitle">Platform management and oversight</p>
    </div>
  </div>

  <!-- Platform Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    @for (s of platformStats(); track s.label) {
      <div class="glass-card p-5 text-center">
        <div class="text-3xl mb-2">{{ s.icon }}</div>
        <p class="text-2xl font-display font-bold text-white">{{ s.value }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
      </div>
    }
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
    @for (tab of tabs; track tab) {
      <button (click)="activeTab.set(tab)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
        [class]="activeTab() === tab ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'">{{ tab }}</button>
    }
  </div>

  <!-- Users Tab -->
  @if (activeTab() === 'users') {
    <div class="glass-card overflow-hidden animate-fade-in">
      <div class="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 class="font-semibold text-white">All Users ({{ users().length }})</h3>
        <input [(ngModel)]="userSearch" placeholder="Search users..." type="text"
          class="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none w-52">
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>Role</th><th>Reputation</th><th>Committees</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filteredUsers(); track u.id) {
              <tr>
                <td>
                  <div class="flex items-center gap-2">
                    <app-avatar [name]="u.full_name" size="xs"></app-avatar>
                    <span class="text-white text-xs font-medium">{{ u.full_name }}</span>
                  </div>
                </td>
                <td class="text-xs">{{ u.email }}</td>
                <td><span class="badge" [class]="u.role === 'admin' ? 'badge-completed' : 'badge-pending'">{{ u.role }}</span></td>
                <td class="text-white font-semibold">{{ u.reputation_score }}</td>
                <td>{{ u.active_committees }}</td>
                <td>
                  <span class="badge" [class]="u.is_suspended ? 'badge-overdue' : 'badge-active'">
                    {{ u.is_suspended ? 'Suspended' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button (click)="toggleSuspend(u)" class="text-xs px-2 py-1 rounded-lg transition-colors"
                      [class]="u.is_suspended ? 'bg-success-500/20 text-success-500 hover:bg-success-500/30' : 'bg-danger-500/20 text-danger-500 hover:bg-danger-500/30'">
                      {{ u.is_suspended ? 'Restore' : 'Suspend' }}
                    </button>
                    <button (click)="promoteToAdmin(u)" class="text-xs px-2 py-1 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
                      *ngIf="u.role !== 'admin'">
                      Make Admin
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- Committees Tab -->
  @if (activeTab() === 'committees') {
    <div class="glass-card overflow-hidden animate-fade-in">
      <div class="p-4 border-b border-white/5">
        <h3 class="font-semibold text-white">All Committees ({{ committees().length }})</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr><th>Title</th><th>Creator</th><th>Amount</th><th>Members</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (c of committees(); track c.id) {
              <tr>
                <td class="text-white font-medium">{{ c.title }}</td>
                <td class="text-xs">{{ c['creator']?.full_name }}</td>
                <td class="text-white">₨{{ c.monthly_amount | number }}</td>
                <td>{{ c.current_members }}/{{ c.max_members }}</td>
                <td><span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span></td>
                <td>
                  <button class="text-xs px-2 py-1 rounded-lg bg-danger-500/20 text-danger-500 hover:bg-danger-500/30 transition-colors">
                    Force Close
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  }

  <!-- Activity Logs Tab -->
  @if (activeTab() === 'logs') {
    <div class="glass-card overflow-hidden animate-fade-in">
      <div class="p-4 border-b border-white/5">
        <h3 class="font-semibold text-white">Activity Logs</h3>
      </div>
      <div class="divide-y divide-white/5">
        @for (log of activityLogs(); track log.id) {
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></div>
            <p class="text-xs text-slate-400 flex-1">
              <span class="text-white font-medium">{{ log.user_id }}</span> · {{ log.action }}
            </p>
            <p class="text-[10px] text-slate-600">{{ log.created_at | date:'short' }}</p>
          </div>
        }
        @if (activityLogs().length === 0) {
          <p class="text-center text-slate-600 py-8 text-sm">No activity logs yet.</p>
        }
      </div>
    </div>
  }
</div>
  `,
})
export class AdminComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private toast           = inject(ToastService);
  private supabase        = this.supabaseService.client;

  activeTab     = signal('users');
  userSearch    = '';
  users         = signal<any[]>([]);
  committees    = signal<any[]>([]);
  activityLogs  = signal<any[]>([]);
  platformStats = signal<any[]>([]);

  tabs = ['users', 'committees', 'logs'];

  get filteredUsers() {
    return signal(this.userSearch
      ? this.users().filter(u => u.full_name?.toLowerCase().includes(this.userSearch.toLowerCase()) || u.email?.includes(this.userSearch))
      : this.users());
  }

  async ngOnInit() {
    await Promise.all([this.loadUsers(), this.loadCommittees(), this.loadLogs()]);
    this.platformStats.set([
      { icon: '👥', label: 'Total Users',        value: this.users().length },
      { icon: '🏦', label: 'Total Committees',   value: this.committees().length },
      { icon: '✅', label: 'Active Committees',  value: this.committees().filter(c => c.status === 'active').length },
      { icon: '📊', label: 'Activity Logs',      value: this.activityLogs().length },
    ]);
  }

  async loadUsers() {
    const { data } = await this.supabase.from('profiles').select('*').order('created_at', { ascending: false });
    this.users.set(data || []);
  }

  async loadCommittees() {
    const { data } = await this.supabase.from('committees').select('*, creator:profiles!creator_id(full_name)').order('created_at', { ascending: false });
    this.committees.set(data || []);
  }

  async loadLogs() {
    const { data } = await this.supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    this.activityLogs.set(data || []);
  }

  async toggleSuspend(u: any) {
    const newState = !u.is_suspended;
    await this.supabase.from('profiles').update({ is_suspended: newState }).eq('id', u.id);
    this.users.update(us => us.map(x => x.id === u.id ? { ...x, is_suspended: newState } : x));
    this.toast.success(newState ? 'User suspended' : 'User restored');
  }

  async promoteToAdmin(u: any) {
    if (!confirm('Make this user an admin?')) return;
    await this.supabase.from('profiles').update({ role: 'admin' }).eq('id', u.id);
    this.users.update(us => us.map(x => x.id === u.id ? { ...x, role: 'admin' } : x));
    this.toast.success('User promoted to admin');
  }
}

@Component({ selector: 'app-admin-users',      standalone: true, imports: [CommonModule, AdminComponent], template: `<app-admin></app-admin>` })
export class AdminUsersComponent {}

@Component({ selector: 'app-admin-committees',  standalone: true, imports: [CommonModule, AdminComponent], template: `<app-admin></app-admin>` })
export class AdminCommitteesComponent {}

@Component({ selector: 'app-admin-logs',        standalone: true, imports: [CommonModule, AdminComponent], template: `<app-admin></app-admin>` })
export class AdminLogsComponent {}
