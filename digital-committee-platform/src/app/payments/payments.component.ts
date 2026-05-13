import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../core/services/payment.service';
import { StorageService } from '../core/services/storage.service';
import { ToastService } from '../core/services/toast.service';
import { AuthService } from '../core/services/auth.service';
import { Payment } from '../core/models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<div class="animate-fade-in">
  <div class="page-header">
    <div>
      <h2 class="page-title">Payment Tracking</h2>
      <p class="page-subtitle">Track all your committee payments</p>
    </div>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    @for (s of stats(); track s.label) {
      <div class="glass-card p-4 text-center">
        <p class="text-xl font-display font-bold" [class]="s.color">{{ s.value }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ s.label }}</p>
      </div>
    }
  </div>

  <!-- Filter tabs -->
  <div class="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
    @for (tab of ['all','pending','paid','overdue']; track tab) {
      <button (click)="activeTab.set(tab)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
        [class]="activeTab() === tab ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'">
        {{ tab }}
        <span class="ml-1 text-[10px]">({{ getTabCount(tab) }})</span>
      </button>
    }
  </div>

  <!-- Payment list -->
  @if (loading()) {
    <div class="space-y-3">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="glass-card p-4 flex gap-4">
          <div class="skeleton w-10 h-10 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-3 w-1/2"></div>
            <div class="skeleton h-3 w-1/3"></div>
          </div>
          <div class="skeleton h-8 w-24 rounded-xl"></div>
        </div>
      }
    </div>
  } @else if (filtered().length === 0) {
    <div class="text-center py-16">
      <p class="text-4xl mb-4">💳</p>
      <p class="text-slate-500">No payments found.</p>
    </div>
  } @else {
    <div class="glass-card overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>Committee</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          @for (p of filtered(); track p.id) {
            <tr>
              <td class="text-white font-medium">{{ p['committee']?.title || 'Committee' }}</td>
              <td>Month {{ p.month_number }}</td>
              <td class="text-white font-semibold">₨{{ p.amount | number }}</td>
              <td>{{ p.due_date | date:'mediumDate' }}</td>
              <td><span class="badge" [class]="getBadge(p.status)">{{ p.status }}</span></td>
              <td>
                @if (p.status === 'pending' || p.status === 'overdue') {
                  <button (click)="openPayDialog(p)" class="btn-primary text-xs px-3 py-1.5">
                    Mark Paid
                  </button>
                } @else if (p.proof_url) {
                  <a [href]="p.proof_url" target="_blank" class="text-xs text-primary-400 hover:underline">View Proof</a>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>

<!-- Pay Dialog -->
@if (payDialog()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="payDialog.set(null)">
    <div class="glass-card p-6 w-full max-w-md animate-slide-up" (click)="$event.stopPropagation()">
      <h3 class="font-display font-semibold text-white mb-5">💳 Mark Payment as Paid</h3>
      <div class="space-y-4">
        <div class="p-3 rounded-xl bg-white/5 text-sm">
          <p class="text-slate-400">Amount: <span class="text-white font-bold">₨{{ payDialog()!.amount | number }}</span></p>
          <p class="text-slate-400">Due: <span class="text-white">{{ payDialog()!.due_date | date:'mediumDate' }}</span></p>
        </div>
        <div class="form-field">
          <label>Transaction ID *</label>
          <input [(ngModel)]="txId" type="text" placeholder="e.g. TX123456789">
        </div>
        <div class="form-field">
          <label>Payment Proof (screenshot)</label>
          <input type="file" accept="image/*" (change)="onFileSelect($event)"
            class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:text-xs file:font-medium">
        </div>
        @if (uploading()) {
          <p class="text-xs text-primary-400 animate-pulse-soft">Uploading proof...</p>
        }
        <div class="flex gap-3">
          <button (click)="payDialog.set(null)" class="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
          <button (click)="submitPayment()" [disabled]="!txId || paying()" class="btn-primary flex-1 justify-center py-2.5">
            @if (paying()) { <span class="spinner"></span> } @else { Confirm Payment }
          </button>
        </div>
      </div>
    </div>
  </div>
}
  `,
})
export class PaymentsComponent implements OnInit {
  private ps      = inject(PaymentService);
  private storage = inject(StorageService);
  private toast   = inject(ToastService);
  private auth    = inject(AuthService);

  loading   = signal(true);
  paying    = signal(false);
  uploading = signal(false);
  activeTab = signal('all');
  payments  = signal<Payment[]>([]);
  payDialog = signal<Payment | null>(null);
  txId      = '';
  proofFile: File | null = null;

  get filtered() {
    return signal(this.activeTab() === 'all'
      ? this.payments()
      : this.payments().filter(p => p.status === this.activeTab()));
  }

  stats = signal<any[]>([]);

  getTabCount(tab: string) {
    return tab === 'all' ? this.payments().length : this.payments().filter(p => p.status === tab).length;
  }

  getBadge(s: string) { return { paid: 'badge-active', pending: 'badge-pending', overdue: 'badge-overdue' }[s] || 'badge-pending'; }

  async ngOnInit() {
    try {
      const ps = await this.ps.getMyPayments();
      this.payments.set(ps);
      const total   = ps.reduce((s, p) => s + p.amount, 0);
      const paid    = ps.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
      const pending = ps.filter(p => p.status === 'pending').length;
      const overdue = ps.filter(p => p.status === 'overdue').length;
      this.stats.set([
        { label: 'Total Due',  value: '₨' + total.toLocaleString(), color: 'text-white' },
        { label: 'Total Paid', value: '₨' + paid.toLocaleString(),  color: 'text-success-500' },
        { label: 'Pending',    value: pending,                        color: 'text-warning-500' },
        { label: 'Overdue',    value: overdue,                        color: 'text-danger-500' },
      ]);
    } finally { this.loading.set(false); }
  }

  openPayDialog(p: Payment) { this.payDialog.set(p); this.txId = ''; this.proofFile = null; }

  onFileSelect(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.proofFile = f;
  }

  async submitPayment() {
    if (!this.txId || !this.payDialog()) return;
    this.paying.set(true);
    try {
      let proofUrl: string | undefined;
      if (this.proofFile) {
        this.uploading.set(true);
        proofUrl = await this.storage.uploadPaymentProof(this.proofFile, this.payDialog()!.id);
        this.uploading.set(false);
      }
      const updated = await this.ps.markPaid(this.payDialog()!.id, this.txId, proofUrl);
      this.payments.update(ps => ps.map(p => p.id === updated.id ? updated : p));
      this.toast.success('Payment recorded!', 'Your payment has been submitted for verification.');
      this.payDialog.set(null);
    } catch (e: any) {
      this.toast.error('Failed', e.message);
    } finally { this.paying.set(false); }
  }
}
