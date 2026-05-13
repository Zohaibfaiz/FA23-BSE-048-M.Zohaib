import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen flex items-center justify-center bg-surface-900 p-6"
  style="background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)">
  <div class="auth-card animate-slide-up text-center">
    <div class="text-6xl mb-6 animate-bounce-soft">📨</div>
    <h2 class="text-2xl font-display font-bold text-white mb-2">Verify Your Email</h2>
    <p class="text-slate-400 text-sm leading-relaxed mb-8">
      We've sent a verification link to your email address.<br>
      Please check your inbox (and spam folder) to activate your account.
    </p>
    <div class="glass-card p-4 mb-6 text-left space-y-2">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-success-500">✓</span>
        <span class="text-slate-300">Account created successfully</span>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="text-warning-500 animate-pulse-soft">⏳</span>
        <span class="text-slate-300">Email verification pending</span>
      </div>
    </div>
    <a routerLink="/auth/login" class="btn-primary inline-flex justify-center px-8 py-3">
      Go to Login
    </a>
  </div>
</div>
  `,
})
export class VerifyEmailComponent {}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `<div class="min-h-screen flex items-center justify-center bg-surface-900 p-6">
    <div class="auth-card text-center animate-slide-up">
      <h2 class="text-2xl font-display font-bold text-white mb-4">Reset Your Password</h2>
      <p class="text-slate-500 text-sm mb-6">Enter your new password below.</p>
      <div class="form-field text-left mb-4">
        <label>New Password</label>
        <input type="password" [(ngModel)]="pwd" placeholder="Min. 8 characters">
      </div>
      <button class="btn-primary w-full justify-center py-3" (click)="reset()">Update Password</button>
    </div>
  </div>`,
})
export class ResetPasswordComponent {
  pwd = '';
  reset() { /* handled via Supabase deep link */ }
}
