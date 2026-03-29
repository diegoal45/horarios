import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

interface Employee {
  id: string | number;
  name: string;
  role: string;
  avatar?: string;
  hours?: number;
  weeklyHours?: number;
  scheduled?: boolean;
  email?: string;
}

interface Team {
  id: number;
  name: string;
  leader_id: number;
  members: Employee[];
  max_members: number;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-6 shrink-0">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-headline-md font-semibold text-on-surface">Mi Equipo</h2>
        <p class="text-body-md text-secondary">{{ currentTeam?.name || 'Selecciona un empleado para ver su detalle' }}</p>
      </div>

      <!-- Employee List -->
      <div class="bg-surface-container-low rounded-xl p-2 space-y-1 max-h-96 overflow-y-auto">
        <div *ngIf="filteredEmployees.length === 0" class="text-center py-8 text-secondary">
          <span class="material-symbols-outlined text-5xl opacity-20 block mb-2">people_outline</span>
          <p class="text-sm">No hay miembros en el equipo</p>
        </div>

        <div
          *ngFor="let employee of filteredEmployees"
          (click)="selectEmployee(employee)"
          [class.bg-surface-container-lowest]="selectedEmployee?.id === employee.id"
          [class.border-l-4]="selectedEmployee?.id === employee.id"
          [class.border-l-primary]="selectedEmployee?.id === employee.id"
          [class.shadow-sm]="selectedEmployee?.id === employee.id"
          class="group/item relative w-full flex items-center justify-between p-3 hover:bg-surface-container-high transition-colors rounded-lg text-left cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <img
              *ngIf="employee.avatar"
              [src]="employee.avatar"
              [alt]="employee.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div *ngIf="!employee.avatar" class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">person</span>
            </div>
            <div>
              <p class="text-title-md text-on-surface font-semibold">{{ employee.name }}</p>
              <span class="inline-block px-2 py-0.5 bg-surface-container-highest text-[0.65rem] font-bold text-secondary uppercase rounded tracking-wider">
                {{ employee.role }}
              </span>
            </div>
          </div>
          <button
            (click)="deleteEmployee($event, employee)"
            class="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-error/10 text-secondary hover:text-error rounded-full transition-all"
            title="Eliminar miembro del equipo"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>

        <!-- Add Member Button -->
        <button
          *ngIf="currentTeam && currentTeam.members.length < currentTeam.max_members"
          (click)="openAddMemberModal()"
          class="w-full flex items-center justify-center gap-2 mt-4 p-3 border-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold rounded-lg transition-all text-sm"
        >
          <span class="material-symbols-outlined">person_add</span>
          <span>Añadir Miembro</span>
        </button>

        <div *ngIf="currentTeam && currentTeam.members.length >= currentTeam.max_members" class="text-center py-2 text-warning text-xs font-semibold">
          ⚠️ Equipo lleno ({{ currentTeam.members.length }}/{{ currentTeam.max_members }})
        </div>
      </div>

      <!-- Weekly Summary -->
      <div class="bg-primary/5 rounded-xl p-5 border border-primary/10 flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-xl">analytics</span>
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Resumen Equipo</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-end">
            <span class="text-sm text-secondary font-medium">Miembros</span>
            <span class="text-xl font-bold text-on-surface">{{ filteredEmployees.length }}/{{ currentTeam?.max_members || 6 }}</span>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight text-secondary">
              <span>Capacidad</span>
              <span class="text-primary">{{ getCapacityPercentage() }}%</span>
            </div>
            <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                class="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(0,104,86,0.3)] transition-all"
                [style.width.%]="getCapacityPercentage()"
              ></div>
            </div>
          </div>
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
            <p class="text-body-sm text-secondary mt-1">¿Estás seguro que deseas remover a <span class="font-bold">{{ pendingDeleteEmployee?.name }}</span>?</p>
          </div>
        </div>
        
        <p class="text-body-sm text-secondary/80 mb-6 bg-error/5 border border-error/10 rounded-lg p-3">
          Esta acción no se puede deshacer.
        </p>
        
        <div class="flex gap-3">
          <button (click)="closeConfirmDeleteModal()" class="flex-1 px-4 py-2 border border-outline-variant/20 text-on-surface rounded-lg hover:bg-surface-container transition-all font-bold">
            Cancelar
          </button>
          <button (click)="confirmDeleteEmployee()" class="flex-1 px-4 py-2 bg-error text-white rounded-lg hover:scale-[0.98] transition-transform font-bold">
            Remover
          </button>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div *ngIf="showAddMemberModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-surface rounded-xl p-6 max-w-lg w-full mx-4 border border-outline-variant/10">
        <h3 class="text-title-md font-bold text-on-surface mb-4">Agregar Miembro al Equipo</h3>
        
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div *ngIf="availableUsers.length === 0" class="text-center py-6 text-secondary">
            No hay usuarios disponibles
          </div>

