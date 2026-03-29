import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  shift: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface WeekDay {
  date: Date;
  dayName: string;
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
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Mis Horarios</h2>
        <p class="text-body-md text-secondary">Revisa tus horarios asignados para esta semana</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Cargando tus horarios...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
        <span class="material-symbols-outlined text-error text-xl flex-shrink-0">error</span>
        <div>
          <p class="text-error font-semibold text-sm">Error</p>
          <p class="text-error/80 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading && !error">
        <!-- Calendar Header -->
        <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex justify-between items-center">
          <div>
            <h3 class="text-title-md font-bold text-on-surface">Semana del {{ (currentWeek[0].date | date:'d/M/y') }} al {{ (currentWeek[4].date | date:'d/M/y') }}</h3>
          </div>
          <div class="flex gap-2">
            <button (click)="previousWeek()" class="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button (click)="nextWeek()" class="p-2 hover:bg-surface-container-highest rounded-lg transition-all">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Schedule List -->
        <div class="space-y-3">
          <div *ngIf="schedules.length === 0" class="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">calendar_month</span>
            <p class="text-secondary font-medium">No hay horarios asignados</p>
          </div>

          <!-- Schedule Item -->
          <div *ngFor="let schedule of schedules" class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex items-center justify-between hover:border-primary/30 transition-all">
            <div class="flex items-center gap-4 flex-1">
              <div class="flex flex-col gap-1">
                <p class="text-title-sm font-bold text-on-surface">{{ schedule.date }}</p>
                <p class="text-body-xs text-secondary">{{ schedule.startTime }} - {{ schedule.endTime }}</p>
              </div>
              <div class="hidden md:flex flex-col gap-1 px-4 border-l border-outline-variant/20">
                <p class="text-body-sm text-secondary uppercase font-bold text-[0.65rem]">Turno</p>
                <p class="text-title-sm font-bold text-on-surface">{{ schedule.shift }}</p>
              </div>
              <div class="ml-auto flex items-center gap-2">
                <span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase ' + getStatusBadgeClass(schedule.status)">
                  <span class="material-symbols-outlined text-sm">{{ getStatusIcon(schedule.status) }}</span>
                  {{ getStatusText(schedule.status) }}
                </span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button *ngIf="schedule.status === 'pending'" (click)="requestChange(schedule)" class="p-2 hover:bg-blue-500/10 text-blue-500 rounded-full transition-all" title="Solicitar cambio">
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
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
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MisHorariosComponent implements OnInit {
  schedules: Schedule[] = [];
  loading = true;
  error: string | null = null;
  currentWeek: WeekDay[] = [];
  footerActions: FooterAction[] = [];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeActions();
    this.currentWeek = this.getWeekDates();
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
        label: 'Descargar',
        icon: 'download',
        action: () => this.downloadSchedule(),
        class: 'flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold text-sm',
        title: 'Descargar horarios'
      }
    ];
  }

  private loadSchedules(): void {
    this.apiService.getMySchedules().subscribe({
      next: (schedules: any[]) => {
        this.schedules = schedules;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.error = 'Error cargando horarios';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }

  private getWeekDates(): WeekDay[] {
    const today = new Date();
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - currentDay + 1);

    const days: WeekDay[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      const dayName = this.getDayName(date.getDay());
      days.push({ date, dayName });
    }
    return days;
  }

  private getDayName(dayIndex: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
    return days[dayIndex];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-700';
      case 'rejected':
        return 'bg-error/10 text-error';
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-700';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
        return 'check_circle';
      case 'rejected':
        return 'cancel';
      case 'pending':
      default:
        return 'pending_actions';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
      default:
        return 'Pendiente';
    }
  }

  requestChange(schedule: Schedule): void {
    this.toastService.info(`Solicitud de cambio para ${schedule.date}`);
  }

  printSchedule(): void {
    this.toastService.info('Imprimiendo horarios...');
    window.print();
  }

  downloadSchedule(): void {
    this.toastService.info('Descargando horarios...');
  }

  previousWeek(): void {
    this.toastService.info('Semana anterior');
  }

  nextWeek(): void {
    this.toastService.info('Próxima semana');
  }

  executeFooterAction(action: () => void): void {
    action();
  }
}
