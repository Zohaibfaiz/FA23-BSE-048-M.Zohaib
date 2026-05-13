import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommitteeService } from '../../core/services/committee.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-create-committee',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="animate-fade-in max-w-2xl mx-auto">
  <div class="page-header">
    <div>
      <h2 class="page-title">Create Committee</h2>
      <p class="page-subtitle">Set up a new savings committee</p>
    </div>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

    <!-- Basic Info -->
    <div class="glass-card p-6 space-y-4">
      <h3 class="font-display font-semibold text-white flex items-center gap-2">📋 Basic Information</h3>

      <div class="form-field">
        <label>Committee Title *</label>
        <input formControlName="title" type="text" placeholder="e.g. Family Savings Circle 2026">
        @if (f['title'].invalid && f['title'].touched) {
          <span class="error-msg">Title is required (min. 5 characters)</span>
        }
      </div>

      <div class="form-field">
        <label>Description</label>
        <textarea formControlName="description" rows="3" placeholder="Describe the purpose and rules of your committee..."></textarea>
      </div>

      <div class="form-field">
        <label>Rules & Guidelines</label>
        <textarea formControlName="rules" rows="2" placeholder="e.g. Payments due by 5th of each month. Late fee ₨500."></textarea>
      </div>
    </div>

    <!-- Financial Settings -->
    <div class="glass-card p-6 space-y-4">
      <h3 class="font-display font-semibold text-white flex items-center gap-2">💰 Financial Settings</h3>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-field">
          <label>Monthly Amount (₨) *</label>
          <input formControlName="monthly_amount" type="number" min="1000" placeholder="5000">
          @if (f['monthly_amount'].invalid && f['monthly_amount'].touched) {
            <span class="error-msg">Min. ₨1,000</span>
          }
        </div>
        <div class="form-field">
          <label>Duration (Months) *</label>
          <input formControlName="duration_months" type="number" min="2" max="24" placeholder="6">
          @if (f['duration_months'].invalid && f['duration_months'].touched) {
            <span class="error-msg">2 – 24 months</span>
          }
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-field">
          <label>Max Members *</label>
          <input formControlName="max_members" type="number" min="2" max="50" placeholder="6">
        </div>
        <div class="form-field">
          <label>Start Date *</label>
          <input formControlName="start_date" type="date" [min]="today">
        </div>
      </div>

      <div class="form-field">
        <label>Payment Method *</label>
        <select formControlName="payment_method">
          <option value="bank_transfer">Bank Transfer</option>
          <option value="easypaisa">Easypaisa</option>
          <option value="jazzcash">JazzCash</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <!-- Summary Card -->
      @if (form.valid) {
        <div class="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 animate-fade-in">
          <p class="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Committee Summary</p>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <p class="text-lg font-bold text-white">₨{{ totalValue | number }}</p>
              <p class="text-[10px] text-slate-500">Total Pool</p>
            </div>
            <div>
              <p class="text-lg font-bold text-white">₨{{ form.value.monthly_amount | number }}</p>
              <p class="text-[10px] text-slate-500">Your Monthly</p>
            </div>
            <div>
              <p class="text-lg font-bold text-white">{{ form.value.max_members }} slots</p>
              <p class="text-[10px] text-slate-500">Members</p>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Visibility -->
    <div class="glass-card p-6">
      <h3 class="font-display font-semibold text-white mb-4">🌐 Visibility</h3>
      <label class="flex items-center gap-3 cursor-pointer">
        <div class="relative">
          <input type="checkbox" formControlName="is_public" class="sr-only">
          <div class="w-10 h-6 rounded-full transition-colors duration-200"
            [class]="f['is_public'].value ? 'bg-primary-500' : 'bg-surface-700'">
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              [class]="f['is_public'].value ? 'translate-x-4' : ''"></div>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-white">Make this committee public</p>
          <p class="text-xs text-slate-500">Anyone can find and request to join</p>
        </div>
      </label>
    </div>

    <!-- Actions -->
    @if (errorMsg()) {
      <div class="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{{ errorMsg() }}</div>
    }
    <div class="flex gap-3">
      <a routerLink="/committees" class="btn-secondary flex-1 justify-center py-3">Cancel</a>
      <button type="submit" class="btn-primary flex-1 justify-center py-3" [disabled]="loading() || form.invalid">
        @if (loading()) { <span class="spinner"></span> } @else { 🚀 Create Committee }
      </button>
    </div>
  </form>
</div>
  `,
})
export class CreateCommitteeComponent {
  private fb    = inject(FormBuilder);
  private cs    = inject(CommitteeService);
  private toast = inject(ToastService);
  private router= inject(Router);

  loading  = signal(false);
  errorMsg = signal('');
  today    = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    title:          ['', [Validators.required, Validators.minLength(5)]],
    description:    [''],
    rules:          [''],
    monthly_amount: [5000, [Validators.required, Validators.min(1000)]],
    duration_months:[6,    [Validators.required, Validators.min(2), Validators.max(24)]],
    max_members:    [6,    [Validators.required, Validators.min(2), Validators.max(50)]],
    start_date:     ['',   Validators.required],
    payment_method: ['bank_transfer', Validators.required],
    is_public:      [true],
  });

  get f() { return this.form.controls; }

  get totalValue() {
    const v = this.form.value;
    return (v.monthly_amount || 0) * (v.max_members || 0);
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMsg.set('');
    try {
      const c = await this.cs.create(this.form.value as any);
      this.toast.success('Committee created!', 'You are now Member #1.');
      this.router.navigate(['/committees', c.id]);
    } catch (e: any) {
      this.errorMsg.set(e.message || 'Failed to create committee.');
    } finally {
      this.loading.set(false);
    }
  }
}
