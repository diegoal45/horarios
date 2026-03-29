import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { EmployeeListComponent } from './equipo/employee-list.component';
import { ScheduleCalendarComponent } from './schedule-calendar.component';

// ============= INTERFACES =============
interface TeamStats {
  totalMembers: number;
  averageHours: number;
  totalHours: number;
  completionPercentage: number;
}

interface Employee {
  id: string | number;
  name: string;
  role?: string;
  hours?: number;
  weeklyHours?: number;
  scheduled?: boolean;
}

interface KPICard {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary';
  subtitle?: string;
  percentage?: number;
  maxValue?: number;
}

interface TeamAction {
  label: string;
  icon: string;
  action: () => void;
  isPrimary: boolean;
}

// ============= COMPONENT =============
@Component({
  selector: 'app-jefe-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EmployeeListComponent, ScheduleCalendarComponent],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Cargando información del equipo...</p>
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

      <!-- Main Content -->
      <ng-container *ngIf="!loading && !error">
        <div class="flex gap-8">
          <app-employee-list [teamEmployees]="allTeamEmployees" (employeeSelected)="onEmployeeSelected($event)" (employeeDeleted)="onEmployeeDeleted($event)"></app-employee-list>
          <section class="flex-1 flex flex-col gap-6">
            <!-- Team Actions -->
            <div *ngIf="teamActions.length > 0" class="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 class="text-title-md font-bold text-on-surface">Acciones de Equipo</h2>
                <p class="text-body-sm text-secondary">Gestiona la planificación global de todos los miembros.</p>
              </div>
              <div class="flex gap-4">
                <button *ngFor="let action of teamActions" (click)="executeAction(action.action)" [class.bg-primary/10]="!action.isPrimary" [class.text-primary]="!action.isPrimary" [class.bg-primary]="action.isPrimary" [class.text-white]="action.isPrimary" [class.shadow-lg]="action.isPrimary" [class.shadow-primary/20]="action.isPrimary" [class.hover:scale-\[0.98\]]="action.isPrimary" [class.hover:bg-primary/20]="!action.isPrimary" class="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-sm">
                  <span class="material-symbols-outlined text-lg">{{ action.icon }}</span>
                  <span>{{ action.label }}</span>
                </button>
              </div>
            </div>

            <!-- KPI Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ng-container *ngFor="let card of kpiCards">
                <!-- Card without Progress Bar -->
                <div *ngIf="!card.percentage" class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 flex items-center gap-4">
                  <div [class.bg-secondary-container]="card.color === 'secondary'" [class.text-on-secondary-container]="card.color === 'secondary'" [class.bg-primary/10]="card.color === 'primary'" [class.text-primary]="card.color === 'primary'" class="w-12 h-12 rounded-full flex items-center justify-center">
                    <span class="material-symbols-outlined">{{ card.icon }}</span>
                  </div>
                  <div>
                    <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">{{ card.title }}</p>
                    <p class="text-2xl font-bold text-on-surface">{{ card.value }}</p>
                  </div>
                </div>

                <!-- Card with Progress Bar -->
                <div *ngIf="card.percentage" class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">{{ card.icon }}</span>
                      </div>
                      <div>
                        <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">{{ card.title }}</p>
                        <p class="text-lg font-bold text-on-surface">{{ card.value }} <span class="text-secondary font-medium text-sm">/ {{ card.maxValue }}h</span></p>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{{ card.percentage }}%</span>
                  </div>
                  <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full transition-all" [style.width.%]="card.percentage"></div>
                  </div>
                </div>
              </ng-container>
            </div>

            <!-- Calendar -->
            <app-schedule-calendar [selectedEmployee]="selectedEmployee"></app-schedule-calendar>

            <!-- Footer Toolbar -->
            <div class="px-8 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10 rounded-xl">
              <div class="flex gap-4">
                <button *ngFor="let action of footerActions | slice:0:2" (click)="executeAction(action.action)" class="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-lg transition-all text-sm">
                  <span class="material-symbols-outlined text-lg">{{ action.icon }}</span>
                  <span>{{ action.label }}</span>
                </button>
              </div>
              <button *ngFor="let action of footerActions | slice:2:3" (click)="executeAction(action.action)" class="bg-white border border-primary/20 text-primary px-6 py-2 rounded-lg hover:bg-primary/5 transition-all font-bold text-sm">
                {{ action.label }} {{ selectedEmployee ? '(' + selectedEmployee.name + ')' : '' }}
              </button>
            </div>
          </section>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./jefe-dashboard.component.css']
})
export class JefeDashboardComponent implements OnInit {
  // ========== STATE ==========
  teamStats: TeamStats = {
    totalMembers: 0,
    averageHours: 0,
    totalHours: 0,
    completionPercentage: 0
  };

