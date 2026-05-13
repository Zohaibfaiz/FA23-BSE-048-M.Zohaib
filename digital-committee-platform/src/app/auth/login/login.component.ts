import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="min-h-screen flex bg-surface-900 overflow-hidden">

  <!-- Left Panel -->
  <div class="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
    style="background: linear-gradient(135deg,#1e1b4b 0%,#0f172a 60%,#164e63 100%)">
    <div class="absolute inset-0 opacity-20"
      style="background-image: radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 80%, #06b6d4 0%, transparent 50%)"></div>
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-16">
        <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <span class="text-white font-bold">C</span>
        </div>
        <span class="font-display font-bold text-white text-lg">CommitteePro</span>
      </div>
      <h1 class="text-4xl font-display font-bold text-white leading-tight mb-4">
        Manage Your Savings<br>
        <span class="gradient-text">Committees Smarter</span>
      </h1>
      <p class="text-slate-400 text-lg leading-relaxed">
        Track payments, manage members, and grow your trust reputation — all in one platform.
      </p>
    </div>
    <!-- Floating stats -->
    <div class="relative z-10 grid grid-cols-3 gap-4">
      @for (s of stats; track s.label) {
        <div class="glass-card p-4 text-center">
          <p class="text-2xl font-display font-bold gradient-text">{{ s.value }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
        </div>
      }
    </div>
  </div>

  <!-- Right Panel -->
  <div class="flex-1 flex items-center justify-center p-6">
    <div class="auth-card animate-slide-up">
      <div class="mb-8">
        <h2 class="text-2xl font-display font-bold text-white mb-1">Welcome back</h2>
        <p class="text-slate-500 text-sm">Sign in to your account to continue</p>
      </div>

      <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-5">
        <div class="form-field">
          <label>Email address</label>
          <input type="email" name="email" [(ngModel)]="email" required placeholder="you@example.com"
            [class.error]="loginForm.submitted && !email">
        </div>

        <div class="form-field">
          <label>Password</label>
          <div class="relative">
            <input [type]="showPwd ? 'text' : 'password'" name="password" [(ngModel)]="password"
              required placeholder="••••••••" [class.error]="loginForm.submitted && !password">
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-sm">
              {{ showPwd ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="remember" [(ngModel)]="remember"
              class="w-4 h-4 rounded accent-primary-500">
            <span class="text-xs text-slate-400">Remember me</span>
          </label>
          <a routerLink="/auth/forgot-password" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            Forgot password?
          </a>
        </div>

        @if (errorMsg()) {
          <div class="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-fade-in">
            {{ errorMsg() }}
          </div>
        }

        <button type="submit" class="btn-primary w-full justify-center py-3" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> } @else { Sign In }
        </button>
      </form>

      <div class="divider text-xs text-slate-600">or</div>

      <p class="text-center text-sm text-slate-500">
        Don't have an account?
        <a routerLink="/auth/register" class="text-primary-400 hover:text-primary-300 font-medium ml-1">Sign up free</a>
      </p>
    </div>
  </div>
</div>
  `,
})
export class LoginComponent {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private router= inject(Router);

  email    = '';  password = '';
  remember = false; showPwd = false;
  loading  = signal(false);
  errorMsg = signal('');

  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '₨2B+', label: 'Total Managed' },
    { value: '99.9%', label: 'Uptime' },
  ];

  async onLogin() {
    if (!this.email || !this.password) return;
    this.loading.set(true); this.errorMsg.set('');
    try {
      await this.auth.login({ email: this.email, password: this.password });
      this.toast.success('Welcome back!', 'Logged in successfully.');
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
