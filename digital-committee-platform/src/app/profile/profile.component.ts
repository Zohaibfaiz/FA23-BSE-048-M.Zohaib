import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { StorageService } from '../core/services/storage.service';
import { ToastService } from '../core/services/toast.service';
import { AvatarComponent } from '../shared/avatar/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  template: `
<div class="animate-fade-in max-w-3xl mx-auto">
  <div class="page-header">
    <div><h2 class="page-title">My Profile</h2><p class="page-subtitle">Manage your account details</p></div>
  </div>

  <!-- Profile Header -->
  <div class="glass-card p-6 mb-6" style="background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.05))">
    <div class="flex flex-col md:flex-row items-center gap-6">
      <!-- Avatar Upload -->
      <div class="relative group cursor-pointer" (click)="avatarInput.click()">
        <app-avatar [src]="auth.profile()?.avatar_url || ''" [name]="auth.profile()?.full_name || ''" size="xl"></app-avatar>
        <div class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-white text-xs font-medium">📷 Change</span>
        </div>
        <input #avatarInput type="file" accept="image/*" class="hidden" (change)="onAvatarSelect($event)">
      </div>

      <div class="text-center md:text-left">
        <h3 class="text-xl font-display font-bold text-white">{{ auth.profile()?.full_name }}</h3>
        <p class="text-slate-400 text-sm">{{ auth.profile()?.email }}</p>
        <div class="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
          @if (auth.profile()?.is_verified) {
            <span class="badge bg-success-500/20 text-success-500">✓ Verified</span>
          }
          @if ((auth.profile()?.ontime_payment_pct || 0) >= 95) {
            <span class="badge bg-warning-500/20 text-warning-500">🏅 100% On-Time</span>
          }
          @if ((auth.profile()?.completed_committees || 0) >= 5) {
            <span class="badge bg-primary-500/20 text-primary-400">⭐ 5+ Completions</span>
          }
        </div>
      </div>

      <!-- Reputation -->
      <div class="md:ml-auto text-center">
        <div class="text-4xl font-display font-bold gradient-text">{{ auth.profile()?.reputation_score || 0 }}</div>
        <p class="text-xs text-slate-500 mt-1">Reputation Score</p>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="glass-card p-4 text-center">
      <p class="text-2xl font-display font-bold text-white">{{ auth.profile()?.active_committees || 0 }}</p>
      <p class="text-xs text-slate-500 mt-1">Active</p>
    </div>
    <div class="glass-card p-4 text-center">
      <p class="text-2xl font-display font-bold text-white">{{ auth.profile()?.completed_committees || 0 }}</p>
      <p class="text-xs text-slate-500 mt-1">Completed</p>
    </div>
    <div class="glass-card p-4 text-center">
      <p class="text-2xl font-display font-bold text-success-500">{{ auth.profile()?.ontime_payment_pct || 0 }}%</p>
      <p class="text-xs text-slate-500 mt-1">On-Time</p>
    </div>
  </div>

  <!-- Edit Form -->
  <div class="glass-card p-6 space-y-5">
    <h3 class="font-display font-semibold text-white">Personal Information</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="form-field">
        <label>Full Name</label>
        <input [(ngModel)]="form.full_name" type="text" placeholder="Muhammad Zohaib">
      </div>
      <div class="form-field">
        <label>Phone Number</label>
        <input [(ngModel)]="form.phone" type="tel" placeholder="+92 300 0000000">
      </div>
    </div>

    <h3 class="font-display font-semibold text-white pt-2">Payment Details</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="form-field">
        <label>IBAN</label>
        <input [(ngModel)]="form.iban" type="text" placeholder="PK36 SCBL 0000001123456702">
      </div>
      <div class="form-field">
        <label>Bank Account ID</label>
        <input [(ngModel)]="form.bank_account" type="text" placeholder="Account number">
      </div>
      <div class="form-field">
        <label>Easypaisa Number</label>
        <input [(ngModel)]="form.easypaisa_number" type="tel" placeholder="03XX-XXXXXXX">
      </div>
      <div class="form-field">
        <label>JazzCash Number</label>
        <input [(ngModel)]="form.jazzcash_number" type="tel" placeholder="03XX-XXXXXXX">
      </div>
    </div>

    @if (errorMsg()) {
      <div class="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{{ errorMsg() }}</div>
    }

    <div class="flex justify-end">
      <button (click)="saveProfile()" class="btn-primary px-8 py-3" [disabled]="saving()">
        @if (saving()) { <span class="spinner"></span> } @else { Save Changes }
      </button>
    </div>
  </div>
</div>
  `,
})
export class ProfileComponent implements OnInit {
  auth    = inject(AuthService);
  private storage = inject(StorageService);
  private toast   = inject(ToastService);

  saving   = signal(false);
  errorMsg = signal('');

  form: any = {};

  ngOnInit() {
    const p = this.auth.profile();
    if (p) this.form = {
      full_name: p.full_name, phone: p.phone || '',
      iban: p.iban || '', bank_account: p.bank_account || '',
      easypaisa_number: p.easypaisa_number || '', jazzcash_number: p.jazzcash_number || '',
    };
  }

  async onAvatarSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const url = await this.storage.uploadAvatar(file);
      await this.auth.updateProfile({ avatar_url: url });
      this.toast.success('Avatar updated!');
    } catch (err: any) { this.toast.error('Upload failed', err.message); }
  }

  async saveProfile() {
    this.saving.set(true); this.errorMsg.set('');
    try {
      await this.auth.updateProfile(this.form);
      this.toast.success('Profile saved!');
    } catch (e: any) { this.errorMsg.set(e.message); }
    finally { this.saving.set(false); }
  }
}
