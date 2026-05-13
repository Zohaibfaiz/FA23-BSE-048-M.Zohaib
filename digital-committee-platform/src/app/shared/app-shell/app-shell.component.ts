import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { Router } from '@angular/router';

interface NavItem {
  label: string; icon: string; route: string;
  adminOnly?: boolean; badge?: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AvatarComponent],
  template: `
<div class="flex h-screen overflow-hidden bg-surface-900">

  <!-- ===== SIDEBAR ===== -->
  <aside class="flex-shrink-0 flex flex-col transition-all duration-300 bg-surface-950 border-r border-white/5 z-30"
    [class]="sidebarOpen() ? 'w-64' : 'w-18'">

    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-white/5">
      <div class="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
        <span class="text-white font-bold text-base">C</span>
      </div>
      @if (sidebarOpen()) {
        <div class="animate-fade-in overflow-hidden">
          <p class="font-display font-bold text-white text-sm leading-tight">Committee</p>
          <p class="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Management</p>
        </div>
      }
      <button class="ml-auto text-slate-500 hover:text-white transition-colors"
        (click)="sidebarOpen.set(!sidebarOpen())">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            [attr.d]="sidebarOpen() ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'"/>
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
      @for (item of navItems; track item.route) {
        @if (!item.adminOnly || authService.isAdmin()) {
          <a [routerLink]="item.route" routerLinkActive="active" class="nav-item group"
            [title]="!sidebarOpen() ? item.label : ''">
            <span class="nav-icon text-base">{{ item.icon }}</span>
            @if (sidebarOpen()) {
              <span class="flex-1 animate-fade-in">{{ item.label }}</span>
              @if (item.badge) {
                <span class="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ item.badge }}</span>
              }
            }
          </a>
        }
      }
    </nav>

    <!-- User info -->
    <div class="px-3 pb-4 border-t border-white/5 pt-4">
      <div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        (click)="router.navigate(['/profile'])">
        <app-avatar [src]="authService.profile()?.avatar_url || ''"
          [name]="authService.profile()?.full_name || ''" size="sm"></app-avatar>
        @if (sidebarOpen()) {
          <div class="flex-1 min-w-0 animate-fade-in">
            <p class="text-xs font-semibold text-white truncate">{{ authService.profile()?.full_name }}</p>
            <p class="text-[10px] text-slate-500 truncate">{{ authService.profile()?.email }}</p>
          </div>
          <button (click)="$event.stopPropagation(); authService.logout()"
            class="text-slate-500 hover:text-danger-500 transition-colors" title="Logout">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        }
      </div>
    </div>
  </aside>

  <!-- ===== MAIN CONTENT ===== -->
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Top Navbar -->
    <header class="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-950/50 backdrop-blur-md flex-shrink-0">
      <!-- Page title inferred via router -->
      <div>
        <h1 class="text-base font-display font-semibold text-white">{{ pageTitle() }}</h1>
        <p class="text-xs text-slate-500">{{ currentDate }}</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-56">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input class="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-full"
            placeholder="Search..." (keyup.enter)="onSearch($event)">
        </div>

        <!-- Notifications Bell -->
        <button class="btn-icon relative" (click)="router.navigate(['/notifications'])">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (notifService.unreadCount() > 0) {
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
            </span>
          }
        </button>

        <!-- Avatar -->
        <div class="cursor-pointer" (click)="router.navigate(['/profile'])">
          <app-avatar [src]="authService.profile()?.avatar_url || ''"
            [name]="authService.profile()?.full_name || ''" size="sm"></app-avatar>
        </div>
      </div>
    </header>

    <!-- Router Outlet -->
    <main class="flex-1 overflow-y-auto p-6 animate-fade-in">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
  `,
})
export class AppShellComponent implements OnInit, OnDestroy {
  authService  = inject(AuthService);
  notifService = inject(NotificationService);
  router       = inject(Router);

  sidebarOpen = signal(true);
  currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  navItems: NavItem[] = [
    { label: 'Dashboard',     icon: '🏠', route: '/dashboard' },
    { label: 'My Committees', icon: '👥', route: '/committees' },
    { label: 'Browse',        icon: '🔍', route: '/committees/browse' },
    { label: 'Payments',      icon: '💳', route: '/payments' },
    { label: 'Notifications', icon: '🔔', route: '/notifications' },
    { label: 'Analytics',     icon: '📊', route: '/analytics' },
    { label: 'Profile',       icon: '👤', route: '/profile' },
    { label: 'Settings',      icon: '⚙️', route: '/settings' },
    { label: 'Admin Panel',   icon: '🛡️', route: '/admin', adminOnly: true },
  ];

  readonly routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard', '/committees': 'My Committees',
    '/committees/browse': 'Browse Committees', '/committees/create': 'Create Committee',
    '/payments': 'Payments', '/notifications': 'Notifications',
    '/analytics': 'Analytics', '/profile': 'My Profile',
    '/settings': 'Settings', '/admin': 'Admin Panel',
  };

  pageTitle = signal('Dashboard');

  ngOnInit() {
    this.notifService.load();
    this.notifService.subscribeRealtime();
    this.router.events.subscribe(() => {
      const url = this.router.url.split('?')[0];
      this.pageTitle.set(this.routeTitles[url] || 'Committee Platform');
    });
  }

  ngOnDestroy() { this.notifService.unsubscribeRealtime(); }

  onSearch(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val) this.router.navigate(['/committees/browse'], { queryParams: { q: val } });
  }
}
