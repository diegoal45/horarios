import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from './features/auth';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/admin/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/dashboard/admin/usuarios/usuarios.component')
          .then(m => m.UsuariosComponent)
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/dashboard/admin/horarios/horarios.component')
          .then(m => m.HorariosComponent)
      },
      {
        path: 'horas-trabajadas',
        loadComponent: () => import('./features/dashboard/admin/horas-trabajadas/horas-trabajadas.component')
          .then(m => m.HorasTrabajadasComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
