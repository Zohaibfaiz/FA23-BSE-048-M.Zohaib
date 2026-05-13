import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-surface-900 text-white overflow-x-hidden">

  <!-- Navbar -->
  <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4
    bg-surface-950/80 backdrop-blur-md border-b border-white/5">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
        <span class="font-bold text-white">C</span>
      </div>
      <span class="font-display font-bold text-white text-lg">CommitteePro</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-sm text-slate-400">
      <a href="#features" class="hover:text-white transition-colors">Features</a>
      <a href="#how" class="hover:text-white transition-colors">How it works</a>
      <a href="#trust" class="hover:text-white transition-colors">Trust System</a>
    </div>
    <div class="flex items-center gap-3">
      <a routerLink="/auth/login" class="btn-secondary text-sm px-4 py-2">Login</a>
      <a routerLink="/auth/register" class="btn-primary text-sm px-4 py-2">Get Started</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="pt-28 pb-20 px-6 md:px-16 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.2) 0%, transparent 60%),
             radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.15) 0%, transparent 50%)"></div>
    <div class="max-w-4xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-6 animate-fade-in">
        🚀 &nbsp;Pakistan's most trusted committee platform
      </div>
      <h1 class="text-5xl md:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
        Committees Made<br><span class="gradient-text">Simple & Secure</span>
      </h1>
      <p class="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up">
        Create, join and manage savings committees with real-time tracking, reputation scoring, and transparent payment management.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4 animate-slide-up">
        <a routerLink="/auth/register" class="btn-primary text-base px-8 py-4">
          Start Free Today →
        </a>
        <a routerLink="/auth/login" class="btn-secondary text-base px-8 py-4">
          See Dashboard
        </a>
      </div>
    </div>

    <!-- Hero card preview -->
    <div class="max-w-5xl mx-auto mt-20 relative">
      <div class="glass-card p-6 md:p-10 animate-slide-up">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          @for (s of heroStats; track s.label) {
            <div class="text-center">
              <p class="text-3xl font-display font-bold gradient-text">{{ s.value }}</p>
              <p class="text-xs text-slate-500 mt-1 font-medium">{{ s.label }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="py-20 px-6 md:px-16">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-white mb-3">Everything You Need</h2>
        <p class="text-slate-500 text-lg">A complete solution for managing savings committees</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        @for (f of features; track f.title) {
          <div class="glass-card-hover p-6">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              [style.background]="f.bg">{{ f.icon }}</div>
            <h3 class="text-lg font-display font-semibold text-white mb-2">{{ f.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how" class="py-20 px-6 md:px-16"
    style="background: linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 100%)">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-white mb-3">How It Works</h2>
        <p class="text-slate-500">Three simple steps to get started</p>
      </div>
      <div class="space-y-6">
        @for (step of steps; track step.num) {
          <div class="flex items-start gap-6 glass-card p-6">
            <div class="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center font-display font-bold text-white text-lg flex-shrink-0 shadow-glow">
              {{ step.num }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-1">{{ step.title }}</h3>
              <p class="text-slate-500 text-sm">{{ step.desc }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </section>

  <!-- Trust Section -->
  <section id="trust" class="py-20 px-6 md:px-16">
    <div class="max-w-6xl mx-auto">
      <div class="glass-card p-10 md:p-16 text-center"
        style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Built on <span class="gradient-text">Trust & Transparency</span>
        </h2>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Every member has a reputation score. Every payment is tracked. Every committee is transparent.
        </p>
        <a routerLink="/auth/register" class="btn-primary text-base px-10 py-4 inline-flex">
          Join CommitteePro Free
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-10 px-6 md:px-16 border-t border-white/5 text-center">
    <p class="text-slate-600 text-sm">© 2026 CommitteePro · Built for Pakistan 🇵🇰</p>
  </footer>
</div>
  `,
})
export class LandingComponent {
  heroStats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '₨2B+',   label: 'Total Managed' },
    { value: '50,000+',label: 'Payments Tracked' },
    { value: '4.9★',   label: 'User Rating' },
  ];

  features = [
    { icon: '🔒', title: 'Secure Payments',       bg: 'rgba(99,102,241,0.15)',  desc: 'Upload payment proofs, enter transaction IDs, and get verified by committee admins instantly.' },
    { icon: '⚡', title: 'Real-time Updates',      bg: 'rgba(6,182,212,0.15)',   desc: 'Live notifications when members pay, join, or when your turn is coming up next.' },
    { icon: '⭐', title: 'Reputation System',      bg: 'rgba(245,158,11,0.15)', desc: 'Build trust through on-time payments and earn badges that make you a preferred member.' },
    { icon: '📊', title: 'Analytics Dashboard',   bg: 'rgba(34,197,94,0.15)',  desc: 'Visualize your savings journey, payment history, and committee progress at a glance.' },
    { icon: '👥', title: 'Member Management',      bg: 'rgba(139,92,246,0.15)', desc: 'Committee creators can add, remove, and assign turns to members with full control.' },
    { icon: '📱', title: 'Mobile Responsive',      bg: 'rgba(239,68,68,0.15)',  desc: 'Access your committees on any device — beautifully designed for mobile and desktop.' },
  ];

  steps = [
    { num: '1', title: 'Create an Account',      desc: 'Sign up free and set up your profile with payment details and contact information.' },
    { num: '2', title: 'Create or Join',          desc: 'Create a new committee with custom rules, or browse public ones and request to join.' },
    { num: '3', title: 'Pay & Track Monthly',     desc: 'Upload your payment proof each month, track others\' payments, and await your turn.' },
  ];
}
