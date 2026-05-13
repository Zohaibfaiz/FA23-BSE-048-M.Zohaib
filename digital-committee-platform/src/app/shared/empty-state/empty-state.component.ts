import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div class="text-6xl mb-5">{{ icon }}</div>
      <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
      <p class="text-sm text-slate-500 max-w-xs mb-6">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon        = '📭';
  @Input() title       = 'Nothing here yet';
  @Input() description = 'Get started by adding your first item.';
}