          <button 
            *ngFor="let user of availableUsers"
            (click)="addMemberToTeam(user.id)"
            class="w-full flex justify-between items-center p-3 bg-surface-container-low border border-outline-variant/10 rounded-lg hover:bg-surface-container-high transition-all text-left"
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
  `,
  styles: []
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  searchTerm = '';
  currentTeam: Team | null = null;
  currentUserId: number | null = null;
  availableUsers: any[] = [];
  showAddMemberModal = false;
  showConfirmDeleteModal = false;
  pendingDeleteEmployee: Employee | null = null;

  @Input() teamEmployees: any[] = [];
  @Output() employeeSelected = new EventEmitter<Employee>();
  @Output() employeeDeleted = new EventEmitter<string>();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[EmployeeList] ngOnInit - teamEmployees received:', this.teamEmployees);
    // Get current user
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadTeamData();
      }
    });
  }

  private loadTeamData(): void {
    this.apiService.getLedTeams().subscribe({
      next: (teams: any[]) => {
        if (teams.length > 0) {
          this.currentTeam = teams[0];
          
          // Si hay teamEmployees del Input (ya con horas cargadas), usarlos directamente
          if (this.teamEmployees && this.teamEmployees.length > 0) {
            console.log('[EmployeeList] Using input teamEmployees:', this.teamEmployees);
            this.filteredEmployees = this.teamEmployees;
          } else {
            // Si no, cargar sin horas (fallback)
            this.filteredEmployees = (this.currentTeam?.members || []).map(m => ({
              id: m.id,
              name: m.name,
              role: m.role || 'trabajador',
              email: m.email,
              avatar: m.avatar,
              hours: m.hours || 0,
              weeklyHours: 0, // NO pre-seleccionar sin horas
              scheduled: m.scheduled || false
            }));
          }
          
          // NO seleccionar automáticamente - dejar que el padre lo haga
          // if (this.filteredEmployees.length > 0) {
          //   this.selectEmployee(this.filteredEmployees[0]);
          // }
        }
      },
      error: (err) => {
        console.error('Error loading team data:', err);
        this.toastService.error('Error cargando datos del equipo');
      }
    });
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.employeeSelected.emit(employee);
  }

  deleteEmployee(event: Event, employee: Employee): void {
    event.stopPropagation();
    this.pendingDeleteEmployee = employee;
    this.showConfirmDeleteModal = true;
  }
  
  confirmDeleteEmployee(): void {
    if (!this.pendingDeleteEmployee || !this.currentTeam) return;
    
    this.apiService.removeTeamMember(this.currentTeam.id, Number(this.pendingDeleteEmployee.id)).subscribe({
      next: () => {
        this.toastService.success(`${this.pendingDeleteEmployee?.name} eliminado del equipo`);
        this.employeeDeleted.emit(String(this.pendingDeleteEmployee?.id));
        this.closeConfirmDeleteModal();
        this.loadTeamData();
      },
      error: (err) => {
        console.error('Error removing team member:', err);
        this.toastService.error('Error al eliminar miembro del equipo');
      }
    });
  }
  
  closeConfirmDeleteModal(): void {
    this.showConfirmDeleteModal = false;
    this.pendingDeleteEmployee = null;
  }

  openAddMemberModal(): void {
    this.loadAvailableUsers();
    this.showAddMemberModal = true;
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.availableUsers = [];
  }

  private loadAvailableUsers(): void {
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
        const memberIds = this.currentTeam?.members?.map(m => m.id) || [];
        this.availableUsers = result.users.filter(
          user => user.role === 'trabajador' 
            && !memberIds.includes(user.id)
            && !usersInTeams.has(user.id)
        );
      },
      error: (err) => {
        console.error('Error loading available users:', err);
        this.toastService.error('Error al cargar usuarios disponibles');
      }
    });
  }

  addMemberToTeam(userId: number): void {
    if (!this.currentTeam) {
      this.toastService.error('No hay equipo seleccionado');
      return;
    }

    console.log('Adding member - Current Team:', this.currentTeam);
    console.log('Current Team Leader ID:', this.currentTeam.leader_id);
    console.log('Current User ID:', this.currentUserId);

    this.apiService.addTeamMember(this.currentTeam.id, userId).subscribe({
      next: () => {
        this.toastService.success('Miembro agregado al equipo');
        this.closeAddMemberModal();
        this.loadTeamData();
      },
      error: (err) => {
        console.error('Error adding team member - Full error:', err);
        const errorMsg = err.error?.message || err.message || 'Error al agregar miembro';
        console.error('Error message:', errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }

  getCapacityPercentage(): number {
    if (!this.currentTeam) return 0;
    return Math.round((this.filteredEmployees.length / this.currentTeam.max_members) * 100);
  }
}
