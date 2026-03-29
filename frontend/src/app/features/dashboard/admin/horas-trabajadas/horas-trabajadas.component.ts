import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Shift } from '../../../../core/models';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-horas-trabajadas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Horas Trabajadas</h1>
        <p class="text-slate-600 dark:text-slate-400">Total: {{ shifts().length }} turnos registrados</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>

      <!-- Shifts Table -->
      <div *ngIf="!isLoading()" class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">ID</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Horario</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Inicio</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Fin</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let shift of shifts()" class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
              <td class="px-6 py-4 text-slate-900 dark:text-slate-100 font-mono text-sm">#{{ shift.id }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm">#{{ shift.schedule_id }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ shift.start_time | date: 'HH:mm' }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ shift.end_time | date: 'HH:mm' }}</td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-600">
                  {{ calculateDuration(shift.start_time, shift.end_time) }} horas
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && shifts().length === 0" class="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p class="text-slate-600 dark:text-slate-400">No hay turnos registrados</p>
      </div>
    </div>
  `,
  styles: []
})
export class HorasTrabajadasComponent implements OnInit {
  shifts = signal<Shift[]>([]);
  isLoading = signal(true);

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadShifts();
  }

  private loadShifts(): void {
    this.isLoading.set(true);
    this.apiService.getShifts().subscribe({
      next: (shifts: Shift[]) => {
        this.shifts.set(shifts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando turnos:', error);
        this.toastService.error('Error al cargar los turnos');
        this.isLoading.set(false);
      }
    });
  }

  calculateDuration(startTime: string, endTime: string): string {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
      return diffHours.toFixed(1);
    } catch {
      return '0';
    }
  }
}
