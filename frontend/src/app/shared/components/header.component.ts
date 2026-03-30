import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div class="flex items-center gap-4">
        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestión de Horarios Laborales
        </span>
      </div>
      <div class="relative">
        <button
          type="button"
          (click)="toggleMenu()"
          class="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center hover:bg-primary/15 transition-colors"
          title="Menú de usuario"
        >
          {{ getInitials(currentUser) }}
        </button>

        <div
          *ngIf="isUserMenuOpen"
          class="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2"
        >
          <button
            type="button"
            (click)="onEditProfile()"
            class="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Editar perfil
          </button>
        </div>

        <button
          *ngIf="isUserMenuOpen"
          type="button"
          (click)="closeMenu()"
          class="fixed inset-0 z-[-1] cursor-default"
          aria-label="Cerrar menú"
        ></button>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  currentUser: User | null = null;
  isUserMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenu(): void {
    this.isUserMenuOpen = false;
  }

  onEditProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/dashboard/perfil/editar']);
  }

  getInitials(user: User | null): string {
    const name = (user?.name || '').trim();
    if (!name) {
      return 'U';
    }

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}