  selectedEmployee: Employee | null = null;
  selectedEmployeeHours = 0;
  allTeamEmployees: any[] = []; // Empleados con horas cargadas

  loading = true;
  error: string | null = null;

  kpiCards: KPICard[] = [];
  teamActions: TeamAction[] = [];
  footerActions: Array<{ label: string; icon: string; action: () => void; isPrimary: boolean }> = [];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    console.log('[JefeDashboard] ngOnInit started');
    this.initializeActions();
    this.loadTeamStats();
    console.log('[JefeDashboard] ngOnInit completed');
  }

  // ========== INITIALIZATION ==========
  private initializeActions(): void {
    // Team Actions - vacío porque el generador está en ruta separada
    this.teamActions = [];

    // Footer Actions
    this.footerActions = [
      {
        label: 'Imprimir Horario',
        icon: 'print',
        action: () => this.printSchedule(),
        isPrimary: false
      }
    ];
  }

  // ========== DATA LOADING ==========
  private loadTeamStats(): void {
    this.loading = true;
    
    // Load teams led by current user
    this.apiService.getLedTeams().subscribe({
      next: (teamsResponse: any) => {
        const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse.data || []);
        console.log('[JefeDashboard] Teams loaded:', teamsArray.length);
        
        if (teamsArray.length === 0) {
          this.teamStats = {
            totalMembers: 0,
            averageHours: 0,
            totalHours: 0,
            completionPercentage: 0
          };
          this.updateKPICards();
          this.loading = false;
          return;
        }

        // Get current week start
        const today = new Date();
        const weekStart = this.getWeekStart(today);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Build observable for each team's schedules
        const scheduleObservables: { [key: number]: any } = {};
        
        teamsArray.forEach((team: any) => {
          scheduleObservables[team.id] = this.apiService.getTeamSchedules(team.id, weekStartStr).pipe(
            catchError(err => {
              console.error('[JefeDashboard] Error loading schedules for team:', team.id, err);
              return of([]);
            })
          );
        });

        // Use forkJoin to wait for all team schedules to load
        forkJoin(scheduleObservables).subscribe({
          next: (allSchedules: any) => {
            console.log('[JefeDashboard] All schedules loaded');
            
            // Calculate totals from all teams
            let totalMembers = 0;
            let totalHours = 0;
            let memberCount = 0;
            const allMembers: any[] = [];
            const memberHoursMap: { [key: number]: number } = {};

            teamsArray.forEach((team: any) => {
              const schedules = allSchedules[team.id] || [];
              totalMembers += team.members?.length || 0;
              
              // Build list of all members with their hours
              team.members?.forEach((member: any) => {
                const memberSchedules = schedules.filter((s: any) => s.user_id === member.id);
                const memberTotalHours = memberSchedules.reduce((sum: number, s: any) => sum + (s.total_hours || 0), 0);
                
                allMembers.push({
                  id: member.id,
                  name: member.name,
                  email: member.email,
                  role: member.role || 'trabajador',
                  weeklyHours: memberTotalHours
                });
                
                memberHoursMap[member.id] = memberTotalHours;
                totalHours += memberTotalHours;
                memberCount++;
              });
            });

            const averageHours = memberCount > 0 ? Math.round((totalHours / memberCount) * 10) / 10 : 0;

            this.teamStats = {
              totalMembers: totalMembers,
              averageHours: averageHours,
              totalHours: Math.round(totalHours * 10) / 10,
              completionPercentage: totalMembers > 0 ? 100 : 0
            };

            // Guardar empleados con horas para pasar al employee-list
            this.allTeamEmployees = allMembers;
            console.log('[JefeDashboard] All team employees with hours:', this.allTeamEmployees);

            // Pre-seleccionar el primer usuario del equipo
            if (allMembers.length > 0) {
              this.selectedEmployee = allMembers[0];
              this.selectedEmployeeHours = allMembers[0].weeklyHours;
              console.log('[JefeDashboard] Pre-selected first employee:', this.selectedEmployee?.name, 'hours:', this.selectedEmployeeHours);
            }

            console.log('[JefeDashboard] Team stats:', this.teamStats);
            console.log('[JefeDashboard] All members:', allMembers);
            this.updateKPICards();
            this.loading = false;
          },
          error: (err) => {
            console.error('[JefeDashboard] Error in forkJoin:', err);
            this.error = 'Error cargando datos de horarios';
            this.loading = false;
            this.toastService.error(this.error);
          }
        });
      },
      error: (err) => {
        console.error('[JefeDashboard] Error loading teams:', err);
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

  private updateKPICards(): void {
    console.log('[JefeDashboard] updateKPICards called - teamStats:', this.teamStats, 'selectedEmployeeHours:', this.selectedEmployeeHours, 'selectedEmployee:', this.selectedEmployee?.name);
    this.kpiCards = [
      {
        title: 'Horas Totales Equipo',
        value: `${this.teamStats.totalHours}h`,
        icon: 'group',
        color: 'secondary'
      },
      {
        title: `Horas ${this.selectedEmployee?.name || 'Empleado'}`,
        value: `${this.selectedEmployeeHours}h`,
        subtitle: '/ 44h',
        icon: 'person',
        color: 'primary',
        percentage: this.getEmployeePercentage(),
        maxValue: 44
      }
    ];
    console.log('[JefeDashboard] kpiCards updated:', this.kpiCards);
  }

  // ========== CALCULATIONS ==========
  private calculateAverageHours(users: any[]): number {
    if (users.length === 0) return 0;
    const total = users.reduce((sum, user) => sum + (user.hours || 0), 0);
    return Math.round((total / users.length) * 10) / 10;
  }

  private calculateTotalHours(users: any[]): number {
    return users.reduce((sum, user) => sum + (user.hours || 0), 0);
  }

  private calculateCompletionPercentage(users: any[]): number {
    if (users.length === 0) return 0;
    const scheduledUsers = users.filter(u => u.scheduled).length;
    return Math.round((scheduledUsers / users.length) * 100);
  }

  getEmployeePercentage(): number {
    if (this.selectedEmployeeHours === 0) return 0;
    return Math.round((this.selectedEmployeeHours / 44) * 100);
  }

  // ========== EVENT HANDLERS - EMPLOYEE ==========
  onEmployeeSelected(employee: Employee): void {
    console.log('[JefeDashboard] onEmployeeSelected:', employee);
    this.selectedEmployee = employee;
    this.selectedEmployeeHours = employee.weeklyHours || 0;
    console.log('[JefeDashboard] After selection - selectedEmployeeHours:', this.selectedEmployeeHours);
    this.updateKPICards();
  }

  onEmployeeDeleted(employeeId: string): void {
    this.toastService.success('Empleado eliminado del equipo');
    this.loadTeamStats();
  }

  // ========== EVENT HANDLERS - FOOTER ==========
  printSchedule(): void {
    window.print();
  }

  downloadReport(): void {
    console.log('[JefeDashboard] downloadReport called');
    console.log('[JefeDashboard] Starting PDF download...');

    if (!this.selectedEmployee?.id) {
      this.toastService.error('Selecciona un trabajador para descargar su horario.');
      return;
    }

    this.toastService.info('Generando reporte...');
    
    this.apiService.downloadTeamSchedulesPdf(this.selectedEmployee.id).subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF se generó vacío. Verifica que existan horarios cargados.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `horarios_${new Date().toISOString().slice(0, 10)}.pdf`;

        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toastService.success('Reporte descargado exitosamente');
      },
      error: (err) => {
        console.error('[JefeDashboard] Error downloading report:', err);
        console.error('[JefeDashboard] Error status:', err?.status);
        console.error('[JefeDashboard] Error message:', err?.message);
        console.error('[JefeDashboard] Full error:', err);
        
        if (err?.status === 401) {
          this.toastService.error('No autorizado. Por favor inicia sesión nuevamente');
        } else {
          this.toastService.error('Error al descargar reporte: ' + (err?.message || 'Error desconocido'));
        }
      }
    });
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

  private openPrintFallback(): void {
    window.print();
  }

  // ========== UTILITIES ==========
  executeAction(action: () => void): void {
    action();
  }
}
