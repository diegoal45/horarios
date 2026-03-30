import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

interface Team {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader: { id: number; name: string; email: string };
  members: any[];
  max_members: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Leader {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Gestión de Equipos</h2>
        <p class="text-body-md text-secondary">Crea y administra los equipos de trabajo</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mb-2">
        <button *ngIf="currentUserRole === 'administrador'" (click)="openCreateTeamModal()" class="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold text-sm">
          <span class="material-symbols-outlined">add</span>
          Crear Equipo
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Cargando equipos...</p>
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

      <!-- Teams Grid -->
      <div *ngIf="!loading && !error" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Empty State -->
        <div *ngIf="teams.length === 0" class="col-span-full text-center py-12 bg-surface-container-low rounded-xl border border-outline-variant/10">
          <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">groups</span>
          <p class="text-secondary font-medium">No hay equipos creados</p>
        </div>

        <!-- Team Cards -->
        <div *ngFor="let team of teams" class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-title-sm font-bold text-on-surface">{{ team.name }}</h3>
              <p class="text-body-sm text-secondary">{{ team.description }}</p>
            </div>
            <div class="flex gap-2">
              <button (click)="downloadTeamSchedule(team)" class="p-2 hover:bg-primary/10 text-primary rounded-full transition-all" title="Descargar horario del equipo">
                <span class="material-symbols-outlined text-lg">download</span>
              </button>
              <button *ngIf="currentUserRole === 'administrador'" (click)="editTeam(team)" class="p-2 hover:bg-primary/10 text-primary rounded-full transition-all" title="Editar">
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button *ngIf="currentUserRole === 'administrador'" (click)="deleteTeam(team.id)" class="p-2 hover:bg-error/10 text-error rounded-full transition-all" title="Eliminar">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>

          <!-- Team Info -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary">Líder:</span>
              <span class="font-semibold text-on-surface">{{ team.leader.name || 'Sin asignar' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary">Miembros:</span>
              <span class="font-semibold text-on-surface">{{ team.members.length }}/{{ team.max_members }}</span>
            </div>
            <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div class="bg-primary h-full rounded-full transition-all" [style.width.%]="(team.members.length / team.max_members) * 100"></div>
            </div>
          </div>

          <!-- Members List -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <p class="text-[0.65rem] font-bold uppercase tracking-wider text-secondary">Miembros</p>
              <button *ngIf="team.members.length < team.max_members" (click)="openAddMemberModal(team)" class="text-[0.75rem] px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-all font-bold">
                Agregar
              </button>
            </div>
            <div class="space-y-1 max-h-40 overflow-y-auto">
              <div *ngFor="let member of team.members" class="flex justify-between items-center bg-surface-container-highest p-2 rounded text-sm">
                <span class="text-on-surface">{{ member.name }}</span>
                <button (click)="removeMember(team.id, member.id)" class="p-1 hover:bg-error/10 text-error rounded transition-all">
                  <span class="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <div *ngIf="team.members.length === 0" class="text-center py-2 text-secondary text-xs">Sin miembros</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Team Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-xl p-6 max-w-lg w-full mx-4 border border-outline-variant/10">
          <h3 class="text-title-md font-bold text-on-surface mb-4">{{ editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo' }}</h3>
          
          <form [formGroup]="teamForm" class="space-y-4">
            <!-- Nombre -->
            <div>
              <label class="text-sm font-bold text-on-surface mb-2 block">Nombre del Equipo *</label>
              <input 
                formControlName="name"
                type="text" 
                class="w-full px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="Ej: Equipo Turno Mañana"
              />
              <span *ngIf="teamForm.get('name')?.hasError('required') && teamForm.get('name')?.touched" class="text-error text-xs">
                Campo requerido
              </span>
            </div>

            <!-- Descripción -->
            <div>
              <label class="text-sm font-bold text-on-surface mb-2 block">Descripción</label>
              <textarea 
                formControlName="description"
                class="w-full px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                rows="3"
                placeholder="Descripción opcional del equipo"
              ></textarea>
            </div>

            <!-- Líder del Equipo -->
            <div>
              <label class="text-sm font-bold text-on-surface mb-2 block">Líder/Jefe del Equipo *</label>
              <select 
                formControlName="leader_id"
                class="w-full px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                <option value="" disabled>Selecciona un jefe...</option>
                <option *ngFor="let leader of availableLeaders" [value]="leader.id">{{ leader.name }} ({{ leader.email }})</option>
              </select>
              <span *ngIf="teamForm.get('leader_id')?.hasError('required') && teamForm.get('leader_id')?.touched" class="text-error text-xs">
                Campo requerido
              </span>
            </div>
          </form>

          <div class="flex gap-3 mt-6">
            <button (click)="closeModal()" class="flex-1 px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-all font-bold">
              Cancelar
            </button>
            <button (click)="saveTeam()" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:scale-[0.98] transition-transform font-bold">
              {{ editingTeam ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Member Modal -->
      <div *ngIf="showConfirmDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-xl p-6 max-w-sm w-full mx-4 border border-outline-variant/10">
          <div class="flex gap-3 mb-4">
            <span class="material-symbols-outlined text-error text-3xl flex-shrink-0">warning</span>
            <div>
              <h3 class="text-title-md font-bold text-on-surface">Remover Miembro</h3>
              <p class="text-body-sm text-secondary mt-1">¿Estás seguro que deseas remover a <span class="font-bold">{{ pendingDeleteMemberName }}</span>?</p>
            </div>
          </div>
          
          <p class="text-body-sm text-secondary/80 mb-6 bg-error/5 border border-error/10 rounded-lg p-3">
            Esta acción no se puede deshacer.
          </p>
          
          <div class="flex gap-3">
            <button (click)="closeConfirmDeleteModal()" class="flex-1 px-4 py-2 border border-outline-variant/20 text-on-surface rounded-lg hover:bg-surface-container transition-all font-bold">
              Cancelar
            </button>
            <button (click)="confirmDeleteMember()" class="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:scale-[0.98] transition-transform font-bold">
              Remover
            </button>
          </div>
        </div>
      </div>

      <!-- Add Member Modal -->
      <div *ngIf="showAddMemberModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-xl p-6 max-w-lg w-full mx-4 border border-outline-variant/10">
          <h3 class="text-title-md font-bold text-on-surface mb-4">Agregar Miembro a {{ selectedTeamForMember?.name }}</h3>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div *ngIf="availableUsers.length === 0" class="text-center py-6 text-secondary">
              No hay usuarios disponibles
            </div>

            <button 
              *ngFor="let user of availableUsers"
              (click)="addMember(user.id)"
              class="w-full flex justify-between items-center p-3 bg-surface-container-low border border-outline-variant/10 rounded-lg hover:bg-surface-container-highest transition-all text-left"
            >
              <div>
                <p class="font-semibold text-on-surface">{{ user.name }}</p>
                <p class="text-sm text-secondary">{{ user.email }}</p>
              </div>
              <span class="material-symbols-outlined text-primary">add_circle</span>
            </button>
          </div>

          <div class="flex gap-3 mt-6">
            <button (click)="closeAddMemberModal()" class="w-full px-4 py-2 border border-primary/20 text-primary rounded-lg hover:bg-primary/5 transition-all font-bold">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EquiposComponent implements OnInit {
  teams: Team[] = [];
  loading = true;
  error: string | null = null;
  
  showCreateModal = false;
  showAddMemberModal = false;
  showConfirmDeleteModal = false;
  editingTeam: Team | null = null;
  selectedTeamForMember: Team | null = null;
  availableUsers: User[] = [];
  availableLeaders: Leader[] = [];
  
  // For delete confirmation
  pendingDeleteTeamId: number | null = null;
  pendingDeleteUserId: number | null = null;
  pendingDeleteMemberName: string | null = null;
  
  teamForm: FormGroup;
  currentUserId: number | null = null;
  currentUserRole: string | null = null;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      leader_id: ['', Validators.required]
    });

    // Get current user ID and role
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.currentUserRole = user.role;
      }
    });
  }

  ngOnInit(): void {
    this.loadAvailableLeaders();
    this.loadTeams();
  }

  private loadAvailableLeaders(): void {
    forkJoin({
      users: this.apiService.getUsers(),
      teams: this.apiService.getTeams()
    }).subscribe({
      next: (result) => {
        const jefes = result.users.filter((u: User) => u.role === 'jefe');
        const ledTeamIds = result.teams.map((t: any) => t.leader_id);
        this.availableLeaders = jefes.filter(jefe => !ledTeamIds.includes(jefe.id));
      },
      error: (err) => {
        console.error('Error loading available leaders:', err);
        this.toastService.error('Error al cargar los jefes disponibles');
      }
    });
  }

  loadTeams(): void {
    this.loading = true;
    this.apiService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.error = 'Error al cargar los equipos';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }

  openCreateTeamModal(): void {
    this.editingTeam = null;
    this.teamForm.reset();
    this.loadAvailableLeaders();
    this.showCreateModal = true;
  }

  editTeam(team: Team): void {
    this.editingTeam = team;
    this.teamForm.patchValue({
      name: team.name,
      description: team.description,
      leader_id: team.leader_id
    });
    this.loadAvailableLeaders();
    this.showCreateModal = true;
  }

  saveTeam(): void {
    if (!this.teamForm.valid) {
      this.toastService.error('Completa todos los campos requeridos');
      return;
    }

    const data = this.teamForm.value;
    data.max_members = 6; // Always set to 6
    
    if (this.editingTeam) {
      this.apiService.updateTeam(this.editingTeam.id, data).subscribe({
        next: () => {
          this.toastService.success(`Equipo "${data.name}" actualizado`);
          this.closeModal();
          this.loadAvailableLeaders();
          this.loadTeams();
        },
        error: (err) => {
          console.error('Error updating team:', err);
          this.toastService.error('Error al actualizar el equipo');
        }
      });
    } else {
      this.apiService.createTeam(data).subscribe({
        next: (response) => {
          this.toastService.success(`Equipo "${data.name}" creado`);
          this.closeModal();
          this.loadAvailableLeaders();
          this.loadTeams();
        },
        error: (err) => {
          console.error('Error creating team:', err);
          this.toastService.error(err.error?.message || 'Error al crear el equipo');
        }
      });
    }
  }

  deleteTeam(teamId: number): void {
    if (confirm('¿Estás seguro que deseas eliminar este equipo?')) {
      this.apiService.deleteTeam(teamId).subscribe({
        next: () => {
          this.toastService.success('Equipo eliminado');
          this.loadTeams();
        },
        error: (err) => {
          console.error('Error deleting team:', err);
          this.toastService.error('Error al eliminar el equipo');
        }
      });
    }
  }

  openAddMemberModal(team: Team): void {
    this.selectedTeamForMember = team;
    this.loadAvailableUsers(team);
    this.showAddMemberModal = true;
  }

  loadAvailableUsers(team: Team): void {
    forkJoin({
      users: this.apiService.getUsers(),
      teams: this.apiService.getTeams()
    }).subscribe({
      next: (result) => {
        // Get all user IDs that are already in any team
        const usersInTeams = new Set<number>();
        result.teams.forEach(t => {
          t.members.forEach((m: any) => {
            usersInTeams.add(m.id);
          });
        });

        // Filter: trabajador role, not in current team, and not in any other team
        this.availableUsers = result.users.filter(
          user => user.role === 'trabajador' 
            && !team.members.some(m => m.id === user.id)
            && !usersInTeams.has(user.id)
        );
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.toastService.error('Error al cargar usuarios');
      }
    });
  }

  addMember(userId: number): void {
    if (!this.selectedTeamForMember) return;

    this.apiService.addTeamMember(this.selectedTeamForMember.id, userId).subscribe({
      next: () => {
        this.toastService.success('Miembro agregado al equipo');
        this.closeAddMemberModal();
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error adding member:', err);
        this.toastService.error(err.error?.message || 'Error al agregar miembro');
      }
    });
  }

  removeMember(teamId: number, userId: number): void {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;
    
    const member = team.members.find(m => m.id === userId);
    if (!member) return;
    
    this.pendingDeleteTeamId = teamId;
    this.pendingDeleteUserId = userId;
    this.pendingDeleteMemberName = member.name;
    this.showConfirmDeleteModal = true;
  }
  
  confirmDeleteMember(): void {
    if (this.pendingDeleteTeamId === null || this.pendingDeleteUserId === null) return;
    
    this.apiService.removeTeamMember(this.pendingDeleteTeamId, this.pendingDeleteUserId).subscribe({
      next: () => {
        this.toastService.success('Miembro removido del equipo');
        this.closeConfirmDeleteModal();
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error removing member:', err);
        this.toastService.error('Error al remover miembro');
      }
    });
  }
  
  closeConfirmDeleteModal(): void {
    this.showConfirmDeleteModal = false;
    this.pendingDeleteTeamId = null;
    this.pendingDeleteUserId = null;
    this.pendingDeleteMemberName = null;
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingTeam = null;
    this.teamForm.reset();
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.selectedTeamForMember = null;
    this.availableUsers = [];
  }

  downloadTeamSchedule(team: Team): void {
    if (!team?.id) {
      this.toastService.error('No se pudo identificar el equipo para descargar su horario');
      return;
    }

    this.apiService.downloadTeamSchedulesByTeamPdf(team.id).subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF del equipo se generó vacío');
          return;
        }

        const contentDisposition = response.headers.get('content-disposition') || '';
        const filename = contentDisposition.match(/filename="?([^\";]+)"?/)?.[1]
          || `horarios_equipo_${team.id}_${new Date().toISOString().slice(0, 10)}.pdf`;

        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.toastService.success(`Horario de ${team.name} descargado`);
      },
      error: (err) => {
        console.error('[Equipos] Error downloading team schedule:', err);
        this.toastService.error('Error al descargar el horario del equipo');
      }
    });
  }
}
