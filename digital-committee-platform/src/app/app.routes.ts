import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Landing
  { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },

  // Auth (guest-only)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login',          loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register',       loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password',loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'verify-email',   loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
      { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // App Shell (authenticated)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: 'dashboard',   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'committees',  loadComponent: () => import('./committees/list/committee-list.component').then(m => m.CommitteeListComponent) },
      { path: 'committees/browse', loadComponent: () => import('./committees/browse/browse.component').then(m => m.BrowseComponent) },
      { path: 'committees/create', loadComponent: () => import('./committees/create/create-committee.component').then(m => m.CreateCommitteeComponent) },
      { path: 'committees/:id',    loadComponent: () => import('./committees/detail/committee-detail.component').then(m => m.CommitteeDetailComponent) },
      { path: 'payments',    loadComponent: () => import('./payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'payments/:committeeId', loadComponent: () => import('./payments/payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent) },
      { path: 'notifications', loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'profile',     loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'analytics',   loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'settings',    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'admin',       canActivate: [adminGuard], loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) },
      { path: 'admin/users', canActivate: [adminGuard], loadComponent: () => import('./admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'admin/committees', canActivate: [adminGuard], loadComponent: () => import('./admin/committees/admin-committees.component').then(m => m.AdminCommitteesComponent) },
      { path: 'admin/logs',  canActivate: [adminGuard], loadComponent: () => import('./admin/logs/admin-logs.component').then(m => m.AdminLogsComponent) },
    ],
  },

  // 404
  { path: '**', redirectTo: '' },
];
