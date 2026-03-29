import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface Shift {
  id: number;
  schedule_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_opening: boolean;
  is_closing: boolean;
  hours: number;
}

interface Schedule {
  id: number;
  user_id: number;
  team_id: number;
  week_start: string;
  total_hours: number;
  published: boolean;
  user?: { name: string; id: number };
  team?: { name: string; id: number; leader_id: number };
  shifts?: Shift[];
}

interface Team {
  id: number;
  name: string;
  leader_id: number;
}

interface EditingShift {
  id: number;
  schedule_id: number;
  original: Shift;
  edited: Shift;
  isEditing: boolean;
}

@Component({
  selector: 'app-turnos-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gestión de Turnos</h1>
        <p class="text-slate-600 dark:text-slate-400">Edita turnos de equipos y trabajadores</p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Team Filter -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Equipo</label>
            <select 
              [(ngModel)]="selectedTeamId"
              (change)="onTeamChange()"
              class="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">-- Selecciona un equipo --</option>
              <option *ngFor="let team of teams()" [value]="team.id">{{ team.name }}</option>
            </select>
          </div>

          <!-- Week Filter -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Semana</label>
            <input 
              type="date"
              [(ngModel)]="selectedWeek"
              (change)="onWeekChange()"
              class="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          </div>

          <!-- Worker Filter -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Trabajador</label>
            <select 
              [(ngModel)]="selectedWorkerId"
              (change)="onWorkerChange()"
              class="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">-- Todos los trabajadores --</option>
              <option *ngFor="let worker of availableWorkers()" [value]="worker.id">{{ worker.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            (click)="loadSchedules()"
            class="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">search</span>
            Buscar
          </button>
          <button 
            (click)="clearFilters()"
            class="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-300 transition-colors">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
          <p class="text-slate-600">Cargando turnos...</p>
        </div>
      </div>

      <!-- Schedules Display -->
      <div *ngIf="!isLoading() && filteredSchedules().length > 0" class="space-y-6">
        <div *ngFor="let schedule of filteredSchedules()" class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <!-- Schedule Header -->
          <div class="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ schedule.user?.name || 'Usuario ' + schedule.user_id }}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Equipo: {{ schedule.team?.name }} | Semana: {{ schedule.week_start | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span *ngIf="schedule.published" class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  ✓ Publicado
                </span>
                <span *ngIf="!schedule.published" class="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                  Borrador
                </span>
              </div>
            </div>
          </div>

          <!-- Shifts Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th class="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Día</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Inicio</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Fin</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Horas</th>
                  <th class="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let shift of (schedule.shifts || [])" class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white capitalize">{{ shift.day_of_week }}</td>
                  <td class="px-6 py-4">
                    <input 
                      *ngIf="isEditingShift(shift.id)"
                      type="time"
                      [(ngModel)]="getEditingShift(shift.id).edited.start_time"
                      (change)="onShiftChange(shift.id)"
                      class="px-3 py-1 rounded border border-teal-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <span *ngIf="!isEditingShift(shift.id)">{{ formatTime(shift.start_time) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <input 
                      *ngIf="isEditingShift(shift.id)"
                      type="time"
                      [(ngModel)]="getEditingShift(shift.id).edited.end_time"
                      (change)="onShiftChange(shift.id)"
                      class="px-3 py-1 rounded border border-teal-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <span *ngIf="!isEditingShift(shift.id)">{{ formatTime(shift.end_time) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span *ngIf="!isEditingShift(shift.id)" class="font-semibold text-slate-700 dark:text-slate-300">{{ shift.hours }}h</span>
                    <span *ngIf="isEditingShift(shift.id)" class="font-semibold text-teal-600">{{ getEditingShift(shift.id).edited.hours }}h</span>
                  </td>
                  <td class="px-6 py-4 flex gap-2">
                    <button 
                      *ngIf="!isEditingShift(shift.id)"
                      (click)="startEdit(shift)"
                      class="px-3 py-1.5 bg-teal-100 text-teal-700 rounded text-xs font-bold hover:bg-teal-200 transition-colors flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">edit</span>
                      Editar
                    </button>
                    <button 
                      *ngIf="isEditingShift(shift.id)"
                      (click)="saveShift(shift.id, schedule.id)"
                      class="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">check</span>
                      Guardar
                    </button>
                    <button 
                      *ngIf="isEditingShift(shift.id)"
                      (click)="cancelEdit(shift.id)"
                      class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-300 transition-colors">
                      Cancelar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div *ngIf="!isLoading() && filteredSchedules().length === 0" class="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
        <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4 block">schedule</span>
        <p class="text-slate-600 dark:text-slate-400 text-lg">No hay turnos para los filtros seleccionados</p>
        <p class="text-slate-500 dark:text-slate-500 text-sm mt-2">Intenta cambiar los filtros o crear nuevos turnos</p>
      </div>
    </div>
  `,
  styles: []
})
export class TurnosEditComponent implements OnInit {
  isLoading = signal(false);
  selections = signal<EditingShift[]>([]);
  teams = signal<Team[]>([]);
  schedules = signal<Schedule[]>([]);
  selectedTeamId = '';
  selectedWeek = '';
  selectedWorkerId = '';
  availableWorkers = signal<{ id: number; name: string }[]>([]);

  filteredSchedules = computed(() => {
    let filtered = this.schedules();

    if (this.selectedWorkerId) {
      filtered = filtered.filter(s => s.user_id === parseInt(this.selectedWorkerId));
    }

    return filtered;
  });

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.initializeWeek();
  }

  private initializeWeek(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    this.selectedWeek = monday.toISOString().split('T')[0];
  }

  private loadTeams(): void {
    this.apiService.getTeams().subscribe({
      next: (teams: Team[]) => {
        this.teams.set(teams);
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.toastService.error('Error al cargar equipos');
      }
    });
  }

  onTeamChange(): void {
    if (this.selectedTeamId) {
      this.loadTeamWorkers();
    }
  }

  private loadTeamWorkers(): void {
    const teamId = parseInt(this.selectedTeamId);
    this.apiService.getTeamMembers(teamId).subscribe({
      next: (members: any[]) => {
        this.availableWorkers.set(
          members.map(m => ({ id: m.id, name: m.name }))
        );
      },
      error: (err) => {
        console.error('Error loading team members:', err);
      }
    });
  }

  onWeekChange(): void {
    // Can be used for auto-loading
  }

  onWorkerChange(): void {
    // Can be used for filtering
  }

  clearFilters(): void {
    this.selectedTeamId = '';
    this.selectedWorkerId = '';
    this.schedules.set([]);
    this.availableWorkers.set([]);
    this.initializeWeek();
  }

  loadSchedules(): void {
    if (!this.selectedTeamId || !this.selectedWeek) {
      this.toastService.warning('Selecciona un equipo y una semana');
      return;
    }

    this.isLoading.set(true);
    const teamId = parseInt(this.selectedTeamId);

    this.apiService.getTeamSchedules(teamId, this.selectedWeek).subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules.set(schedules);
        this.loadTeamWorkers();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.toastService.error('Error al cargar horarios');
        this.isLoading.set(false);
      }
    });
  }

  startEdit(shift: Shift): void {
    const editing: EditingShift = {
      id: shift.id,
      schedule_id: shift.schedule_id,
      original: { ...shift },
      edited: { ...shift },
      isEditing: true
    };
    const current = this.selections();
    current.push(editing);
    this.selections.set([...current]);
  }

  isEditingShift(shiftId: number): boolean {
    return this.selections().some(s => s.id === shiftId && s.isEditing);
  }

  getEditingShift(shiftId: number): EditingShift {
    const editing = this.selections().find(s => s.id === shiftId);
    if (!editing) {
      throw new Error('Shift not found in edit state');
    }
    return editing;
  }

  onShiftChange(shiftId: number): void {
    const editing = this.getEditingShift(shiftId);
    const start = editing.edited.start_time;
    const end = editing.edited.end_time;

    if (!start || !end) return;

    try {
      const startDate = new Date(`2000-01-01T${start}`);
      const endDate = new Date(`2000-01-01T${end}`);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      editing.edited.hours = Math.round(diffHours * 10) / 10;
    } catch (e) {
      console.error('Error calculating hours:', e);
    }
  }

  cancelEdit(shiftId: number): void {
    const filtered = this.selections().filter(s => !(s.id === shiftId && s.isEditing));
    this.selections.set(filtered);
  }

  saveShift(shiftId: number, scheduleId: number): void {
    const editing = this.getEditingShift(shiftId);

    // Validation
    if (editing.edited.hours < 0.5) {
      this.toastService.warning('El turno debe tener al menos 0.5 horas');
      return;
    }

    if (editing.edited.hours > 10) {
      this.toastService.warning('El turno no puede exceder 10 horas por día');
      return;
    }

    const payload = {
      start_time: editing.edited.start_time,
      end_time: editing.edited.end_time,
      hours: editing.edited.hours
    };

    this.apiService.updateShift(shiftId, payload).subscribe({
      next: (updatedShift: any) => {
        // Update local state
        const schedules = this.schedules();
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule && schedule.shifts) {
          const shiftIdx = schedule.shifts.findIndex(s => s.id === shiftId);
          if (shiftIdx >= 0) {
            schedule.shifts[shiftIdx] = updatedShift;
          }
        }

        // Remove from editing state
        const filtered = this.selections().filter(s => !(s.id === shiftId && s.isEditing));
        this.selections.set(filtered);

        this.toastService.success('Turno actualizado correctamente');
      },
      error: (err) => {
        console.error('Error updating shift:', err);
        this.toastService.error('Error al guardar el turno');
      }
    });
  }

  formatTime(time: string): string {
    if (!time) return '-';
    return time.slice(0, 5); // HH:mm format
  }
}
