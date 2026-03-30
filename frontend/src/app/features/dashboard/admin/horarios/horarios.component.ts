import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface MemberShift {
  day: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface MemberSchedule {
  userId: number;
  memberName: string;
  memberEmail: string;
  teamName: string;
  weekStart: string;
  totalHours: number;
  status: 'Publicado' | 'Borrador';
  shifts: MemberShift[];
}

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 w-full p-8">
      <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Gestión de Horarios</h1>
        <p class="text-slate-600 dark:text-slate-400">Vista global de horarios semanales de todos los equipos</p>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>

      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error" class="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm text-slate-600 dark:text-slate-400">Semana del {{ weekStartDate | date:'d/M/y' }} al {{ weekEndDate | date:'d/M/y' }}</p>
          <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ filteredMemberSchedules.length }} trabajadores visibles</p>
          <p class="text-sm font-semibold text-teal-700 dark:text-teal-300 mt-1">Equipos totales: {{ availableGroups.length }}</p>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="text"
            [value]="nameFilter"
            (input)="onNameFilterChange($event)"
            placeholder="Filtrar por nombre"
            class="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm w-56"
          />
          <select
            [value]="groupFilter"
            (change)="onGroupFilterChange($event)"
            class="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm w-52"
          >
            <option value="">Todos los grupos</option>
            <option *ngFor="let group of availableGroups" [value]="group">{{ group }}</option>
          </select>
          <button
            (click)="clearFilters()"
            class="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
          >
            Limpiar
          </button>
          <button (click)="previousWeek()" class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button (click)="nextWeek()" class="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div *ngIf="!loading && !error && filteredMemberSchedules.length === 0" class="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
        <p class="text-slate-600 dark:text-slate-400">No hay horarios para esta semana o filtro</p>
      </div>

      <div *ngIf="!loading && !error" class="space-y-3">
        <div *ngFor="let member of paginatedMemberSchedules" class="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-bold text-slate-900 dark:text-slate-100">{{ member.memberName }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ member.memberEmail }} | {{ member.teamName }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-1 rounded-full"
                [class.bg-green-100]="member.status === 'Publicado'"
                [class.text-green-700]="member.status === 'Publicado'"
                [class.bg-yellow-100]="member.status === 'Borrador'"
                [class.text-yellow-700]="member.status === 'Borrador'"
              >{{ member.status }}</span>
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ member.totalHours }}h</span>
              <button (click)="downloadMemberSchedule(member.userId, member.memberName)" class="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded hover:bg-teal-100 text-xs font-semibold">
                <span class="material-symbols-outlined text-sm">download</span>
                PDF
              </button>
            </div>
          </div>

          <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th class="text-left px-4 py-2 font-semibold text-slate-900 dark:text-slate-100">Dia</th>
                  <th class="text-center px-4 py-2 font-semibold text-slate-900 dark:text-slate-100">Inicio</th>
                  <th class="text-center px-4 py-2 font-semibold text-slate-900 dark:text-slate-100">Fin</th>
                  <th class="text-center px-4 py-2 font-semibold text-slate-900 dark:text-slate-100">Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let shift of member.shifts" class="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                  <td class="px-4 py-2 text-slate-700 dark:text-slate-200">{{ shift.day }}</td>
                  <td class="px-4 py-2 text-center text-slate-700 dark:text-slate-200">{{ shift.startTime }}</td>
                  <td class="px-4 py-2 text-center text-slate-700 dark:text-slate-200">{{ shift.endTime }}</td>
                  <td class="px-4 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">{{ shift.hours }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && filteredMemberSchedules.length > 0" class="flex items-center justify-between">
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Mostrando {{ pageStartIndex + 1 }}-{{ pageEndIndex }} de {{ filteredMemberSchedules.length }}
        </p>
        <div class="flex items-center gap-2">
          <button
            (click)="goToPreviousPage()"
            [disabled]="currentPage === 1"
            class="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-40"
          >Anterior</button>
          <span class="text-sm text-slate-700 dark:text-slate-300">Página {{ currentPage }} / {{ totalPages }}</span>
          <button
            (click)="goToNextPage()"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm disabled:opacity-40"
          >Siguiente</button>
        </div>
      </div>

      <div *ngIf="!loading && !error" class="pt-2 flex justify-end">
        <button (click)="downloadAllSchedules()" class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-semibold text-sm">
          <span class="material-symbols-outlined text-sm">download</span>
          Descargar Todos
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class HorariosComponent implements OnInit {
  memberSchedules: MemberSchedule[] = [];
  loading = true;
  error: string | null = null;
  weekStartDate: Date = this.getWeekStartDate(new Date());
  nameFilter = '';
  groupFilter = '';
  currentPage = 1;
  readonly pageSize = 3;

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  get filteredMemberSchedules(): MemberSchedule[] {
    const nameTerm = this.nameFilter.trim().toLowerCase();

    return this.memberSchedules.filter((member) => {
      const matchesName = !nameTerm || member.memberName.toLowerCase().includes(nameTerm);
      const matchesGroup = !this.groupFilter || member.teamName === this.groupFilter;
      return matchesName && matchesGroup;
    });
  }

  get availableGroups(): string[] {
    const unique = new Set(this.memberSchedules.map((member) => member.teamName));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMemberSchedules.length / this.pageSize));
  }

  get pageStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get pageEndIndex(): number {
    return Math.min(this.pageStartIndex + this.pageSize, this.filteredMemberSchedules.length);
  }

  get paginatedMemberSchedules(): MemberSchedule[] {
    return this.filteredMemberSchedules.slice(this.pageStartIndex, this.pageEndIndex);
  }

  get weekEndDate(): Date {
    const end = new Date(this.weekStartDate);
    end.setDate(end.getDate() + 4);
    return end;
  }

  ngOnInit(): void {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getTeams().subscribe({
      next: (teams: any[]) => {
        if (!teams || teams.length === 0) {
          this.memberSchedules = [];
          this.loading = false;
          return;
        }

        const weekStartStr = this.toDateOnly(this.weekStartDate);
        const scheduleObservables: { [key: number]: any } = {};

        teams.forEach((team: any) => {
          scheduleObservables[team.id] = this.apiService.getTeamSchedules(team.id, weekStartStr).pipe(
            catchError((err) => {
              console.error('[Admin Horarios] Error team schedules:', team.id, err);
              return of([]);
            })
          );
        });

        forkJoin(scheduleObservables).subscribe({
          next: (allSchedules: any) => {
            const dayOrder: { [key: string]: number } = {
              lunes: 1,
              martes: 2,
              miercoles: 3,
              miércoles: 3,
              jueves: 4,
              viernes: 5,
              sabado: 6,
              sábado: 6,
              domingo: 7
            };

            const mapped: MemberSchedule[] = [];

            teams.forEach((team: any) => {
              const schedules = allSchedules[team.id] || [];

              schedules.forEach((schedule: any) => {
                const member = team.members?.find((m: any) => m.id === schedule.user_id) || schedule.user;
                if (!member) {
                  return;
                }

                const shifts = (schedule.shifts || [])
                  .sort((a: any, b: any) => {
                    const dayA = dayOrder[String(a.day_of_week || '').toLowerCase()] || 99;
                    const dayB = dayOrder[String(b.day_of_week || '').toLowerCase()] || 99;
                    if (dayA !== dayB) {
                      return dayA - dayB;
                    }
                    return String(a.start_time || '').localeCompare(String(b.start_time || ''));
                  })
                  .map((shift: any) => ({
                    day: this.capitalizeDay(String(shift.day_of_week || '-')),
                    startTime: String(shift.start_time || '-').slice(0, 5),
                    endTime: String(shift.end_time || '-').slice(0, 5),
                    hours: Number(shift.hours || 0)
                  }));

                mapped.push({
                  userId: Number(schedule.user_id),
                  memberName: String(member.name || 'Sin nombre'),
                  memberEmail: String(member.email || '-'),
                  teamName: String(team.name || 'Equipo'),
                  weekStart: String(schedule.week_start || weekStartStr),
                  totalHours: Number(schedule.total_hours || 0),
                  status: (schedule.published || schedule.status === 'published') ? 'Publicado' : 'Borrador',
                  shifts
                });
              });
            });

            this.memberSchedules = mapped.sort((a, b) => a.memberName.localeCompare(b.memberName));
            this.currentPage = 1;
            this.loading = false;
          },
          error: (err) => {
            console.error('[Admin Horarios] Error joining schedules:', err);
            this.error = 'Error cargando horarios globales';
            this.loading = false;
            this.toastService.error(this.error);
          }
        });
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.error = 'Error al cargar horarios';
        this.toastService.error(this.error);
        this.loading = false;
      }
    });
  }

  private getWeekStartDate(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private toDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private capitalizeDay(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  }

  onNameFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.nameFilter = target?.value ?? '';
    this.currentPage = 1;
  }

  onGroupFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.groupFilter = target?.value ?? '';
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.nameFilter = '';
    this.groupFilter = '';
    this.currentPage = 1;
  }

  previousWeek(): void {
    const prev = new Date(this.weekStartDate);
    prev.setDate(prev.getDate() - 7);
    this.weekStartDate = this.getWeekStartDate(prev);
    this.currentPage = 1;
    this.loadSchedules();
  }

  nextWeek(): void {
    const next = new Date(this.weekStartDate);
    next.setDate(next.getDate() + 7);
    this.weekStartDate = this.getWeekStartDate(next);
    this.currentPage = 1;
    this.loadSchedules();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  downloadAllSchedules(): void {
    this.apiService.downloadTeamSchedulesPdf().subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF se generó vacío.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `horarios_global_${this.toDateOnly(this.weekStartDate)}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('PDF global descargado');
      },
      error: (err) => {
        console.error('[Admin Horarios] Error downloading global PDF:', err);
        this.toastService.error('Error al descargar PDF global');
      }
    });
  }

  downloadMemberSchedule(userId: number, memberName: string): void {
    this.apiService.downloadTeamSchedulesPdf(userId).subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF individual se generó vacío.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `horario_${memberName.replace(/\s+/g, '_').toLowerCase()}_${this.toDateOnly(this.weekStartDate)}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('PDF individual descargado');
      },
      error: (err) => {
        console.error('[Admin Horarios] Error downloading member PDF:', err);
        this.toastService.error('Error al descargar PDF individual');
      }
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private extractFilenameFromDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]).replace(/['"]/g, '').trim();
    }

    const basicMatch = contentDisposition.match(/filename=([^;]+)/i);
    if (basicMatch?.[1]) {
      return basicMatch[1].replace(/['"]/g, '').trim();
    }

    return null;
  }
}
