import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col py-6 gap-4 items-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-full w-16 hover:w-48 overflow-hidden transition-all duration-300 ease-in-out shadow-2xl shadow-slate-900/10 dark:shadow-black/20 group"
    >
      <!-- Header Label -->
      <div class="flex flex-col items-center gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
        <span class="text-[10px] uppercase tracking-widest font-bold text-teal-600">Admin</span>
        <span class="text-[9px] uppercase tracking-tighter text-slate-400">Gestión</span>
      </div>

      <!-- Nav Items -->
      <a
        *ngFor="let item of navItems()"
        [routerLink]="item.route"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center gap-3 p-3 rounded-full w-10 group-hover:w-[85%] transition-all overflow-hidden active:scale-90"
        [class.bg-teal-50]="item.isActive"
        [class.dark:bg-teal-900/30]="item.isActive"
        [class.text-teal-700]="item.isActive"
        [class.dark:text-teal-300]="item.isActive"
        [class.text-slate-600]="!item.isActive"
        [class.dark:text-slate-400]="!item.isActive"
        [class.hover:bg-slate-100]="!item.isActive"
        [class.dark:hover:bg-slate-800]="!item.isActive"
      >
        <span class="material-symbols-outlined shrink-0">
          {{ item.icon }}
        </span>
        <span class="font-inter text-[0.6875rem] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {{ item.label }}
        </span>
      </a>

      <!-- Logout Button -->
      <button
        (click)="onLogout()"
        class="flex items-center gap-3 p-3 mt-auto text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-10 group-hover:w-[85%] transition-all overflow-hidden active:scale-90"
      >
        <span class="material-symbols-outlined shrink-0">logout</span>
        <span class="font-inter text-[0.6875rem] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Cerrar sesión
        </span>
      </button>
    </nav>
  `,
  styles: []
})
export class SidebarNavComponent {
  navItems = signal<NavItem[]>([
    { icon: 'home', label: 'Inicio', route: '/dashboard', isActive: true },
    { icon: 'group', label: 'Usuarios', route: '/dashboard/usuarios', isActive: false },
    { icon: 'calendar_today', label: 'Horarios', route: '/dashboard/horarios', isActive: false },
    { icon: 'timer', label: 'Horas trabajadas', route: '/dashboard/horas-trabajadas', isActive: false }
  ]);

  constructor(private router: Router) {}

  onLogout() {
    // TODO: Implementar lógica completa de logout
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
