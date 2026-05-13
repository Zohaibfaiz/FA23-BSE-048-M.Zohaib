import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from '../admin.component';
@Component({ selector: 'app-admin-committees', standalone: true, imports: [CommonModule, AdminComponent], template: `<app-admin></app-admin>` })
export class AdminCommitteesComponent {}
