import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="animate-fade-in max-w-2xl mx-auto">
  <div class="page-header">
    <div><h2 class="page-title">Settings</h2><p class="page-subtitle">Manage your preferences</p></div>
  </div>

  <!-- Notification Prefs -->
  <div class="glass-card p-6 mb-5">
    <h3 class="font-display font-semibold text-white mb-5">🔔 Notification Preferences</h3>
    <div class="space-y-4">
      @for (n of notifPrefs; track n.key) {
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="text-sm font-medium text-white">{{ n.label }}</p>
            <p class="text-xs text-slate-500">{{ n.desc }}</p>
          </div>
          <div class="relative ml-4">
            <input type="checkbox" [(ngModel)]="n.enabled" class="sr-only">
            <div class="w-10 h-6 rounded-full transition-colors duration-200"
              [class]="n.enabled ? 'bg-primary-500' : 'bg-surface-700'">
              <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                [class]="n.enabled ? 'translate-x-4' : ''"></div>
            </div>
          </div>
        </label>
      }
    </div>
  </div>

  <!-- Security -->
  <div class="glass-card p-6 mb-5">
    <h3 class="font-display font-semibold text-white mb-5">🔐 Security</h3>
    <div class="space-y-4">
      <div class="form-field">
        <label>New Password</label>
        <input type="password" [(ngModel)]="newPwd" placeholder="Enter new password">
      </div>
      <div class="form-field">
        <label>Confirm Password</label>
        <input type="password" [(ngModel)]="confirmPwd" placeholder="Repeat new password">
      </div>
      <button (click)="changePassword()" class="btn-primary" [disabled]="saving()">
        @if (saving()) { <span class="spinner"></span> } @else { Update Password }
      </button>
    </div>
  </div>

  <!-- Danger Zone -->
  <div class="glass-card p-6 border border-danger-500/20">
    <h3 class="font-display font-semibold text-danger-400 mb-4">⚠️ Danger Zone</h3>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-white">Delete Account</p>
        <p class="text-xs text-slate-500">Permanently delete your account and all data</p>
      </div>
      <button class="btn-danger text-xs px-4 py-2">Delete Account</button>
    </div>
  </div>
</div>
  `,
})
export class SettingsComponent {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);

  saving = signal(false);
  newPwd = ''; confirmPwd = '';

  notifPrefs = [
    { key: 'payment_due',   label: 'Payment Reminders',   desc: 'Get reminded before payments are due', enabled: true },
    { key: 'your_turn',     label: 'Your Turn Alert',     desc: 'Notify when it\'s your turn to receive', enabled: true },
    { key: 'join_request',  label: 'Join Requests',       desc: 'When someone requests to join your committee', enabled: true },
    { key: 'overdue',       label: 'Overdue Alerts',      desc: 'When you have overdue payments', enabled: true },
    { key: 'committee_update', label: 'Committee Updates', desc: 'Status changes and announcements', enabled: false },
  ];

  async changePassword() {
    if (!this.newPwd || this.newPwd !== this.confirmPwd) {
      this.toast.error('Passwords do not match'); return;
    }
    this.saving.set(true);
    try {
      await this.auth.updatePassword(this.newPwd);
      this.toast.success('Password updated!');
      this.newPwd = this.confirmPwd = '';
    } catch (e: any) { this.toast.error('Failed', e.message); }
    finally { this.saving.set(false); }
  }
}
