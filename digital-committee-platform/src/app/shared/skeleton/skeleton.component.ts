import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [style.height]="height" [style.width]="width" [class]="extraClass"></div>
  `,
})
export class SkeletonComponent {
  @Input() height = '1rem';
  @Input() width  = '100%';
  @Input() extraClass = '';
}

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="glass-card p-5 space-y-4">
      <div class="flex items-center gap-3">
        <app-skeleton height="2.75rem" width="2.75rem" extraClass="rounded-xl"></app-skeleton>
        <div class="flex-1 space-y-2">
          <app-skeleton height="0.875rem" width="60%"></app-skeleton>
          <app-skeleton height="0.75rem"  width="40%"></app-skeleton>
        </div>
      </div>
      <app-skeleton height="1.5rem" width="80%"></app-skeleton>
      <app-skeleton height="0.75rem"></app-skeleton>
      <app-skeleton height="0.75rem" width="70%"></app-skeleton>
    </div>
  `,
})
export class SkeletonCardComponent {}

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="space-y-3">
      @for (i of rows; track i) {
        <div class="flex items-center gap-4 px-4 py-3">
          <app-skeleton height="2.5rem" width="2.5rem" extraClass="rounded-full flex-shrink-0"></app-skeleton>
          <div class="flex-1 space-y-2">
            <app-skeleton height="0.875rem" width="50%"></app-skeleton>
            <app-skeleton height="0.75rem"  width="30%"></app-skeleton>
          </div>
          <app-skeleton height="1.5rem" width="5rem" extraClass="rounded-full"></app-skeleton>
        </div>
      }
    </div>
  `,
})
export class SkeletonTableComponent {
  @Input() count = 5;
  get rows() { return Array.from({ length: this.count }, (_, i) => i); }
}
