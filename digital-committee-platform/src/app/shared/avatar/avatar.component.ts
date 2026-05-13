import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src) {
      <img [src]="src" [alt]="name" class="object-cover" [class]="sizeClass + ' rounded-full'" (error)="src=''">
    } @else {
      <div class="avatar flex-shrink-0" [class]="sizeClass" [style.background]="gradient">
        {{ initials }}
      </div>
    }
  `,
})
export class AvatarComponent implements OnChanges {
  @Input() src  = '';
  @Input() name = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  initials = '';
  gradient = '';

  readonly sizeMap = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  readonly gradients = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#6366f1)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#22c55e,#06b6d4)',
  ];

  get sizeClass() { return this.sizeMap[this.size]; }

  ngOnChanges() {
    const parts = (this.name || '?').split(' ');
    this.initials = (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    const code = this.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    this.gradient = this.gradients[code % this.gradients.length];
  }
}
