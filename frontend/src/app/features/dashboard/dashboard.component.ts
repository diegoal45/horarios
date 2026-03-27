import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-surface">
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-on-surface">Dashboard</h1>
          <button 
            (click)="logout()"
            class="px-4 py-2 bg-error text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Cerrar sesión
          </button>
        </div>

        <div *ngIf="user$ | async as user" class="bg-surface-container-lowest p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold text-on-surface mb-4">Bienvenido, {{ user.name }}!</h2>
          <p class="text-on-surface-variant mb-2">Email: {{ user.email }}</p>
          <div *ngIf="user.roles && user.roles.length > 0" class="mt-4">
            <p class="text-on-surface-variant text-sm">Roles:</p>
            <div class="flex gap-2 mt-2">
              <span *ngFor="let role of user.roles" class="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                {{ role.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-surface-container-lowest p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-on-surface mb-2">Próximas Funcionalidades</h3>
            <p class="text-on-surface-variant text-sm">
              Dashboard completo, gestión de horarios, reportes y más.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  get user$() {
    return this.authService.user$;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Aunque falle, seguimos limpiando localmente y redirigiendo
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}
