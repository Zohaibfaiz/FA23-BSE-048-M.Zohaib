import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';
import { Notification } from '../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="animate-fade-in max-w-2xl mx-auto">
  <div class="page-header">
    <div>
      <h2 class="page-title">Notifications</h2>
      <p class="page-subtitle">Stay up to date with your committees</p>
    </div>
    @if (ns.unreadCount() > 0) {
      <button (click)="ns.markAllRead()" class="btn-secondary text-xs px-4 py-2">Mark all read</button>
    }
  </div>

  @if (ns.notifications().length === 0) {
    <div class="text-center py-16">
      <p class="text-5xl mb-4">🔔</p>
      <p class="text-slate-500">No notifications yet.</p>
    </div>
  }

  <div class="space-y-2">
    @for (n of ns.notifications(); track n.id) {
      <div class="notif-item" [class.unread]="!n.is_read" (click)="ns.markRead(n.id)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          [style.background]="getIconBg(n.type)">{{ getIcon(n.type) }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-white">{{ n.title }}</p>
            @if (!n.is_read) {
              <span class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"></span>
            }
          </div>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ n.message }}</p>
          <p class="text-[10px] text-slate-600 mt-1.5">{{ n.created_at | date:'medium' }}</p>
        </div>
      </div>
    }
  </div>
</div>
  `,
})
export class NotificationsComponent implements OnInit {
  ns = inject(NotificationService);

  ngOnInit() { this.ns.load(); }

  getIcon(type: string) {
    const map: Record<string, string> = {
      payment_due: '💳', payment_received: '✅', payment_overdue: '🚨', payment_confirmed: '✓',
      your_turn: '🎉', join_request: '👋', join_approved: '✓', join_rejected: '✕',
      committee_started: '🚀', committee_completed: '🏆', general: 'ℹ',
    };
    return map[type] || 'ℹ';
  }

  getIconBg(type: string) {
    if (['payment_overdue','join_rejected'].includes(type)) return 'rgba(239,68,68,0.15)';
    if (['payment_received','join_approved','your_turn'].includes(type)) return 'rgba(34,197,94,0.15)';
    if (type === 'payment_due') return 'rgba(245,158,11,0.15)';
    return 'rgba(99,102,241,0.15)';
  }
}
