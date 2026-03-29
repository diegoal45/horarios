import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../shared/services/toast.service';

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  hours?: number;
  weeklyHours?: number;
  scheduled?: boolean;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 shrink-0">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <h2 class="text-headline-md font-semibold text-on-surface">Equipo</h2>
        <p class="text-body-md text-secondary">Selecciona un empleado para ver su detalle.</p>
      </div>

      <!-- Employee List -->
      <div class="bg-surface-container-low rounded-xl p-2 space-y-1">
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
          (click)="addMember()"
          class="w-full flex items-center justify-center gap-2 mt-4 p-3 border-2 border-dashed border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-bold rounded-lg transition-all text-sm"
        >
          <span class="material-symbols-outlined">person_add</span>
          <span>Añadir Miembro</span>
        </button>
      </div>

      <!-- Weekly Summary -->
      <div class="bg-primary/5 rounded-xl p-5 border border-primary/10 flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-xl">analytics</span>
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Resumen Semanal</h3>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-end">
            <span class="text-sm text-secondary font-medium">Horas Totales</span>
            <span class="text-xl font-bold text-on-surface">{{ getTotalWeeklyHours() }}h</span>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between text-[0.65rem] font-bold uppercase tracking-tight text-secondary">
              <span>Progreso Jornada</span>
              <span class="text-primary">{{ getCompletionPercentage() }}%</span>
            </div>
            <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                class="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(0,104,86,0.3)] transition-all"
                [style.width.%]="getCompletionPercentage()"
              ></div>
            </div>
          </div>
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

  @Output() employeeSelected = new EventEmitter<Employee>();
  @Output() employeeDeleted = new EventEmitter<string>();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.apiService.getUsers().subscribe({
      next: (users: any[]) => {
        this.employees = users.map(u => ({
          id: u.id,
          name: u.name,
          role: u.roles?.[0]?.name || 'Empleado',
          avatar: u.avatar,
          hours: u.hours || 0,
          weeklyHours: u.weeklyHours || 0,
          scheduled: u.scheduled || false
        }));
        this.filteredEmployees = this.employees;
        if (this.employees.length > 0) {
          this.selectEmployee(this.employees[0]);
        }
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.toastService.error('Error cargando empleados');
      }
    });
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.employeeSelected.emit(employee);
  }

  deleteEmployee(event: Event, employee: Employee): void {
    event.stopPropagation();
    if (confirm(`¿Eliminar ${employee.name} del equipo?`)) {
      // Call API to delete
      this.employeeDeleted.emit(employee.id);
      this.toastService.success(`${employee.name} eliminado del equipo`);
    }
  }

  addMember(): void {
    this.toastService.info('Función de añadir miembros en desarrollo');
  }

  getTotalWeeklyHours(): number {
    return this.employees.reduce((sum, emp) => sum + (emp.weeklyHours || 0), 0);
  }

  getCompletionPercentage(): number {
    if (this.employees.length === 0) return 0;
    const scheduled = this.employees.filter(e => e.scheduled).length;
    return Math.round((scheduled / this.employees.length) * 100);
  }
}
