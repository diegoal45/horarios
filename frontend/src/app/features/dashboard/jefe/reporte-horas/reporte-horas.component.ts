import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface TeamMemberReport {
  userId: number;
  name: string;
  email: string;
  totalHours: number;
  openingShifts: number;
  closingShifts: number;
  regularShifts: number;
  percentage: number;
  status: 'on-track' | 'behind' | 'ahead';
}

interface TeamReport {
  teamId: number;
  teamName: string;
  totalMembers: number;
  members: TeamMemberReport[];
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
        <p class="text-body-md text-secondary">Detalle de horas y turnos de los miembros de tu equipo</p>
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
        <!-- Period Selector -->
        <div class="flex gap-4 items-center bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
          <label class="text-sm font-bold text-on-surface">Semana:</label>
          <select (change)="onPeriodChange($event)" [value]="selectedPeriod" class="px-4 py-2 bg-surface-container-highest rounded-lg border border-outline-variant/20 text-on-surface font-medium text-sm">
            <option *ngFor="let option of periodOptions" [value]="option.value">{{ option.label }}</option>
          </select>
        </div>

        <!-- Teams Reports -->
        <div *ngFor="let teamReport of teams" class="space-y-4">
          <!-- Team Header -->
          <div class="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <h3 class="text-title-md font-bold text-on-surface mb-2">{{ teamReport.teamName }}</h3>
            <p class="text-body-sm text-secondary">{{ teamReport.totalMembers }} miembros</p>
          </div>

          <!-- Team Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-primary/10 rounded-xl p-5 border border-primary/20">
              <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Total Horas</p>
              <p class="text-2xl font-bold text-primary mt-2">{{ getTeamTotalHours(teamReport) }}h</p>
            </div>
            <div class="bg-blue-500/10 rounded-xl p-5 border border-blue-200/20">
              <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Aperturas</p>
              <p class="text-2xl font-bold text-blue-700 mt-2">{{ getTeamOpeningShifts(teamReport) }}</p>
            </div>
            <div class="bg-purple-500/10 rounded-xl p-5 border border-purple-200/20">
              <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Cierres</p>
              <p class="text-2xl font-bold text-purple-700 mt-2">{{ getTeamClosingShifts(teamReport) }}</p>
            </div>
            <div class="bg-green-500/10 rounded-xl p-5 border border-green-200/20">
              <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Promedio</p>
              <p class="text-2xl font-bold text-green-700 mt-2">{{ getTeamAverageHours(teamReport) }}h</p>
            </div>
          </div>

