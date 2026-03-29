import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Schedule } from '../../../../core/models';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gestión de Horarios</h1>
        <p class="text-slate-600 dark:text-slate-400">Total: {{ schedules().length }} horarios</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>

      <!-- Schedules Table -->
      <div *ngIf="!isLoading()" class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">ID</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Usuario</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Fecha</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Creado</th>
              <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let schedule of schedules()" class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
              <td class="px-6 py-4 text-slate-900 dark:text-slate-100 font-mono text-sm">#{{ schedule.id }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ schedule.user?.name || 'Usuario ' + schedule.user_id }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ schedule.date | date: 'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ schedule.created_at | date: 'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4">
                <button class="text-teal-600 hover:text-teal-700 text-sm font-semibold">Ver Detalles</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && schedules().length === 0" class="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p class="text-slate-600 dark:text-slate-400">No hay horarios disponibles</p>
      </div>
    </div>
  `,
  styles: []
})
export class HorariosComponent implements OnInit {
  schedules = signal<Schedule[]>([]);
  isLoading = signal(true);

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    this.isLoading.set(true);
    this.apiService.getSchedules().subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules.set(schedules);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.toastService.error('Error al cargar los horarios');
        this.isLoading.set(false);
      }
    });
  }
}
