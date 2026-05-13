import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { Toast } from '../../core/models';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="animate-slide-in-r flex items-start gap-3 p-4 rounded-xl border shadow-elevated"
          [class]="getClasses(toast)">
          <div class="text-lg flex-shrink-0 mt-0.5">{{ getIcon(toast.type) }}</div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm text-white">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs text-white/70 mt-0.5">{{ toast.message }}</p>
            }
          </div>
          <button (click)="toastService.dismiss(toast.id)"
            class="text-white/50 hover:text-white transition-colors text-lg leading-none flex-shrink-0">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getClasses(toast: Toast): string {
    const map: Record<string, string> = {
      success: 'bg-success-600/90 border-success-500/30 backdrop-blur-md',
      error:   'bg-danger-600/90 border-danger-500/30 backdrop-blur-md',
      warning: 'bg-warning-600/90 border-warning-500/30 backdrop-blur-md',
      info:    'bg-primary-600/90 border-primary-500/30 backdrop-blur-md',
    };
    return map[toast.type] || map['info'];
  }

  getIcon(type: string): string {
    const map: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return map[type] || 'ℹ';
  }
}
