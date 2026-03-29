import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface Shift {
  id: number;
  schedule_id: number;
  user_name: string;
  user_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  hours: number;
  is_opening: boolean;
  is_closing: boolean;
  edited?: boolean;
}

@Component({
  selector: 'app-schedule-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h3 class="text-title-md font-bold text-on-surface">Horarios Generados</h3>
        <p class="text-body-sm text-secondary">Revisa y edita los horarios antes de publicar</p>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
          <p class="text-[0.65rem] font-bold uppercase text-secondary">Turnos</p>
          <p class="text-2xl font-bold">{{ shifts.length }}</p>
        </div>
        <div class="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
          <p class="text-[0.65rem] font-bold uppercase text-secondary">Trabajadores</p>
          <p class="text-2xl font-bold">{{ getUniqueWorkers() }}</p>
        </div>
        <div class="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
          <p class="text-[0.65rem] font-bold uppercase text-secondary">Cambios</p>
          <p class="text-2xl font-bold">{{ getModifiedCount() }}</p>
        </div>
      </div>

      <!-- Schedules Table -->
      <div class="overflow-x-auto border border-outline-variant/10 rounded-lg">
        <table class="w-full text-sm">
          <!-- Header -->
          <thead class="bg-surface-container-low border-b border-outline-variant/10">
            <tr>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Día</th>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Trabajador</th>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Hora Inicio</th>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Hora Fin</th>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Horas</th>
              <th class="px-6 py-3 text-left font-bold text-on-surface">Tipo</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr *ngFor="let shift of shifts" [class.bg-blue-50]="shift.edited" class="border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors">
              <!-- Día -->
              <td class="px-6 py-4">
                <span class="font-semibold text-on-surface capitalize">{{ shift.day_of_week }}</span>
              </td>

              <!-- Trabajador -->
              <td class="px-6 py-4">
                <span class="text-on-surface">{{ shift.user_name }}</span>
              </td>

              <!-- Hora Inicio (Editable) -->
              <td class="px-6 py-4">
                <input
                  type="time"
                  [(ngModel)]="shift.start_time"
                  (change)="onShiftChange(shift)"
                  class="px-2 py-1 border border-outline-variant/20 rounded text-sm bg-white"
                />
              </td>

              <!-- Hora Fin (Editable) -->
              <td class="px-6 py-4">
                <input
                  type="time"
                  [(ngModel)]="shift.end_time"
                  (change)="onShiftChange(shift)"
                  class="px-2 py-1 border border-outline-variant/20 rounded text-sm bg-white"
                />
              </td>

              <!-- Horas (Calculado) -->
              <td class="px-6 py-4">
                <span class="font-bold text-primary">{{ calculateHours(shift.start_time, shift.end_time) }}h</span>
              </td>

              <!-- Tipo -->
              <td class="px-6 py-4">
                <span
                  [class]="'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase ' +
                    (shift.is_opening ? 'bg-green-500/10 text-green-700' :
                     shift.is_closing ? 'bg-orange-500/10 text-orange-700' : 'bg-blue-500/10 text-blue-700')"
                >
                  {{ shift.is_opening ? 'Apertura' : (shift.is_closing ? 'Cierre' : 'Regular') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Validation Warnings -->
      <div *ngIf="getValidationErrors().length > 0" class="bg-warning/10 border border-warning/30 rounded-lg p-4">
        <p class="font-bold text-warning mb-2">⚠️ Validación necesaria:</p>
        <ul class="text-sm text-warning space-y-1">
          <li *ngFor="let error of getValidationErrors()">• {{ error }}</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 border-t border-outline-variant/10 pt-6">
        <button
          (click)="onCancel()"
          class="flex-1 px-6 py-2.5 border border-outline-variant/20 text-on-surface rounded-lg hover:bg-surface-container transition-all font-bold"
        >
          Cancelar
        </button>
        <button
          (click)="onSaveChanges()"
          [disabled]="getModifiedCount() === 0 || getValidationErrors().length > 0"
          class="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Cambios
        </button>
        <button
          (click)="onPublish()"
          [disabled]="getModifiedCount() > 0 || getValidationErrors().length > 0"
          class="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:scale-[0.98] transition-transform font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          title="Guarda los cambios primero"
        >
          Publicar
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ScheduleViewerComponent implements OnInit {
  @Input() teamId: number | null = null;
  @Input() weekStart: string = '';
  @Output() cancelled = new EventEmitter<void>();
  @Output() published = new EventEmitter<void>();

  shifts: Shift[] = [];
  loading = false;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    if (!this.teamId) return;

    this.loading = true;
    // Fetch schedules for this team
    this.apiService.getTeamSchedules(this.teamId, this.weekStart).subscribe({
      next: (response: any) => {
        // Transform schedules to shifts array
        this.shifts = [];
        response.forEach((schedule: any) => {
          schedule.shifts.forEach((shift: any) => {
            this.shifts.push({
              id: shift.id,
              schedule_id: schedule.id,
              user_name: schedule.user.name,
              user_id: schedule.user_id,
              day_of_week: shift.day_of_week,
              start_time: shift.start_time.substring(0, 5),
              end_time: shift.end_time.substring(0, 5),
              hours: shift.hours,
              is_opening: shift.is_opening,
              is_closing: shift.is_closing,
              edited: false
            });
          });
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.toastService.error('Error cargando horarios');
        this.loading = false;
      }
    });
  }

  onShiftChange(shift: Shift): void {
    shift.edited = true;
    shift.hours = this.calculateHours(shift.start_time, shift.end_time);
  }

  calculateHours(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return Math.round((endMins - startMins) / 60 * 10) / 10;
  }

  getUniqueWorkers(): number {
    return new Set(this.shifts.map(s => s.user_id)).size;
  }

  getModifiedCount(): number {
    return this.shifts.filter(s => s.edited).length;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    const workerHours: { [key: number]: number } = {};
    const dailyHours: { [key: string]: { [key: number]: number } } = {};

    this.shifts.forEach(shift => {
      const hours = this.calculateHours(shift.start_time, shift.end_time);

      // Daily validation
      if (!dailyHours[shift.day_of_week]) {
        dailyHours[shift.day_of_week] = {};
      }
      if (!dailyHours[shift.day_of_week][shift.user_id]) {
        dailyHours[shift.day_of_week][shift.user_id] = 0;
      }
      dailyHours[shift.day_of_week][shift.user_id] += hours;

      // Weekly validation
      if (!workerHours[shift.user_id]) {
        workerHours[shift.user_id] = 0;
      }
      workerHours[shift.user_id] += hours;
    });

    // Check daily limits (max 7 hours)
    Object.keys(dailyHours).forEach(day => {
      Object.keys(dailyHours[day]).forEach(userId => {
        const hours = dailyHours[day][userId as any];
        if (hours > 7) {
          errors.push(`${day}: Usuario supera 7 horas (${hours}h)`);
        }
      });
    });

    // Check weekly limits (max 44 hours)
    Object.keys(workerHours).forEach(userId => {
      const hours = workerHours[userId as any];
      if (hours > 44) {
        errors.push(`Usuario ${userId} supera 44 horas semanales (${hours}h)`);
      }
    });

    return errors;
  }

  onSaveChanges(): void {
    const modifiedShifts = this.shifts.filter(s => s.edited);
    if (modifiedShifts.length === 0) {
      this.toastService.info('Sin cambios para guardar');
      return;
    }

    this.apiService.updateSchedules(modifiedShifts).subscribe({
      next: () => {
        this.toastService.success(`${modifiedShifts.length} cambios guardados`);
        modifiedShifts.forEach(s => s.edited = false);
      },
      error: (err) => {
        console.error('Error saving changes:', err);
        this.toastService.error('Error guardando cambios');
      }
    });
  }

  onPublish(): void {
    this.published.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
