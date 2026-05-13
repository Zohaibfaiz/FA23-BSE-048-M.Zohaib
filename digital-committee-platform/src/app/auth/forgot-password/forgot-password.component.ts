import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="min-h-screen flex items-center justify-center bg-surface-900 p-6"
  style="background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)">
  <div class="auth-card animate-slide-up">
    <div class="text-center mb-8">
      <div class="text-4xl mb-4">🔐</div>
      <h2 class="text-2xl font-display font-bold text-white mb-1">Reset Password</h2>
      <p class="text-slate-500 text-sm">Enter your email and we'll send a reset link</p>
    </div>
    @if (!sent()) {
      <form (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="form-field">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com">
        </div>
        @if (errorMsg()) {
          <div class="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{{ errorMsg() }}</div>
        }
        <button type="submit" class="btn-primary w-full justify-center py-3" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> } @else { Send Reset Link }
        </button>
      </form>
    } @else {
      <div class="text-center space-y-4 animate-fade-in">
        <div class="text-5xl">📧</div>
        <p class="text-white font-semibold">Check your inbox!</p>
        <p class="text-slate-400 text-sm">We sent a password reset link to <span class="text-primary-400">{{ email }}</span></p>
        <button class="btn-secondary w-full justify-center py-3" (click)="sent.set(false)">Try again</button>
      </div>
    }
    <p class="text-center text-sm text-slate-500 mt-6">
      Remember it? <a routerLink="/auth/login" class="text-primary-400 hover:text-primary-300 font-medium ml-1">Back to Login</a>
    </p>
  </div>
</div>
  `,
})
export class ForgotPasswordComponent {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  email = ''; loading = signal(false); sent = signal(false); errorMsg = signal('');

  async onSubmit() {
    if (!this.email) return;
    this.loading.set(true); this.errorMsg.set('');
    try {
      await this.auth.forgotPassword(this.email);
      this.sent.set(true);
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Failed to send reset email.');
    } finally { this.loading.set(false); }
  }
}