          <!-- Team Members Table -->
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low border-b border-outline-variant/10">
                <tr>
                  <th class="px-6 py-4 text-left text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Miembro</th>
                  <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Horas</th>
                  <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">🔓 Aperturas</th>
                  <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">🔐 Cierres</th>
                  <th class="px-6 py-4 text-center text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Regulares</th>
                  <th class="px-6 py-4 text-right text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Progreso</th>
                  <th class="px-6 py-4 text-right text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Descarga</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of teamReport.members" class="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                  <td class="px-6 py-4">
                    <div>
                      <p class="text-title-sm font-bold text-on-surface">{{ member.name }}</p>
                      <p class="text-body-xs text-secondary truncate">{{ member.email }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <p class="text-title-sm font-bold text-on-surface">{{ member.totalHours }}h</p>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-700 font-bold text-sm">
                      {{ member.openingShifts }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-700 font-bold text-sm">
                      {{ member.closingShifts }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/10 text-gray-700 font-bold text-sm">
                      {{ member.regularShifts }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 justify-end">
                      <div class="w-24 bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div [class]="getProgressColor(member.status) + ' h-full rounded-full transition-all'" [style.width.%]="member.percentage > 100 ? 100 : member.percentage"></div>
                      </div>
                      <span class="text-body-sm font-bold text-on-surface w-10 text-right">{{ member.percentage }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      (click)="downloadMemberReport(member.userId)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-xs font-bold"
                      title="Descargar horario individual"
                    >
                      <span class="material-symbols-outlined text-sm">download</span>
                      PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Teams Message -->
        <div *ngIf="teams.length === 0" class="text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">groups</span>
          <p class="text-secondary font-medium">No tienes equipos creados aún</p>
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
  teams: TeamReport[] = [];
  report: TeamMemberReport[] = [];
  loading = true;
  error: string | null = null;
  selectedPeriod = 'weekly';
  
  periodOptions: Array<{ value: string; label: string }> = [];
  footerActions: Array<{ label: string; icon: string; action: () => void; class: string; title: string }> = [];

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
    this.loading = true;
    this.error = null;

    // Load teams led by current user
    this.apiService.getLedTeams().subscribe({
      next: (teamsResponse: any) => {
        const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse.data || []);
        console.log('[ReporteHoras] Teams loaded:', teamsArray.length, teamsArray);
        
        if (teamsArray.length === 0) {
          this.teams = [];
          this.loading = false;
          return;
        }

        // Get current week start
        const today = new Date();
        const weekStart = this.getWeekStart(today);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        console.log('[ReporteHoras] Week start:', weekStartStr);

        // Build observable for each team's schedules
        const scheduleObservables: { [key: number]: any } = {};
        
        teamsArray.forEach((team: any) => {
          scheduleObservables[team.id] = this.apiService.getTeamSchedules(team.id, weekStartStr).pipe(
            catchError(err => {
              console.error('[ReporteHoras] Error loading schedules for team:', team.id, err);
              return of([]);
            })
          );
        });

        // Use forkJoin to wait for all team schedules to load
        forkJoin(scheduleObservables).subscribe({
          next: (allSchedules: any) => {
            console.log('[ReporteHoras] All schedules loaded:', allSchedules);

            const teamReports: TeamReport[] = teamsArray.map((team: any) => {
              const schedules = allSchedules[team.id] || [];
              console.log(`[ReporteHoras] Team ${team.teamName} schedules:`, schedules);

              // Flatten all shifts from all schedules for this team
              const allShifts: any[] = [];
              schedules.forEach((schedule: any) => {
                if (schedule.shifts && Array.isArray(schedule.shifts)) {
                  allShifts.push(...schedule.shifts);
                }
              });
              console.log(`[ReporteHoras] Team ${team.teamName} total shifts:`, allShifts.length);

              const memberReports: TeamMemberReport[] = (team.members || []).map((member: any) => {
                // Get schedules for this member
                const memberSchedules = schedules.filter((s: any) => s.user_id === member.id);
                console.log(`[ReporteHoras] Member ${member.name} schedules:`, memberSchedules.length);
                
                // Calculate total hours
                const totalHours = memberSchedules.reduce((sum: number, s: any) => sum + (s.total_hours || 0), 0);

                // Get shifts for this member from allShifts
                const memberShifts = allShifts.filter((shift: any) => {
                  // Find schedule that contains this shift
                  return schedules.some((sched: any) => 
                    sched.user_id === member.id && 
                    sched.shifts && 
                    sched.shifts.some((s: any) => s.id === shift.id)
                  );
                });

                const openingCount = memberShifts.filter(s => s.is_opening).length;
                const closingCount = memberShifts.filter(s => s.is_closing).length;
                const regularCount = memberShifts.filter(s => !s.is_opening && !s.is_closing).length;

                console.log(`[ReporteHoras] ${member.name}: opening=${openingCount}, closing=${closingCount}, regular=${regularCount}, total_hours=${totalHours}`);

                return {
                  userId: member.id,
                  name: member.name,
                  email: member.email,
                  totalHours: totalHours,
                  openingShifts: openingCount,
                  closingShifts: closingCount,
                  regularShifts: regularCount,
                  percentage: Math.round((totalHours / 44) * 100),
                  status: this.getStatus(totalHours)
                };
              });

              return {
                teamId: team.id,
                teamName: team.name,
                totalMembers: team.members?.length || 0,
                members: memberReports
              };
            });

            console.log('[ReporteHoras] Final teams report:', teamReports);
            this.teams = teamReports;
            this.loading = false;
          },
          error: (err) => {
            console.error('[ReporteHoras] Error in forkJoin:', err);
            this.error = 'Error cargando datos de horarios';
            this.loading = false;
            this.toastService.error(this.error);
          }
        });
      },
      error: (err) => {
        console.error('[ReporteHoras] Error loading teams:', err);
        this.error = 'Error cargando equipos';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private getStatus(hours: number): 'on-track' | 'behind' | 'ahead' {
    if (hours >= 44) return 'ahead';
    if (hours >= 35) return 'on-track';
    return 'behind';
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
    this.apiService.downloadTeamSchedulesPdf().subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF se generó vacío.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `reporte_horarios_${new Date().toISOString().slice(0, 10)}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('Reporte PDF descargado');
      },
      error: (err) => {
        console.error('[ReporteHoras] Error downloading report:', err);
        this.toastService.error('Error al descargar el reporte');
      }
    });
  }

  downloadMemberReport(userId: number): void {
    this.apiService.downloadTeamSchedulesPdf(userId).subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF individual se generó vacío.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `horario_usuario_${userId}_${new Date().toISOString().slice(0, 10)}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('Horario individual descargado');
      },
      error: (err) => {
        console.error('[ReporteHoras] Error downloading member report:', err);
        this.toastService.error('Error al descargar el horario individual');
      }
    });
  }

  printReport(): void {
    this.toastService.info('Imprimiendo reporte...');
    window.print();
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

  // ========== TEAM CALCULATIONS ==========
  getTeamTotalHours(team: TeamReport): number {
    return team.members.reduce((sum, member) => sum + member.totalHours, 0);
  }

  getTeamAverageHours(team: TeamReport): number {
    if (team.members.length === 0) return 0;
    return Math.round(this.getTeamTotalHours(team) / team.members.length * 10) / 10;
  }

  getTeamOpeningShifts(team: TeamReport): number {
    return team.members.reduce((sum, member) => sum + member.openingShifts, 0);
  }

  getTeamClosingShifts(team: TeamReport): number {
    return team.members.reduce((sum, member) => sum + member.closingShifts, 0);
  }

  executeFooterAction(action: () => void): void {
    action();
  }
}
