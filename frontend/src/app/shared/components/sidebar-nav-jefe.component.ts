import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavItem } from './sidebar-nav.models';

@Component({
  selector: 'app-sidebar-nav-jefe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- SIDEBAR JEFE (MISMO COLOR QUE ADMIN) -->
    <!-- Desktop: Right-side vertical island - JEFE DESIGN -->
    <nav
      class="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col py-6 gap-4 items-center bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-2xl w-16 hover:w-48 overflow-hidden transition-all duration-300 ease-out shadow-2xl shadow-slate-900/10 dark:shadow-black/20 group"
      title="Sidebar Jefe - Color Gris"
    >
      <!-- Header Label -->
      <div class="flex flex-col items-center gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
        <span class="text-[10px] uppercase tracking-widest font-bold text-teal-600">{{ roleLabel() }}</span>
        <span class="text-[9px] uppercase tracking-tighter text-slate-400">Equipo</span>
      </div>

      <!-- Nav Items -->
      <a
        *ngFor="let item of navItems()"
        [routerLink]="item.route"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
        class="flex items-center gap-3 p-3 rounded-lg w-10 group-hover:w-[85%] transition-all overflow-hidden active:scale-90"
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
        class="flex items-center gap-3 p-3 mt-auto text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-10 group-hover:w-[85%] transition-all overflow-hidden active:scale-90"
      >
        <span class="material-symbols-outlined shrink-0">logout</span>
        <span class="font-inter text-[0.6875rem] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Cerrar sesión
        </span>
      </button>
    </nav>

    <!-- Mobile: Bottom horizontal island with expansion - JEFE DESIGN -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-t border-slate-200/20 dark:border-slate-800/30 shadow-2xl shadow-slate-900/10 dark:shadow-black/20 transition-all duration-300"
      [class.rounded-t-3xl]="!isMobileExpanded()"
      [class.h-24]="!isMobileExpanded()"
      [class.h-screen]="isMobileExpanded()"
    >
      <!-- Header with Toggle -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200/20 dark:border-slate-800/30" *ngIf="isMobileExpanded()">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">Navegación Jefe</h3>
        <button (click)="toggleMobileNav()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Nav Items Container - Collapsed -->
      <div class="flex items-center justify-around w-full h-24" *ngIf="!isMobileExpanded()">
        <!-- Nav Items Mobile - Collapsed -->
        <a
          *ngFor="let item of navItems()"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: false }"
          class="flex items-center justify-center p-3 rounded-lg w-12 h-12 transition-all active:scale-90"
          [class.bg-teal-50]="item.isActive"
          [class.dark:bg-teal-900/30]="item.isActive"
          [class.text-teal-700]="item.isActive"
          [class.dark:text-teal-300]="item.isActive"
          [class.text-slate-600]="!item.isActive"
          [class.dark:text-slate-400]="!item.isActive"
          [class.hover:bg-slate-100]="!item.isActive"
          [class.dark:hover:bg-slate-800]="!item.isActive"
        >
          <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
        </a>

        <!-- Toggle Button Mobile - Collapsed -->
        <button
          (click)="toggleMobileNav()"
          class="flex items-center justify-center p-3 rounded-lg w-12 h-12 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
        >
          <span class="material-symbols-outlined text-lg">menu</span>
        </button>

        <!-- Logout Button Mobile - Collapsed -->
        <button
          (click)="onLogout()"
          class="flex items-center justify-center p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-12 h-12 transition-all active:scale-90"
        >
          <span class="material-symbols-outlined text-lg">logout</span>
        </button>
      </div>

      <!-- Expanded Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(100vh-6rem)]" *ngIf="isMobileExpanded()">
        <div class="grid grid-cols-2 gap-4">
          <!-- Nav Items Mobile - Expanded -->
          <a
            *ngFor="let item of navItems()"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            (click)="closeMobileNav()"
            class="flex flex-col items-center gap-2 p-4 rounded-lg transition-all active:scale-90"
            [class.bg-teal-50]="item.isActive"
            [class.dark:bg-teal-900/30]="item.isActive"
            [class.text-teal-700]="item.isActive"
            [class.dark:text-teal-300]="item.isActive"
            [class.text-slate-600]="!item.isActive"
            [class.dark:text-slate-400]="!item.isActive"
            [class.hover:bg-slate-100]="!item.isActive"
            [class.dark:hover:bg-slate-800]="!item.isActive"
          >
            <span class="material-symbols-outlined text-2xl">{{ item.icon }}</span>
            <span class="text-[0.6rem] font-medium uppercase tracking-wider text-center">{{ item.label }}</span>
          </a>

          <!-- Logout Button Mobile - Expanded -->
          <button
            (click)="onLogout()"
            class="flex flex-col items-center gap-2 p-4 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90"
          >
            <span class="material-symbols-outlined text-2xl">logout</span>
            <span class="text-[0.6rem] font-medium uppercase tracking-wider">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class SidebarNavJefeComponent implements OnInit {
  roleLabel = signal('Jefe');
  isMobileExpanded = signal(false);
  navItems = signal<NavItem[]>([
    { icon: 'home', label: 'Inicio', route: '/dashboard/jefe', isActive: true },
    { icon: 'calendar_today', label: 'Horarios', route: '/dashboard/jefe/schedules', isActive: false },
    { icon: 'auto_awesome', label: 'Generar Horarios', route: '/dashboard/jefe/generate-schedules', isActive: false },
    { icon: 'assessment', label: 'Reportes', route: '/dashboard/jefe/reports', isActive: false }
  ]);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('🟦 [SidebarNavJefeComponent] Constructor - Componente JEFE creado');
  }

  ngOnInit() {
    console.log('🟦 [SidebarNavJefeComponent] ngOnInit - Componente JEFE renderizado');
  }

  toggleMobileNav() {
    this.isMobileExpanded.update(value => !value);
  }

  closeMobileNav() {
    this.isMobileExpanded.set(false);
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}
