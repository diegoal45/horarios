import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Team } from '../../../../core/models/team.model';
import { ScheduleViewerComponent } from './schedule-viewer.component';

@Component({
  selector: 'app-schedule-generator',
  standalone: true,
  imports: [CommonModule, ScheduleViewerComponent],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Generar Horarios</h2>
        <p class="text-body-md text-secondary">Genera horarios automáticos para tu equipo</p>
      </div>

      <!-- Teams List - Only show if not viewing schedules -->
      <ng-container *ngIf="!viewingSchedules">
        <div class="space-y-4">
          <div *ngIf="teams.length === 0" class="text-center py-8 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">groups</span>
            <p class="text-secondary font-medium">No tienes equipos para generar horarios</p>
          </div>

          <div *ngFor="let team of teams" class="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 flex flex-col gap-4">
            <!-- Team Header -->
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-title-md font-bold text-on-surface">{{ team.name }}</h3>
                <p class="text-body-sm text-secondary">{{ team.members.length }}/{{ team.max_members }} miembros</p>
              </div>
              <div class="text-right">
                <div *ngIf="team.members.length === team.max_members" class="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-700 rounded-full text-xs font-bold">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Equipo lleno
                </div>
                <div *ngIf="team.members.length < team.max_members" class="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 text-warning rounded-full text-xs font-bold">
                  <span class="material-symbols-outlined text-sm">info</span>
                  {{ team.max_members - team.members.length }} falta
                </div>
              </div>
            </div>

            <!-- Members List (condensed) -->
            <div class="flex flex-wrap gap-2">
              <div *ngFor="let member of team.members" class="flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full text-xs">
                <span class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[0.65rem] font-bold">
                  {{ member.name.charAt(0) }}
                </span>
                {{ member.name }}
              </div>
            </div>

            <!-- Status & Actions -->
            <div class="flex gap-3 pt-4 border-t border-outline-variant/10">
              <button
                *ngIf="team.members.length === team.max_members"
                (click)="generateSchedules(team.id)"
                [disabled]="loadingTeamId === team.id"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:scale-[0.98] disabled:opacity-50 transition-transform font-bold text-sm"
              >
                <span class="material-symbols-outlined" *ngIf="loadingTeamId !== team.id">auto_awesome</span>
                <span class="material-symbols-outlined animate-spin" *ngIf="loadingTeamId === team.id">hourglass_empty</span>
                {{ loadingTeamId === team.id ? 'Generando...' : 'Generar Horarios' }}
              </button>

              <button
                *ngIf="team.members.length < team.max_members"
                disabled
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-highest text-secondary rounded-lg opacity-50 cursor-not-allowed font-bold text-sm"
                title="El equipo debe tener 6 miembros"
              >
                <span class="material-symbols-outlined">lock</span>
                Equipo incompleto
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Schedule Viewer - Show after generation -->
      <ng-container *ngIf="viewingSchedules && selectedTeamId">
        <app-schedule-viewer
          [teamId]="selectedTeamId"
          [weekStart]="weekStart"
          (cancelled)="onViewerCancelled()"
          (published)="onSchedulesPublished()"
        ></app-schedule-viewer>
      </ng-container>
    </div>
  `,
  styles: []
})
export class ScheduleGeneratorComponent implements OnInit {
  teams: Team[] = [];
  loadingTeamId: number | null = null;
  viewingSchedules = false;
  selectedTeamId: number | null = null;
  weekStart: string = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLedTeams();
  }

  private loadLedTeams(): void {
    this.apiService.getLedTeams().subscribe({
      next: (response: any) => {
        console.log('[ScheduleGenerator] getLedTeams response:', response);
        // Handle both direct array and wrapped response
        const teams = Array.isArray(response) ? response : (response.data || []);
        console.log('[ScheduleGenerator] Teams count:', teams.length, 'Teams data:', teams);
        this.teams = teams.map((team: any) => ({
          ...team,
          // Ensure members is always an array
          members: team.members || [],
          max_members: team.max_members || 6
        }));
        console.log('[ScheduleGenerator] Processed teams:', this.teams);
      },
      error: (err) => {
        console.error('[ScheduleGenerator] Error loading led teams:', err);
        this.toastService.error('Error cargando equipos');
      }
    });
  }

  generateSchedules(teamId: number): void {
    console.log('[ScheduleGenerator] generateSchedules called for team:', teamId);
    this.loadingTeamId = teamId;
    this.apiService.generateSchedules(teamId).subscribe({
      next: (response) => {
        console.log('[ScheduleGenerator] Generate response:', response);
        this.toastService.success('Horarios generados exitosamente');
        this.selectedTeamId = teamId;
        // Calculate Monday of current week (matching backend's startOfWeek())
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        const monday = new Date(now.setDate(diff));
        this.weekStart = monday.toISOString().split('T')[0];
        console.log('[ScheduleGenerator] Setting viewingSchedules=true, selectedTeamId:', this.selectedTeamId, 'weekStart:', this.weekStart);
        this.viewingSchedules = true;
        this.loadingTeamId = null;
      },
      error: (err) => {
        console.error('[ScheduleGenerator] Error generating schedules:', err);
        const errorMsg = err.error?.message || 'Error generando horarios';
        this.toastService.error(errorMsg);
        this.loadingTeamId = null;
      }
    });
  }

  onViewerCancelled(): void {
    this.viewingSchedules = false;
    this.selectedTeamId = null;
    this.loadLedTeams();
  }

  onSchedulesPublished(): void {
    this.viewingSchedules = false;
    this.selectedTeamId = null;
    this.toastService.success('Horarios publicados correctamente');
    this.loadLedTeams();
  }
}
