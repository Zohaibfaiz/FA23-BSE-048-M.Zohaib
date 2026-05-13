import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="min-h-screen flex items-center justify-center bg-surface-900 p-6"
  style="background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)">

  <div class="auth-card animate-slide-up w-full max-w-lg">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
        <span class="text-white font-bold text-xl">C</span>
      </div>
      <h2 class="text-2xl font-display font-bold text-white mb-1">Create your account</h2>
      <p class="text-slate-500 text-sm">Join thousands managing committees smarter</p>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 mb-8">
      @for (i of [1,2]; track i) {
        <div class="flex-1 h-1 rounded-full transition-all duration-300"
          [class]="step() >= i ? 'bg-gradient-primary' : 'bg-surface-700'"></div>
      }
    </div>

    <form (ngSubmit)="onSubmit()" #regForm="ngForm">
      <!-- Step 1 -->
      @if (step() === 1) {
        <div class="space-y-4 animate-slide-up">
          <div class="form-field">
            <label>Full Name</label>
            <input name="full_name" [(ngModel)]="data.full_name" required placeholder="Muhammad Zohaib" type="text">
          </div>
          <div class="form-field">
            <label>Email Address</label>
            <input name="email" [(ngModel)]="data.email" required type="email" placeholder="you@example.com">
          </div>
          <div class="form-field">
            <label>Phone Number</label>
            <input name="phone" [(ngModel)]="data.phone" type="tel" placeholder="+92 300 0000000">
          </div>
          <button type="button" (click)="nextStep()" class="btn-primary w-full justify-center py-3 mt-2">
            Continue →
          </button>
        </div>
      }

      <!-- Step 2 -->
      @if (step() === 2) {
        <div class="space-y-4 animate-slide-up">
          <div class="form-field">
            <label>Password</label>
            <input name="password" [(ngModel)]="data.password" required type="password"
              placeholder="Min. 8 characters" minlength="8">
          </div>
          <div class="form-field">
            <label>Confirm Password</label>
            <input name="confirm" [(ngModel)]="confirm" required type="password" placeholder="Repeat password">
            @if (confirm && confirm !== data.password) {
              <span class="error-msg">Passwords do not match</span>
            }
          </div>

          <label class="flex items-start gap-3 cursor-pointer mt-2">
            <input type="checkbox" name="terms" [(ngModel)]="terms" required
              class="mt-0.5 w-4 h-4 rounded accent-primary-500">
            <span class="text-xs text-slate-400 leading-relaxed">
              I agree to the <a href="#" class="text-primary-400">Terms of Service</a> and
              <a href="#" class="text-primary-400">Privacy Policy</a>
            </span>
          </label>

          @if (errorMsg()) {
            <div class="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
              {{ errorMsg() }}
            </div>
          }

          <div class="flex gap-3">
            <button type="button" (click)="step.set(1)" class="btn-secondary flex-1 justify-center py-3">← Back</button>
            <button type="submit" class="btn-primary flex-1 justify-center py-3" [disabled]="loading()">
              @if (loading()) { <span class="spinner"></span> } @else { Create Account }
            </button>
          </div>
        </div>
      }
    </form>

    <p class="text-center text-sm text-slate-500 mt-6">
      Already have an account?
      <a routerLink="/auth/login" class="text-primary-400 hover:text-primary-300 font-medium ml-1">Sign in</a>
    </p>
  </div>
</div>
  `,
})
export class RegisterComponent {
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  step     = signal(1);
  loading  = signal(false);
  errorMsg = signal('');
  confirm  = '';
  terms    = false;

  data = { full_name: '', email: '', phone: '', password: '' };

  nextStep() {
    if (!this.data.full_name || !this.data.email) {
      this.toast.warning('Missing fields', 'Please fill in all required fields.'); return;
    }
    this.step.set(2);
  }

  async onSubmit() {
    if (this.data.password !== this.confirm) { this.errorMsg.set('Passwords do not match.'); return; }
    if (!this.terms) { this.errorMsg.set('Please accept the Terms of Service.'); return; }
    this.loading.set(true); this.errorMsg.set('');
    try {
      await this.auth.register(this.data);
      this.toast.success('Account created!', 'Please check your email to verify your account.');
      this.router.navigate(['/auth/verify-email']);
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Registration failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
