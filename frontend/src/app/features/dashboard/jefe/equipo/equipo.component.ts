import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

// ============= INTERFACES =============
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  hours?: number;
  scheduled?: boolean;
  avatar?: string;
}

interface MemberAction {
  label: string;
  icon: string;
  action: (member: TeamMember) => void;
  class: string;
  title: string;
}

interface FilterOption {
  value: string;
  label: string;
}

// ============= COMPONENT =============
@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 w-full">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-title-lg font-bold text-on-surface">Mi Equipo</h2>
        <p class="text-body-md text-secondary">Gestiona los miembros de tu equipo</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p class="text-secondary text-sm">Cargando miembros del equipo...</p>
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

      <!-- Filters Section -->
      <ng-container *ngIf="!loading && !error">
        <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex gap-4 flex-col md:flex-row">
          <!-- Search Input -->
          <div class="flex-1 flex items-center gap-2 bg-surface-container-lowest rounded-lg px-4 py-2 border border-outline-variant/20">
            <span class="material-symbols-outlined text-secondary text-xl">search</span>
            <input
              type="text"
              placeholder="Buscar miembro..."
              (input)="onSearch($event)"
              class="flex-1 bg-transparent outline-none text-on-surface placeholder-secondary text-sm"
            />
          </div>

          <!-- Filter by Role -->
          <select
            (change)="onFilterChange($event)"
            class="px-4 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant/20 text-on-surface font-medium text-sm"
          >
            <option *ngFor="let option of filterOptions" [value]="option.value">{{ option.label }}</option>
          </select>
        </div>

        <!-- Team Members List -->
        <div class="space-y-2">
          <div *ngIf="filteredMembers.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-secondary text-5xl mb-3 block opacity-50">person_search</span>
            <p class="text-secondary font-medium">No se encontraron miembros del equipo</p>
          </div>

          <!-- Member Item -->
          <div
            *ngFor="let member of filteredMembers"
            class="group/item bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div class="flex items-center gap-4 flex-1">
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {{ getAvatarInitials(member.name) }}
              </div>

              <!-- Member Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-title-sm font-bold text-on-surface truncate">{{ member.name }}</h3>
                <p class="text-body-sm text-secondary truncate">{{ member.email }}</p>
                <div class="flex gap-2 mt-1">
                  <span class="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[0.6rem] font-bold rounded uppercase tracking-wider">
                    {{ member.role }}
                  </span>
                  <span
                    *ngIf="member.scheduled"
                    class="inline-block px-2 py-0.5 bg-green-500/10 text-green-700 text-[0.6rem] font-bold rounded uppercase tracking-wider"
                  >
                    Programado
                  </span>
                </div>
              </div>

              <!-- Hours Info -->
              <div class="text-right hidden md:block pr-4">
                <p class="text-title-sm font-bold text-on-surface">{{ member.hours || 0 }}h</p>
                <p class="text-body-xs text-secondary">Esta semana</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                *ngFor="let action of memberActions"
                (click)="executeAction(action.action, member)"
                [class]="action.class"
                [title]="action.title"
              >
                <span class="material-symbols-outlined text-lg">{{ action.icon }}</span>
              </button>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./equipo.component.css'],
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EquipoComponent implements OnInit {
  // ========== STATE ==========
  teamMembers: TeamMember[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  filterRole = 'all';
  
  memberActions: MemberAction[] = [];
  filterOptions: FilterOption[] = [];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  // ========== LIFECYCLE ==========
  ngOnInit(): void {
    this.initializeFilters();
    this.initializeMemberActions();
    this.loadTeamMembers();
  }

  // ========== INITIALIZATION ==========
  private initializeFilters(): void {
    this.filterOptions = [
      { value: 'all', label: 'Todos los roles' },
      { value: 'trabajador', label: 'Trabajadores' },
      { value: 'jefe', label: 'Jefes' }
    ];
  }

  private initializeMemberActions(): void {
    this.memberActions = [
      {
        label: 'Ver detalles',
        icon: 'visibility',
        action: (member) => this.viewMemberDetails(member),
        class: 'p-2 hover:bg-primary/10 text-primary rounded-full transition-all',
        title: 'Ver detalles'
      },
      {
        label: 'Editar',
        icon: 'edit',
        action: (member) => this.editMember(member),
        class: 'p-2 hover:bg-blue-500/10 text-blue-500 rounded-full transition-all',
        title: 'Editar'
      },
      {
        label: 'Eliminar',
        icon: 'delete',
        action: (member) => this.removeMember(member),
        class: 'p-2 hover:bg-error/10 text-error rounded-full transition-all',
        title: 'Eliminar del equipo'
      }
    ];
  }

  // ========== DATA LOADING ==========
  private loadTeamMembers(): void {
    this.apiService.getUsers().subscribe({
      next: (users: any[]) => {
        this.teamMembers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading team members:', err);
        this.error = 'Error cargando miembros del equipo';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }

  // ========== FILTERING ==========
  get filteredMembers(): TeamMember[] {
    return this.teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.filterRole === 'all' || member.role === this.filterRole;
      return matchesSearch && matchesRole;
    });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
  }

  onFilterChange(event: any): void {
    this.filterRole = event.target.value;
  }

  // ========== MEMBER ACTIONS ==========
  viewMemberDetails(member: TeamMember): void {
    this.toastService.info(`Ver detalles de ${member.name}`);
  }

  editMember(member: TeamMember): void {
    this.toastService.info(`Editar ${member.name}`);
  }

  removeMember(member: TeamMember): void {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${member.name} del equipo?`)) {
      this.toastService.warning(`Eliminando ${member.name}...`);
    }
  }

  executeAction(action: (member: TeamMember) => void, member: TeamMember): void {
    action(member);
  }

  // ========== UTILITIES ==========
  getAvatarInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
