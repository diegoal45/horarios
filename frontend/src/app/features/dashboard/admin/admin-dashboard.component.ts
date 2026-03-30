import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatCardComponent, type StatCard } from '../../../shared/components/stat-card.component';
import { EmployeeCardComponent, type Employee } from '../../../shared/components/employee-card.component';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';
import { ToastService } from '../../../shared/services/toast.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    EmployeeCardComponent
  ],
  template: `
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
      <div>
        <h2 class="text-slate-400 text-sm font-semibold uppercase tracking-[0.2em] mb-1">Panel de Control</h2>
        <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión Operativa</h1>
      </div>
      <div class="flex gap-3">
        <div class="flex -space-x-2">
          <img
            *ngFor="let avatar of teamAvatars().slice(0, 3)"
            [src]="avatar"
            alt="Team"
            class="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
          <div *ngIf="teamAvatars().length > 3" class="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
            +{{ teamAvatars().length - 3 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Row -->
    <div class="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-10">
      <!-- Metric Cards -->
      <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <app-stat-card *ngFor="let card of statCards()" [card]="card"></app-stat-card>
      </div>
    </div>

    <!-- Employees Section / Schedule View -->
    <section>
      <!-- List View Header -->
      <div *ngIf="currentView() === 'list'" class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 class="text-xl font-bold text-slate-900">Directorio de Empleados ({{ displayedEmployees().length }})</h3>
        <div class="flex items-center gap-3">
          <div class="flex-1 max-w-xs">
            <input 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              type="text" 
              placeholder="Buscar por nombre o rol..."
              class="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500">
          </div>
          <button 
            *ngIf="searchQuery()"
            (click)="clearSearch()"
            class="bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-slate-300 transition-colors">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Schedule View Header -->
      <div *ngIf="currentView() === 'schedule'" class="flex items-center gap-4 mb-6">
        <button 
          (click)="backToList()"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
        <div>
          <h3 class="text-xl font-bold text-slate-900">Horario de {{ selectedEmployee()?.name }}</h3>
          <p class="text-sm text-slate-500">{{ selectedEmployee()?.position }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>

      <!-- LIST VIEW -->
      <div *ngIf="!isLoading() && currentView() === 'list'" class="space-y-6">
        <div *ngIf="paginatedEmployees().length > 0; else noResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-employee-card 
            *ngFor="let employee of paginatedEmployees()" 
            [employee]="employee"
            (viewSchedule)="onViewSchedule($event)">
          </app-employee-card>
        </div>

        <!-- No Results Message -->
        <ng-template #noResults>
          <div class="text-center py-12">
            <span class="material-symbols-outlined text-5xl text-slate-300 mb-4 block">person_off</span>
            <p class="text-slate-500 text-lg">No se encontraron empleados</p>
          </div>
        </ng-template>

        <!-- Pagination Controls -->
        <div *ngIf="totalPages() > 1" class="flex items-center justify-between mt-8 p-4 bg-white rounded-lg border border-slate-200">
          <div class="text-sm text-slate-600">
            Mostrando <span class="font-semibold">{{ currentPage() * itemsPerPage - itemsPerPage + 1 }}</span> 
            a 
            <span class="font-semibold">{{ Math.min(currentPage() * itemsPerPage, displayedEmployees().length) }}</span> 
            de 
            <span class="font-semibold">{{ displayedEmployees().length }}</span> empleados
          </div>
          <div class="flex items-center gap-2">
            <button 
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div class="flex gap-1">
              <button 
                *ngFor="let page of getPageNumbers()"
                (click)="goToPage(page)"
                [class.bg-teal-600]="page === currentPage()"
                [class.text-white]="page === currentPage()"
                [class.bg-white]="page !== currentPage()"
                [class.text-slate-700]="page !== currentPage()"
                class="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-300 hover:bg-slate-50 transition-colors">
                {{ page }}
              </button>
            </div>
            <button 
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SCHEDULE VIEW -->
      <div *ngIf="!isLoading() && currentView() === 'schedule' && selectedEmployee()" class="bg-white rounded-xl border border-slate-200 p-8">
        <div class="space-y-6">
          <!-- Employee Info -->
          <div class="flex items-center gap-4 pb-6 border-b border-slate-200">
            <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
              <img [src]="selectedEmployee()!.avatar" [alt]="selectedEmployee()!.name" class="w-full h-full object-cover">
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-900">{{ selectedEmployee()!.name }}</h4>
              <p class="text-slate-600">{{ selectedEmployee()!.position }}</p>
              <p class="text-sm text-slate-500">Desde: {{ selectedEmployee()!.seniority }}</p>
            </div>
          </div>

          <!-- Schedule Loading State -->
          <div *ngIf="isLoadingSchedule()" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>

          <!-- No Schedules Message -->
          <div *ngIf="!isLoadingSchedule() && employeeSchedules().length === 0" class="text-center py-8 text-slate-500">
            No tiene horarios publicados.
          </div>

          <!-- Schedule Table -->
          <div *ngIf="!isLoadingSchedule() && employeeSchedules().length > 0" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-slate-700">Día</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-700">Entrada</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-700">Salida</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
                  <th class="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sched of employeeSchedules()">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ sched.day || '-' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ sched.start_time || '-' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ sched.end_time || '-' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ sched.hours || '-' }}</td>
                  <td class="px-4 py-3">
                    <span *ngIf="sched.status === 'published' || sched.status === 'Publicado'" class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Publicado</span>
                    <span *ngIf="sched.status !== 'published' && sched.status !== 'Publicado'" class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Borrador</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
    employeeSchedules = signal<any[]>([]);
    isLoadingSchedule = signal<boolean>(false);
  statCards = signal<StatCard[]>([
    {
      icon: 'groups',
      iconBgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      label: 'Total Usuarios',
      value: '0',
      trend: 'Cargando...',
      trendColor: 'teal'
    },
    {
      icon: 'bolt',
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      label: 'Equipos Totales',
      value: '0',
      trend: 'En tiempo real',
      trendColor: 'amber'
    }
  ]);

  employees = signal<Employee[]>([]);
  teamAvatars = signal<string[]>([]);
  isLoading = signal(true);
  filteredEmployees = signal<Employee[]>([]);
  showFilters = signal(false);
  filterRole = signal<string>('');
  searchQuery = signal<string>('');
  
  // Vista actual
  currentView = signal<'list' | 'schedule'>('list');
  selectedEmployee = signal<Employee | null>(null);
  
  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = 6;
  
  // Computed signals para datos a mostrar (filtrados o todos)
  displayedEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase();
    
    if (!query) {
      return this.employees();
    }
    
    return this.employees().filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.position.toLowerCase().includes(query)
    );
  });
  
  // Computed signals para paginación
  totalPages = computed(() => {
    const total = this.displayedEmployees().length;
    return Math.ceil(total / this.itemsPerPage);
  });

  paginatedEmployees = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.displayedEmployees().slice(start, end);
  });

  // Math object para usar en template
  Math = Math;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    console.log('%c[Dashboard] ngOnInit ejecutado', 'color: blue; font-weight: bold');
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    console.log('%c[Dashboard] Iniciando carga de datos...', 'color: green; font-weight: bold');
    console.log('%c[Dashboard] URL API:', 'color: orange', 'http://localhost:8000/api');
    
    // Cargar usuarios
    console.log('%c[Dashboard] Llamando a getUsers()...', 'color: purple');
    this.apiService.getUsers().subscribe({
      next: (users: User[]) => {
        console.log('%c[Dashboard] ✅ Usuarios cargados exitosamente:', 'color: green; font-weight: bold', users);
        // Convertir usuarios a formato Employee
        const employees: Employee[] = users.map(user => ({
          id: user.id,
          name: user.name,
          position: user.role || 'Sin especificar',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
          status: 'ACTIVO', // TODO: obtener del backend
          productivity: 0, // No utilizado en la tarjeta
          seniority: new Date(user.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
          }) || 'Reciente'
        }));

        this.employees.set(employees);

        // Actualizar estadísticas de usuarios
        const stats = this.statCards();
        stats[0].value = users.length;
        this.statCards.set([...stats]);

        // Extraer avatares para mostrar en el header
        this.teamAvatars.set(
          employees.slice(0, 15).map(e => e.avatar)
        );

        // Cargar equipos y actualizar estadística
        this.apiService.getTeams().subscribe({
          next: (teams: any[]) => {
            const stats = this.statCards();
            stats[1].value = teams.length;
            this.statCards.set([...stats]);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('%c[Dashboard] ❌ ERROR cargando equipos:', 'color: red; font-weight: bold', error);
            this.toastService.error('❌ Error al cargar equipos');
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('%c[Dashboard] ❌ ERROR cargando usuarios:', 'color: red; font-weight: bold', error);
        console.error('%c[Dashboard] Status HTTP:', 'color: red', error.status);
        console.error('%c[Dashboard] Message:', 'color: red', error.error?.message || error.message);
        console.error('%c[Dashboard] URL:', 'color: red', error.url);
        this.toastService.error('❌ Error: ' + (error.error?.message || error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  // Manejadores de botones
  onExportData(): void {
    console.log('%c[Dashboard] Exportando todos los datos...', 'color: green; font-weight: bold');
    this.toastService.info('Descargando usuarios...');
    
    this.apiService.exportUsers().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('✅ Usuarios descargados exitosamente');
      },
      error: (err) => {
        console.error('%c[Dashboard] Error exportando usuarios:', 'color: red', err);
        this.toastService.error('❌ Error al descargar usuarios');
      }
    });
  }

  onGenerateUserReport(): void {
    console.log('%c[Dashboard] Generando reporte de usuarios...', 'color: green; font-weight: bold');
    this.toastService.info('Generando reporte...');
    
    this.apiService.exportUsers().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('✅ Reporte generado exitosamente');
      },
      error: (err) => {
        console.error('%c[Dashboard] Error generando reporte:', 'color: red', err);
        this.toastService.error('❌ Error al generar reporte');
      }
    });
  }

  onShowAccessLog(): void {
    console.log('%c[Dashboard] Mostrando bitácora de acceso...', 'color: green; font-weight: bold');
    this.toastService.info('Cargando bitácora de acceso...');
    
    this.apiService.getAccessLog().subscribe({
      next: (logs: any[]) => {
        console.log('%c[Dashboard] ✅ Bitácora de acceso cargada:', 'color: green; font-weight: bold', logs);
        
        // Crear tabla HTML para mostrar en modal
        const content = `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-2 text-left text-slate-700">Usuario</th>
                  <th class="px-4 py-2 text-left text-slate-700">Acción</th>
                  <th class="px-4 py-2 text-left text-slate-700">Recurso</th>
                  <th class="px-4 py-2 text-left text-slate-700">Hora</th>
                  <th class="px-4 py-2 text-left text-slate-700">IP</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map((log, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200 hover:bg-slate-100">
                    <td class="px-4 py-2 text-slate-900 font-semibold">${log.user}</td>
                    <td class="px-4 py-2">
                      <span class="inline-block px-2 py-1 rounded text-xs font-semibold
                        ${log.action === 'login' ? 'bg-green-100 text-green-700' : ''}
                        ${log.action === 'logout' ? 'bg-gray-100 text-gray-700' : ''}
                        ${log.action === 'create' ? 'bg-blue-100 text-blue-700' : ''}
                        ${log.action === 'update' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${log.action === 'delete' ? 'bg-red-100 text-red-700' : ''}
                        ${log.action === 'view' ? 'bg-purple-100 text-purple-700' : ''}
                        ${log.action === 'export' ? 'bg-cyan-100 text-cyan-700' : ''}
                      ">
                        ${log.action}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-slate-600">${log.resource}</td>
                    <td class="px-4 py-2 text-slate-500 text-xs">${log.timestamp}</td>
                    <td class="px-4 py-2 font-mono text-xs text-slate-500">${log.ip}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        
        this.modalService.open({
          title: 'Bitácora de Acceso',
          content: content,
          actions: [
            { label: 'Cerrar', type: 'secondary', action: () => this.modalService.close() }
          ]
        });
        
        this.toastService.success('✅ Bitácora de acceso cargada');
      },
      error: (err) => {
        console.error('%c[Dashboard] Error cargando bitácora:', 'color: red', err);
        this.toastService.error('❌ Error al cargar la bitácora de acceso');
      }
    });
  }

  onOpenFilterModal(): void {
    console.log('%c[Dashboard] Abriendo filtros...', 'color: green; font-weight: bold');
    
    const filterContent = `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Filtrar por Rol</label>
          <select id="roleFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Todos los roles</option>
            <option value="trabajador">Trabajador</option>
            <option value="jefe">Jefe</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
          <select id="statusFilter" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>
    `;

    this.modalService.open({
      title: 'Filtrar Empleados',
      content: filterContent,
      actions: [
        { label: 'Cancelar', type: 'secondary', action: () => this.modalService.close() },
        { label: 'Aplicar Filtros', type: 'primary', action: () => this.applyFilters() }
      ]
    });
  }

  applyFilters(): void {
    const roleFilter = (document.getElementById('roleFilter') as HTMLSelectElement)?.value || '';
    const statusFilter = (document.getElementById('statusFilter') as HTMLSelectElement)?.value || '';
    
    let filtered = [...this.employees()];
    
    if (roleFilter) {
      filtered = filtered.filter(e => e.position.toLowerCase().includes(roleFilter.toLowerCase()));
    }
    
    if (statusFilter) {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    console.log('%c[Dashboard] Filtros aplicados:', 'color: green; font-weight: bold', { roleFilter, statusFilter });
    this.toastService.success(`✅ Se muestran ${filtered.length} empleados`);
    
    this.filteredEmployees.set(filtered);
    this.modalService.close();
  }

  onNewEmployee(): void {
    console.log('%c[Dashboard] Abriendo modal para crear nuevo empleado...', 'color: green; font-weight: bold');
    this.modalService.open({
      title: 'Crear Nuevo Empleado',
      content: '',
      actions: []
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1); // Reiniciar a la primera página al buscar
    console.log('%c[Dashboard] Búsqueda:', 'color: green; font-weight: bold', query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    console.log('%c[Dashboard] Búsqueda limpiada', 'color: green; font-weight: bold');
  }

  // Métodos de paginación
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Mostrar máximo 5 números de página
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(total, current + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onViewSchedule(employee: Employee): void {
    console.log('%c[Dashboard] Ver horario de:', 'color: green; font-weight: bold', employee.name);
    this.selectedEmployee.set(employee);
    this.currentView.set('schedule');
    this.isLoadingSchedule.set(true);
    this.employeeSchedules.set([]);
    this.apiService.getUserSchedules(employee.id ?? 0).subscribe({
      next: (schedules: any[]) => {
        this.employeeSchedules.set(schedules);
        this.isLoadingSchedule.set(false);
        if (!schedules || schedules.length === 0) {
          this.toastService.info('El usuario no tiene horarios publicados');
        }
      },
      error: (error) => {
        this.employeeSchedules.set([]);
        this.isLoadingSchedule.set(false);
        this.toastService.error('Error al cargar los horarios');
      }
    });
    this.toastService.info(`📅 Viendo horario de ${employee.name}`);
  }

  backToList(): void {
    console.log('%c[Dashboard] Volviendo a la lista de empleados', 'color: green; font-weight: bold');
    this.currentView.set('list');
    this.selectedEmployee.set(null);
    this.toastService.info('Volviendo al directorio...');
  }
}

