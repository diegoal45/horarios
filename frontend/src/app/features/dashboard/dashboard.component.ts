import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header.component';
import { SidebarNavComponent } from '../../shared/components/sidebar-nav.component';
import { SidebarNavJefeComponent } from '../../shared/components/sidebar-nav-jefe.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarNavComponent, SidebarNavJefeComponent],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
      <!-- TopNavBar Component -->
      <app-header></app-header>

      <!-- Main Content Layout -->
      <main class="relative flex min-h-screen pt-16">
        <!-- SideNavBar - Role-specific (Dynamic Island style) -->
        <ng-container [ngSwitch]="userRole$ | async">
          <app-sidebar-nav-jefe *ngSwitchCase="'jefe'" role="jefe"></app-sidebar-nav-jefe>
          <app-sidebar-nav *ngSwitchDefault role="admin"></app-sidebar-nav>
        </ng-container>

        <!-- Content Canvas -->
        <div class="flex-1 px-4 md:px-8 py-6 md:py-8 md:mr-24 pb-24 md:pb-8">
          <!-- Router Outlet for child components -->
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Background Elements -->
      <div class="fixed top-0 right-0 -z-10 w-1/3 h-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>
      <div class="fixed bottom-0 left-0 -z-10 w-1/4 h-1/2 bg-slate-500/5 blur-[100px] pointer-events-none"></div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  userRole$: any;

  get user$() {
    return this.authService.user$;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('✅ [Dashboard] Constructor iniciado');
    this.userRole$ = this.authService.user$.pipe(
      map(user => {
        console.log('%c🔍 [Dashboard] userRole$ map - usuario recibido:', 'color: #FF6B6B; font-weight: bold', {
          email: user?.email,
          name: user?.name,
          role: user?.role,
          allData: user
        });
        
        let role = user?.role ? user.role.toLowerCase().trim() : 'trabajador'; // Cambiar a 'trabajador' por defecto
        
        // Mapear variaciones de roles
        if (role === 'jefe' || role === 'jefen' || role === 'chief') {
          role = 'jefe';
        } else if (role === 'administrador' || role === 'admin') {
          role = 'administrador';
        } else {
          role = 'trabajador';
        }
        
        console.log('%c✅ [Dashboard] userRole$ → role final:', 'color: #4ECDC4; font-weight: bold', {
          roleFinal: role,
          userEmail: user?.name,
          originalRole: user?.role
        });
        
        return role;
      })
    );
  }

  ngOnInit(): void {
    console.log('✅ [Dashboard] ngOnInit iniciado');
    this.userRole$.subscribe((role: string) => {
      console.log('📡 [Dashboard] userRole$ suscripción:', role);
    });
  }

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
