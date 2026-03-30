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

interface FooterAction {
  label: string;
  icon: string;
  action: () => void;
  class: string;
  title: string;
}

@Component({
  selector: 'app-mis-horarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Horarios del Equipo</h2>
        <p class="text-body-md text-secondary">Visualiza y descarga los horarios semanales de todos los miembros</p>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Cargando horarios del equipo...</p>
        </div>
      </div>

      <div *ngIf="error && !loading" class="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
        <span class="material-symbols-outlined text-error text-xl flex-shrink-0">error</span>
        <div>
          <p class="text-error font-semibold text-sm">Error</p>
          <p class="text-error/80 text-sm">{{ error }}</p>
        </div>
      </div>

      <ng-container *ngIf="!loading && !error">
        <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-title-md font-bold text-on-surface">Semana del {{ weekStartDate | date:'d/M/y' }} al {{ weekEndDate | date:'d/M/y' }}</h3>
            <p class="text-body-xs text-secondary">{{ memberSchedules.length }} trabajadores con horario</p>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative">
              <span class="material-symbols-outlined text-secondary absolute left-2 top-1/2 -translate-y-1/2 text-lg">search</span>
              <input
                type="text"
                [value]="searchTerm"
                (input)="onSearchChange($event)"
                placeholder="Buscar miembro o equipo"
                class="pl-8 pr-3 py-2 bg-surface-container-highest rounded-lg border border-outline-variant/20 text-on-surface text-sm w-64"
              />
            </div>
            <button (click)="previousWeek()" class="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button (click)="nextWeek()" class="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Miembros con Horario</p>
            <p class="text-2xl font-bold text-on-surface mt-1">{{ memberSchedules.length }}</p>
          </div>
          <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Turnos Totales</p>
            <p class="text-2xl font-bold text-on-surface mt-1">{{ getTotalShifts() }}</p>
          </div>
          <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
            <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Horas Totales</p>
            <p class="text-2xl font-bold text-on-surface mt-1">{{ getTotalHours() }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div *ngIf="filteredMemberSchedules.length === 0" class="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">calendar_month</span>
            <p class="text-secondary font-medium">No hay horarios para esta semana o filtro</p>
          </div>

          <div *ngFor="let member of filteredMemberSchedules" class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 hover:border-primary/30 transition-all">
            <div class="flex items-center justify-between gap-4 mb-3">
              <div>
                <p class="text-title-sm font-bold text-on-surface">{{ member.memberName }}</p>
                <p class="text-body-xs text-secondary">{{ member.memberEmail }} | {{ member.teamName }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase"
                  [class.bg-green-500/10]="member.status === 'Publicado'"
                  [class.text-green-700]="member.status === 'Publicado'"
                  [class.bg-yellow-500/10]="member.status === 'Borrador'"
                  [class.text-yellow-700]="member.status === 'Borrador'"
                >
                  {{ member.status }}
                </span>
                <span class="text-sm font-bold text-on-surface">{{ member.totalHours }}h</span>
                <button (click)="downloadMemberSchedule(member.userId, member.memberName)" class="p-2 hover:bg-primary/10 text-primary rounded-full transition-all" title="Descargar PDF individual">
                  <span class="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>

            <div class="overflow-x-auto border border-outline-variant/10 rounded-lg bg-surface-container-lowest">
              <table class="w-full text-sm">
                <thead class="bg-surface-container-highest border-b border-outline-variant/10">
                  <tr>
                    <th class="px-4 py-2 text-left text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Dia</th>
                    <th class="px-4 py-2 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Inicio</th>
                    <th class="px-4 py-2 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Fin</th>
                    <th class="px-4 py-2 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let shift of member.shifts" class="border-b border-outline-variant/5 last:border-b-0">
                    <td class="px-4 py-2 text-on-surface">{{ shift.day }}</td>
                    <td class="px-4 py-2 text-center text-on-surface">{{ shift.startTime }}</td>
                    <td class="px-4 py-2 text-center text-on-surface">{{ shift.endTime }}</td>
                    <td class="px-4 py-2 text-center text-on-surface font-semibold">{{ shift.hours }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="border-t border-outline-variant/10 pt-4 flex gap-3 justify-end">
          <button *ngFor="let action of footerActions" (click)="executeFooterAction(action.action)" [class]="action.class">
            <span class="material-symbols-outlined text-lg">{{ action.icon }}</span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./mis-horarios.component.css'],
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class MisHorariosComponent implements OnInit {
  memberSchedules: MemberSchedule[] = [];
  loading = true;
  error: string | null = null;
  weekStartDate: Date = this.getWeekStartDate(new Date());
  searchTerm = '';
  footerActions: FooterAction[] = [];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  get filteredMemberSchedules(): MemberSchedule[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.memberSchedules;
    }

    return this.memberSchedules.filter((member) => {
      return (
        member.memberName.toLowerCase().includes(term)
        || member.memberEmail.toLowerCase().includes(term)
        || member.teamName.toLowerCase().includes(term)
      );
    });
  }

  get weekEndDate(): Date {
    const end = new Date(this.weekStartDate);
    end.setDate(end.getDate() + 4);
    return end;
  }

  ngOnInit(): void {
    this.initializeActions();
    this.loadSchedules();
  }

  private initializeActions(): void {
    this.footerActions = [
      {
        label: 'Imprimir',
        icon: 'print',
        action: () => this.printSchedule(),
        class: 'flex items-center gap-2 px-6 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-all font-bold text-sm',
        title: 'Imprimir horarios'
      },
      {
        label: 'Descargar Todos',
        icon: 'download',
        action: () => this.downloadAllSchedules(),
        class: 'flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold text-sm',
        title: 'Descargar horarios'
      }
    ];
  }

  private loadSchedules(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getLedTeams().subscribe({
      next: (teamsResponse: any) => {
        const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse.data || []);
        if (teamsArray.length === 0) {
          this.memberSchedules = [];
          this.loading = false;
          return;
        }

        const weekStartStr = this.toDateOnly(this.weekStartDate);
        const scheduleObservables: { [key: number]: any } = {};

        teamsArray.forEach((team: any) => {
          scheduleObservables[team.id] = this.apiService.getTeamSchedules(team.id, weekStartStr).pipe(
            catchError(err => {
              console.error('[MisHorarios] Error loading schedules for team:', team.id, err);
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

            teamsArray.forEach((team: any) => {
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
            this.loading = false;
          },
          error: (err) => {
            console.error('[MisHorarios] Error joining schedules:', err);
            this.error = 'Error cargando horarios del equipo';
            this.loading = false;
            this.toastService.error(this.error);
          }
        });
      },
      error: (err) => {
        console.error('[MisHorarios] Error loading teams:', err);
        this.error = 'Error cargando equipos';
        this.loading = false;
        this.toastService.error(this.error);
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

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm = target?.value ?? '';
  }

  previousWeek(): void {
    const prev = new Date(this.weekStartDate);
    prev.setDate(prev.getDate() - 7);
    this.weekStartDate = this.getWeekStartDate(prev);
    this.loadSchedules();
  }

  nextWeek(): void {
    const next = new Date(this.weekStartDate);
    next.setDate(next.getDate() + 7);
    this.weekStartDate = this.getWeekStartDate(next);
    this.loadSchedules();
  }

  printSchedule(): void {
    window.print();
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
          || `horarios_equipo_${this.toDateOnly(this.weekStartDate)}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('PDF de horarios descargado');
      },
      error: (err) => {
        console.error('[MisHorarios] Error downloading team schedules PDF:', err);
        this.toastService.error('Error al descargar PDF de horarios');
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
        console.error('[MisHorarios] Error downloading member PDF:', err);
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

  executeFooterAction(action: () => void): void {
    action();
  }

  getTotalShifts(): number {
    return this.memberSchedules.reduce((sum, member) => sum + member.shifts.length, 0);
  }

  getTotalHours(): string {
    const total = this.memberSchedules.reduce((sum, member) => sum + member.totalHours, 0);
    return `${Math.round(total * 10) / 10}h`;
  }
}
