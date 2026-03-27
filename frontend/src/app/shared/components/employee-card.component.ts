import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Employee {
  id?: number;
  name: string;
  position: string;
  avatar: string;
  status: 'ACTIVO' | 'EN RECESO' | 'INACTIVO';
  productivity: number;
  seniority: string;
}

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <!-- Card Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
            <img
              [src]="employee.avatar"
              [alt]="employee.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 class="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
              {{ employee.name }}
            </h4>
            <p class="text-xs text-slate-500">{{ employee.position }}</p>
          </div>
        </div>
        <span
          [class]="'text-[10px] font-bold px-2 py-0.5 rounded ' + getStatusStyles()"
        >
          {{ employee.status }}
        </span>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 py-4 border-t border-slate-200">
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Productividad</p>
          <p class="text-sm font-bold text-slate-700">{{ employee.productivity }}%</p>
        </div>
        <div>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Antigüedad</p>
          <p class="text-sm font-bold text-slate-700">{{ employee.seniority }}</p>
        </div>
      </div>

      <!-- Action Button -->
      <button
        class="w-full mt-2 py-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
      >
        Ver Perfil Detallado
      </button>
    </div>
  `,
  styles: []
})
export class EmployeeCardComponent {
  @Input() employee!: Employee;

  getStatusStyles(): string {
    switch (this.employee.status) {
      case 'ACTIVO':
        return 'bg-emerald-50 text-emerald-600';
      case 'EN RECESO':
        return 'bg-amber-50 text-amber-600';
      case 'INACTIVO':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  }
}
