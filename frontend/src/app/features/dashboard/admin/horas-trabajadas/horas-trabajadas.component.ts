import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horas-trabajadas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Horas Trabajadas</h1>
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <p class="text-slate-600 dark:text-slate-400">Módulo de horas trabajadas en construcción...</p>
      </div>
    </div>
  `,
  styles: []
})
export class HorasTrabajadasComponent {}
