import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface HoursReport {
  memberName: string;
  email: string;
  totalHours: number;
  targetHours: number;
  percentage: number;
  status: 'on-track' | 'behind' | 'ahead';
}

@Component({
  selector: 'app-reporte-horas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Reporte de Horas</h2>
        <p class="text-body-md text-secondary">Análisis de horas trabajadas por miembro del equipo</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Generando reporte...</p>
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
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ng-container *ngFor="let card of summaryCards">
            <div class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div [class.bg-primary/10]="card.color === 'primary'" [class.text-primary]="card.color === 'primary'" [class.bg-secondary-container]="card.color === 'secondary'" [class.text-on-secondary-container]="card.color === 'secondary'" [class.bg-error/10]="card.color === 'error'" [class.text-error]="card.color === 'error'" class="w-12 h-12 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined">{{ card.icon }}</span>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">{{ card.title }}</p>
                <p class="text-2xl font-bold text-on-surface">{{ card.value }}</p>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Period Selector -->
        <div class="flex gap-4 items-center bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
          <label class="text-sm font-bold text-on-surface">Período:</label>
          <select (change)="onPeriodChange($event)" [value]="selectedPeriod" class="px-4 py-2 bg-surface-container-highest rounded-lg border border-outline-variant/20 text-on-surface font-medium text-sm">
            <option *ngFor="let option of periodOptions" [value]="option.value">{{ option.label }}</option>
          </select>
        </div>

        <!-- Report Table -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <table class="w-full">
            <thead class="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th class="px-6 py-4 text-left text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Miembro</th>
                <th class="px-6 py-4 text-left text-[0.65rem] font-bold uppercase tracking-wider text-secondary hidden md:table-cell">Email</th>
                <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Horas Trabajadas</th>
                <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Meta</th>
                <th class="px-6 py-4 text-right text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Progreso</th>
                <th class="px-6 py-4 text-right text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of report" class="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                <td class="px-6 py-4"><p class="text-title-sm font-bold text-on-surface">{{ item.memberName }}</p></td>
                <td class="px-6 py-4 hidden md:table-cell"><p class="text-body-sm text-secondary truncate">{{ item.email }}</p></td>
                <td class="px-6 py-4 text-center"><p class="text-title-sm font-bold text-on-surface">{{ item.totalHours }}h</p></td>
                <td class="px-6 py-4 text-center"><p class="text-body-sm text-secondary">{{ item.targetHours }}h</p></td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-32 bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div [class]="getProgressColor(item.status) + ' h-full rounded-full transition-all'" [style.width.%]="item.percentage > 100 ? 100 : item.percentage"></div>
                    </div>
                    <span class="text-body-sm font-bold text-on-surface whitespace-nowrap">{{ item.percentage }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right"><span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase ' + getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span></td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="report.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">list_alt</span>
            <p class="text-secondary font-medium">No hay datos de horas disponibles</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex gap-3 justify-end">
          <button *ngFor="let action of footerActions" (click)="executeFooterAction(action.action)" [class]="action.class">
            <span class="material-symbols-outlined text-lg">{{ action.icon }}</span>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./reporte-horas.component.css'],
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReporteHorasComponent implements OnInit {
  report: HoursReport[] = [];
  loading = true;
  error: string | null = null;
  selectedPeriod = 'weekly';
  
  periodOptions: Array<{ value: string; label: string }> = [];
  footerActions: Array<{ label: string; icon: string; action: () => void; class: string; title: string }> = [];
  summaryCards: Array<{ title: string; value: string | number; icon: string; color: string }> = [];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeOptions();
    this.initializeActions();
    this.loadReport();
  }

  private initializeOptions(): void {
    this.periodOptions = [
      { value: 'weekly', label: 'Esta Semana' },
      { value: 'monthly', label: 'Este Mes' },
      { value: 'quarterly', label: 'Este Trimestre' }
    ];
  }

  private initializeActions(): void {
    this.footerActions = [
      {
        label: 'Imprimir',
        icon: 'print',
        action: () => this.printReport(),
        class: 'flex items-center gap-2 px-6 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-all font-bold text-sm',
        title: 'Imprimir reporte'
      },
      {
        label: 'Descargar PDF',
        icon: 'download',
        action: () => this.downloadReport(),
        class: 'flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold text-sm',
        title: 'Descargar reporte'
      }
    ];
  }

  private loadReport(): void {
    this.apiService.getUsers().subscribe({
      next: (users: any[]) => {
        this.report = users.map(user => ({
          memberName: user.name,
          email: user.email,
          totalHours: user.hours || 0,
          targetHours: 40,
          percentage: Math.round(((user.hours || 0) / 40) * 100),
          status: this.getStatus(user.hours || 0)
        }));
        this.updateSummaryCards();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.error = 'Error cargando reporte de horas';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }

  private updateSummaryCards(): void {
    this.summaryCards = [
      {
        title: 'Total Horas Equipo',
        value: `${this.getTotalTeamHours()}h`,
        icon: 'schedule',
        color: 'primary'
      },
      {
        title: 'Promedio por Persona',
        value: `${this.getAverageHours()}h`,
        icon: 'trending_up',
        color: 'secondary'
      },
      {
        title: 'Atrasados',
        value: this.getBehindCount(),
        icon: 'warning',
        color: 'error'
      }
    ];
  }

  private getStatus(hours: number): 'on-track' | 'behind' | 'ahead' {
    if (hours >= 40) return 'ahead';
    if (hours >= 36) return 'on-track';
    return 'behind';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ahead':
        return 'bg-green-500/10 text-green-700';
      case 'behind':
        return 'bg-error/10 text-error';
      case 'on-track':
      default:
        return 'bg-yellow-500/10 text-yellow-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ahead':
        return 'Adelantado';
      case 'behind':
        return 'Atrasado';
      case 'on-track':
      default:
        return 'En tiempo';
    }
  }

  getProgressColor(status: string): string {
    switch (status) {
      case 'ahead':
        return 'bg-green-500';
      case 'behind':
        return 'bg-error';
      case 'on-track':
      default:
        return 'bg-yellow-500';
    }
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    this.loadReport();
  }

  downloadReport(): void {
    this.toastService.info('Descargando reporte...');
  }

  printReport(): void {
    this.toastService.info('Imprimiendo reporte...');
    window.print();
  }

  getTotalTeamHours(): number {
    return this.report.reduce((sum, item) => sum + item.totalHours, 0);
  }

  getAverageHours(): number {
    if (this.report.length === 0) return 0;
    return Math.round(this.getTotalTeamHours() / this.report.length * 10) / 10;
  }

  getBehindCount(): number {
    return this.report.filter(item => item.status === 'behind').length;
  }

  executeFooterAction(action: () => void): void {
    action();
  }
}
