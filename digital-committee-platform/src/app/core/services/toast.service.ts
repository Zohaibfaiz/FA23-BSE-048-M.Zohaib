import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, title: string, message?: string, duration = 4000) {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { id, type, title, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(title: string, message?: string) { this.show('success', title, message); }
  error(title: string, message?: string)   { this.show('error',   title, message, 6000); }
  info(title: string, message?: string)    { this.show('info',    title, message); }
  warning(title: string, message?: string) { this.show('warning', title, message, 5000); }

  dismiss(id: string) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
