import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { User } from '../../../../core/models';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Gestión de Usuarios</h1>
          <p class="text-slate-600 dark:text-slate-400 mt-1">Total: {{ filteredUsers().length }} de {{ users().length }} usuarios</p>
        </div>
        <button 
          (click)="openCreateModal()"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          <span class="material-symbols-outlined">add</span>
          Crear Usuario
        </button>
      </div>

      <!-- Filter Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <!-- Filtro por Nombre -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Buscar por Nombre</label>
          <div class="relative">
            <input 
              [(ngModel)]="searchName"
              (ngModelChange)="onFilterChange()"
              type="text" 
              placeholder="Ej: Juan Pérez"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          </div>
        </div>

        <!-- Filtro por Rol -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filtrar por Rol</label>
          <select 
            [(ngModel)]="selectedRole"
            (ngModelChange)="onFilterChange()"
            class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
          >
            <option value="">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="jefe">Jefe</option>
            <option value="trabajador">Trabajador</option>
          </select>
        </div>

        <!-- Botón Limpiar -->
        <div class="flex items-end">
          <button 
            *ngIf="searchName || selectedRole"
            (click)="clearFilters()"
            class="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading()" class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Nombre</th>
                <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Email</th>
                <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Rol</th>
                <th class="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Fecha de Creación</th>
                <th class="text-center px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers()" class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <td class="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">{{ user.name }}</td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold" [class]="getRoleClass(user.role)">
                    {{ user.role || 'Sin especificar' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {{ user.created_at | date: 'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      (click)="openEditModal(user)"
                      class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      (click)="confirmDelete(user)"
                      class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <!-- Empty State dentro de la tabla -->
              <tr *ngIf="filteredUsers().length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <span class="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                    <div>
                      <p class="text-slate-600 dark:text-slate-400 font-medium">No se encontraron usuarios</p>
                      <p class="text-sm text-slate-400 dark:text-slate-500">Intenta con otros criterios de búsqueda</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && users().length === 0" class="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center border border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-5xl text-slate-300 mb-4 block">people_outline</span>
        <p class="text-slate-600 dark:text-slate-400 text-lg">No hay usuarios disponibles</p>
        <button 
          (click)="openCreateModal()"
          class="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Crear primer usuario
        </button>
      </div>

      <!-- User Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="closeModal()"></div>
        
        <!-- Modal -->
        <div class="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- Gradient accent line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-transparent"></div>
          
          <!-- Background blur effects -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <!-- Header -->
          <div class="relative z-10 flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {{ isEditing() ? 'Editar' : 'Crear' }} Usuario
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {{ isEditing() ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema' }}
              </p>
            </div>
            <button 
              (click)="closeModal()" 
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="relative z-10 p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Nombre</label>
                <input 
                  type="text" 
                  formControlName="name" 
                  class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Juan Pérez"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Email</label>
                <input 
                  type="email" 
                  formControlName="email" 
                  class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="juan@example.com"
                />
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Rol</label>
                <select 
                  formControlName="role" 
                  class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="trabajador">Trabajador</option>
                  <option value="jefe">Jefe</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <!-- Contraseña (solo para crear) -->
              <div *ngIf="!isEditing()">
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Contraseña</label>
                <input 
                  type="password" 
                  formControlName="password" 
                  class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Min. 8 caracteres, 1 número y 1 carácter especial</p>
              </div>

              <!-- Botones -->
              <div class="flex gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <button 
                  type="button" 
                  (click)="closeModal()"
                  class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  [disabled]="!form.valid || isLoading()"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span *ngIf="isLoading()" class="inline-block animate-spin">⟳</span>
                  {{ isLoading() ? 'Guardando...' : (isEditing() ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirm()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="cancelDelete()"></div>
        
        <!-- Confirmation Dialog -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="p-8">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span class="material-symbols-outlined text-red-600">warning</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Eliminar Usuario</h3>
            </div>
            <p class="text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar a <strong>{{ userToDelete()?.name }}</strong>? Esta acción no se puede deshacer.
            </p>
            <div class="flex gap-3">
              <button 
                (click)="cancelDelete()"
                class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                (click)="deleteUser()"
                [disabled]="isLoading()"
                class="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span *ngIf="isLoading()" class="inline-block animate-spin">⟳</span>
                {{ isLoading() ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UsuariosComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  form!: FormGroup;
  userToDelete = signal<User | null>(null);
  editingUserId = signal<number | null>(null);
  
  // Filter signals
  searchName = signal<string>('');
  selectedRole = signal<string>('');
  
  // Computed filtered users
  filteredUsers = computed(() => {
    const name = this.searchName().toLowerCase();
    const role = this.selectedRole();
    
    return this.users().filter(user => {
      const nameMatch = user.name.toLowerCase().includes(name);
      const roleMatch = role === '' || user.role === role;
      return nameMatch && roleMatch;
    });
  });

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['trabajador', Validators.required],
      password: ['', [Validators.minLength(8)]]
    });
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.apiService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.toastService.error('Error al cargar usuarios');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.form.reset({ role: 'trabajador' });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user.id);
    this.form.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUserId.set(null);
    this.isEditing.set(false);
    this.form.reset();
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    let data = this.form.value;

    if (this.isEditing() && this.editingUserId()) {
      // No enviar password vacío cuando se edita
      if (!data.password) {
        delete data.password;
      }
      this.apiService.updateUser(this.editingUserId()!, data).subscribe({
        next: () => {
          this.toastService.success('Usuario actualizado exitosamente');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al actualizar usuario');
          this.isLoading.set(false);
        }
      });
    } else {
      this.apiService.createUser(data).subscribe({
        next: () => {
          this.toastService.success('Usuario creado exitosamente');
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al crear usuario');
          this.isLoading.set(false);
        }
      });
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.userToDelete.set(null);
  }

  deleteUser(): void {
    const user = this.userToDelete();
    if (!user?.id) return;

    this.isLoading.set(true);
    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`Usuario "${user.name}" eliminado exitosamente`);
        this.cancelDelete();
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al eliminar usuario');
        this.isLoading.set(false);
      }
    });
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'administrador':
        return 'bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-100';
      case 'jefe':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-100';
      case 'trabajador':
        return 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  onFilterChange(): void {
    // Filtro reactivo automático gracias a computed signal
    // Solo actualizamos los signals, computed se actualiza automáticamente
  }

  clearFilters(): void {
    this.searchName.set('');
    this.selectedRole.set('');
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
