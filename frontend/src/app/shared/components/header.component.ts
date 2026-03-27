import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-slate-50 dark:bg-slate-950 flex justify-between items-center w-full px-6 py-3">
      <div class="text-xl font-bold text-slate-900 dark:text-slate-100 font-headline">
        Gestión de Horarios Laborales
      </div>
      <div class="flex items-center gap-4">
        <span class="text-on-surface-variant text-sm font-medium">Acceso Administrativo</span>
        <div class="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center">
          <span class="material-symbols-outlined text-outline text-lg">lock</span>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {}
