import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../core/services/api.service';
import { ToastService } from '../../../../../shared/services/toast.service';

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
    <div class="flex flex-col gap-4 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h3 class="text-title-md font-bold text-on-surface">Revisar y Editar Horarios</h3>
        <p class="text-body-sm text-secondary">Semana del {{ (weekStart | date:'d MMM yyyy') }}</p>
      </div>

      <!-- Horas Summary Cards -->
      <div *ngIf="!loading && shifts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Total Hours Card -->
        <div class="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-secondary">Horas Totales Equipo</p>
              <p class="text-3xl font-bold text-primary mt-1">{{ getTotalTeamHours().toFixed(1) }}h</p>
              <p class="text-xs text-secondary mt-2">de 240h proyectadas (6 × 40h)</p>
            </div>
            <span class="material-symbols-outlined text-5xl text-primary/20">schedule</span>
          </div>
        </div>

        <!-- Employees Summary Card -->
        <div class="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-4 border border-secondary/20">
          <p class="text-xs font-bold uppercase tracking-wide text-secondary mb-3">Horas por Trabajador</p>
          <div class="space-y-2">
            <div *ngFor="let userHours of getUserHoursSummary()" class="flex items-center justify-between text-sm">
              <span class="font-medium text-on-surface truncate">{{ userHours.name }}</span>
              <div class="flex items-center gap-2">
                <div class="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all"
                    [class.bg-green-500]="userHours.hours <= 44"
                    [class.bg-warning]="userHours.hours > 44 && userHours.hours <= 45"
                    [class.bg-error]="userHours.hours > 45"
                    [style.width.%]="(userHours.hours / 44) * 100"
                  ></div>
                </div>
                <span class="font-bold text-on-surface w-12 text-right">{{ userHours.hours.toFixed(1) }}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Errors -->
      <div *ngIf="getValidationErrors().length > 0" class="bg-error/10 border border-error/20 rounded-lg p-4">
        <div class="flex gap-2 mb-2">
          <span class="material-symbols-outlined text-error">error</span>
          <span class="font-bold text-error">Errores de validación:</span>
        </div>
        <ul class="list-disc list-inside text-error text-sm space-y-1 ml-2">
          <li *ngFor="let error of getValidationErrors()">{{ error }}</li>
        </ul>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <span class="material-symbols-outlined animate-spin text-primary text-3xl">schedule</span>
        <span class="ml-2 text-secondary">Cargando horarios...</span>
      </div>

      <!-- Organized by Day View -->
      <div *ngIf="!loading && shifts.length > 0" class="space-y-4">
        <div *ngFor="let day of getDaysSorted()" class="bg-surface-container-low rounded-lg border border-outline-variant/10 overflow-hidden">
          <!-- Day Header -->
          <div class="bg-surface-container-highest px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h4 class="font-bold text-on-surface text-lg capitalize">{{ day }}</h4>
            <span class="text-sm text-secondary">{{ getShiftsForDay(day).length }} turnos</span>
          </div>

          <!-- Day Content -->
          <div class="p-6 space-y-4">
            <!-- Opening Shift -->
            <ng-container *ngIf="getOpeningShift(day) as opening">
              <div *ngIf="opening" class="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-200/30">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-700 font-bold">🔓</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">Apertura</p>
                  <p class="font-bold text-on-surface">{{ opening.user_name }}</p>
                  <div class="flex gap-4 mt-2 text-sm">
                    <span class="text-secondary">{{ opening.start_time }} - {{ opening.end_time }}</span>
                    <span class="font-bold text-blue-700">{{ opening.hours.toFixed(1) }}h</span>
                  </div>
                </div>
                <div class="flex-shrink-0" *ngIf="opening.edited" class="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold">
                  Editado
                </div>
              </div>
            </ng-container>

            <!-- Closing Shifts -->
            <ng-container *ngFor="let shift of getClosingShifts(day)">
              <div class="flex items-start gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-200/30">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-700 font-bold">🔐</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold uppercase tracking-wide text-purple-700 mb-1">Cierre</p>
                  <p class="font-bold text-on-surface">{{ shift.user_name }}</p>
                  <div class="flex gap-4 mt-2 text-sm">
                    <span class="text-secondary">{{ shift.start_time }} - {{ shift.end_time }}</span>
                    <span class="font-bold text-purple-700">{{ shift.hours.toFixed(1) }}h</span>
                  </div>
                </div>
                <div class="flex-shrink-0" *ngIf="shift.edited" class="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold">
                  Editado
                </div>
              </div>
            </ng-container>

            <!-- Other Shifts (Regular) -->
            <ng-container *ngFor="let shift of getRegularShifts(day)">
              <div class="flex items-start gap-4 p-4 bg-gray-500/5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-highest transition-colors">
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-500/10 text-gray-700 font-bold">→</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold uppercase tracking-wide text-secondary mb-1">Turno Regular</p>
                  <p class="font-bold text-on-surface">{{ shift.user_name }}</p>
                  <div class="flex gap-4 mt-2 text-sm">
                    <input
                      type="time"
                      [(ngModel)]="shift.start_time"
                      (change)="onShiftChange(shift)"
                      class="px-2 py-1 rounded border border-outline-variant/20 bg-white text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                    <span class="text-secondary">-</span>
                    <input
                      type="time"
                      [(ngModel)]="shift.end_time"
                      (change)="onShiftChange(shift)"
                      class="px-2 py-1 rounded border border-outline-variant/20 bg-white text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                    <span class="font-bold text-on-surface w-12">{{ shift.hours.toFixed(1) }}h</span>
                  </div>
                </div>
                <div class="flex-shrink-0" *ngIf="shift.edited" class="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold">
                  Editado
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- No Data -->
      <div *ngIf="!loading && shifts.length === 0" class="text-center py-8 bg-surface-container-low rounded-lg">
        <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">schedule</span>
        <p class="text-secondary">No hay horarios para mostrar</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4 border-t border-outline-variant/10">
        <button
          (click)="onCancel()"
          class="px-4 py-2.5 rounded-lg border border-outline-variant/20 text-on-surface hover:bg-surface-container-lowest transition-colors font-bold text-sm"
        >
          <span class="material-symbols-outlined inline mr-2">close</span>
          Cancelar
        </button>

        <button
          (click)="onSaveChanges()"
          [disabled]="!hasChanges() || getValidationErrors().length > 0 || saving"
          class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.98] transition-transform font-bold text-sm"
        >
          <span class="material-symbols-outlined inline mr-2" *ngIf="!saving">save</span>
          <span class="material-symbols-outlined inline mr-2 animate-spin" *ngIf="saving">hourglass_empty</span>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>

        <button
          (click)="onPublish()"
          [disabled]="hasChanges() || getValidationErrors().length > 0 || publishing"
          class="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.98] transition-transform font-bold text-sm"
        >
          <span class="material-symbols-outlined inline mr-2" *ngIf="!publishing">send</span>
          <span class="material-symbols-outlined inline mr-2 animate-spin" *ngIf="publishing">hourglass_empty</span>
          {{ publishing ? 'Publicando...' : 'Publicar Horarios' }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ScheduleViewerComponent implements OnInit {
  @Input() teamId!: number;
  @Input() weekStart!: string;
  @Output() cancelled = new EventEmitter<void>();
  @Output() published = new EventEmitter<void>();

  shifts: Shift[] = [];
  loading = false;
  saving = false;
  publishing = false;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log('[ScheduleViewer] ngOnInit called with teamId:', this.teamId, 'weekStart:', this.weekStart);
    this.loadSchedules();
  }

  private loadSchedules(): void {
    console.log('[ScheduleViewer] loadSchedules()  - teamId:', this.teamId, 'weekStart:', this.weekStart);
    this.loading = true;
    const url = `${this.teamId}/schedules?week_start=${this.weekStart}`;
    console.log('[ScheduleViewer] Calling API with params - teamId:', this.teamId, 'weekStart:', this.weekStart);
    
    this.apiService.getTeamSchedules(this.teamId, this.weekStart).subscribe({
      next: (response: any) => {
        console.log('[ScheduleViewer] API response received:', response);
        console.log('[ScheduleViewer] Response count:', response.length);
        
        if (!response || response.length === 0) {
          console.warn('[ScheduleViewer] No schedules in response');
          this.loading = false;
          this.toastService.warning('No hay horarios para esta semana');
          return;
        }
        
        this.shifts = response.flatMap((schedule: any) => {
          console.log('[ScheduleViewer] Processing schedule ID:', schedule.id, 'shifts:', schedule.shifts?.length || 0);
          return schedule.shifts.map((shift: any) => ({
            id: shift.id,
            schedule_id: schedule.id,
            user_name: schedule.user?.name || 'Usuario Desconocido',
            user_id: schedule.user_id,
            day_of_week: this.formatDayOfWeek(shift.day_of_week),
            start_time: shift.start_time.substring(0, 5),
            end_time: shift.end_time.substring(0, 5),
            hours: this.calculateHours(shift.start_time.substring(0, 5), shift.end_time.substring(0, 5)),
            is_opening: shift.is_opening,
            is_closing: shift.is_closing,
            edited: false
          }));
        });
        
        console.log('[ScheduleViewer] Total shifts loaded:', this.shifts.length);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('[ScheduleViewer] API Error:', err);
        console.error('[ScheduleViewer] Error status:', err.status);
        console.error('[ScheduleViewer] Error message:', err.message);
        console.error('[ScheduleViewer] Error response:', err.error);
        this.toastService.error('Error cargando horarios: ' + (err.error?.message || err.statusText || err.message));
        this.loading = false;
      }
    });
  }

  private formatDayOfWeek(day: string): string {
    const dayMap: { [key: string]: string } = {
      'monday': 'Lunes',
      'lunes': 'Lunes',
      'tuesday': 'Martes',
      'martes': 'Martes',
      'wednesday': 'Miércoles',
      'miércoles': 'Miércoles',
      'thursday': 'Jueves',
      'jueves': 'Jueves',
      'friday': 'Viernes',
      'viernes': 'Viernes'
    };
    return dayMap[day.toLowerCase()] || day;
  }

  onShiftChange(shift: Shift): void {
    shift.edited = true;
    shift.hours = this.calculateHours(shift.start_time, shift.end_time);
  }

  calculateHours(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDate = new Date(2000, 0, 1, startHour, startMin);
    const endDate = new Date(2000, 0, 1, endHour, endMin);

    // Handle case where end time is on the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    const dailyHours: { [key: string]: { [key: number]: number } } = {};
    const weeklyHours: { [key: number]: number } = {};

    // Calculate daily and weekly hours per user
    for (const shift of this.shifts) {
      if (!dailyHours[shift.day_of_week]) {
        dailyHours[shift.day_of_week] = {};
      }
      if (!dailyHours[shift.day_of_week][shift.user_id]) {
        dailyHours[shift.day_of_week][shift.user_id] = 0;
      }
      dailyHours[shift.day_of_week][shift.user_id] += shift.hours;

      if (!weeklyHours[shift.user_id]) {
        weeklyHours[shift.user_id] = 0;
      }
      weeklyHours[shift.user_id] += shift.hours;

      // Validate individual shift hours
      if (shift.hours > 7) {
        errors.push(`${shift.user_name} - ${shift.day_of_week}: ${shift.hours.toFixed(2)}h excede máximo de 7 horas`);
      }
    }

    // Check daily limits per user
    for (const day in dailyHours) {
      for (const userId in dailyHours[day]) {
        const hours = dailyHours[day][userId];
        if (hours > 7) {
          const userName = this.shifts.find(s => s.user_id === Number(userId))?.user_name || 'Usuario';
          errors.push(`${userName} - ${day}: ${hours.toFixed(2)}h excede máximo de 7 horas diarias`);
        }
      }
    }

    // Check weekly limits per user
    for (const userId in weeklyHours) {
      if (weeklyHours[userId] > 44) {
        const userName = this.shifts.find(s => s.user_id === Number(userId))?.user_name || 'Usuario';
        errors.push(`${userName}: ${weeklyHours[userId].toFixed(2)}h excede máximo de 44 horas semanales`);
      }
    }

    return [...new Set(errors)]; // Remove duplicates
  }

  hasChanges(): boolean {
    return this.shifts.some(s => s.edited);
  }

  onSaveChanges(): void {
    const modifiedShifts = this.shifts.filter(s => s.edited).map(s => ({
      id: s.id,
      start_time: `${s.start_time}:00`,
      end_time: `${s.end_time}:00`,
      hours: s.hours
    }));

    if (modifiedShifts.length === 0) {
      this.toastService.warning('No hay cambios para guardar');
      return;
    }

    this.saving = true;
    this.apiService.updateSchedules(modifiedShifts).subscribe({
      next: () => {
        this.toastService.success(`${modifiedShifts.length} cambios guardados correctamente`);
        this.shifts.forEach(s => s.edited = false);
        this.saving = false;
      },
      error: (err: any) => {
        console.error('Error saving schedules:', err);
        this.toastService.error('Error guardando cambios');
        this.saving = false;
      }
    });
  }

  onPublish(): void {
    if (this.hasChanges()) {
      this.toastService.error('Guarda los cambios antes de publicar');
      return;
    }

    if (this.getValidationErrors().length > 0) {
      this.toastService.error('Corrige los errores de validación antes de publicar');
      return;
    }

    this.publishing = true;
    this.apiService.publishSchedules(this.teamId, this.weekStart).subscribe({
      next: () => {
        this.toastService.success('Horarios publicados correctamente');
        this.publishing = false;
        this.published.emit();
      },
      error: (err: any) => {
        console.error('Error publishing schedules:', err);
        this.toastService.error('Error publicando horarios');
        this.publishing = false;
      }
    });
  }

  onCancel(): void {
    if (this.hasChanges()) {
      this.cancelled.emit();
    } else {
      this.cancelled.emit();
    }
  }

  // ========== HORAS CALCULATIONS ==========
  getTotalTeamHours(): number {
    return this.shifts.reduce((sum, shift) => sum + shift.hours, 0);
  }

  getUserHoursSummary(): Array<{ id: number; name: string; hours: number }> {
    const userHours: { [key: number]: { name: string; hours: number } } = {};

    for (const shift of this.shifts) {
      if (!userHours[shift.user_id]) {
        userHours[shift.user_id] = {
          name: shift.user_name,
          hours: 0
        };
      }
      userHours[shift.user_id].hours += shift.hours;
    }

    return Object.entries(userHours)
      .map(([id, data]) => ({
        id: Number(id),
        ...data
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // ========== DAY ORGANIZATION ==========
  getDaysSorted(): string[] {
    const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const uniqueDays = new Set(this.shifts.map(s => s.day_of_week));
    return daysOrder.filter(day => uniqueDays.has(day));
  }

  getShiftsForDay(day: string): Shift[] {
    return this.shifts.filter(s => s.day_of_week === day);
  }

  getOpeningShift(day: string): Shift | undefined {
    return this.getShiftsForDay(day).find(s => s.is_opening);
  }

  getClosingShifts(day: string): Shift[] {
    return this.getShiftsForDay(day).filter(s => s.is_closing);
  }

  getRegularShifts(day: string): Shift[] {
    return this.getShiftsForDay(day).filter(s => !s.is_opening && !s.is_closing);
  }
}
