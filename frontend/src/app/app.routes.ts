import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from './features/auth';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { RoleGuard } from './core/guards/role.guard';

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
      // ADMIN ROUTES
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { role: 'admin' },
        children: [
          {
            path: '',
            canActivate: [RoleGuard],
            data: { role: 'admin' },
            loadComponent: () => import('./features/dashboard/admin/admin-dashboard.component')
              .then(m => m.AdminDashboardComponent)
          },
          {
            path: 'users',
            canActivate: [RoleGuard],
            data: { role: 'admin' },
            loadComponent: () => import('./features/dashboard/admin/usuarios/usuarios.component')
              .then(m => m.UsuariosComponent)
          },
          {
            path: 'schedules',
            canActivate: [RoleGuard],
            data: { role: 'admin' },
            loadComponent: () => import('./features/dashboard/admin/horarios/horarios.component')
              .then(m => m.HorariosComponent)
          },
          {
            path: 'hours',
            canActivate: [RoleGuard],
            data: { role: 'admin' },
            loadComponent: () => import('./features/dashboard/admin/horas-trabajadas/horas-trabajadas.component')
              .then(m => m.HorasTrabajadasComponent)
          }
        ]
      },

      // JEFE ROUTES
      {
        path: 'jefe',
        canActivate: [RoleGuard],
        data: { role: 'jefe' },
        children: [
          {
            path: '',
            canActivate: [RoleGuard],
            data: { role: 'jefe' },
            loadComponent: () => import('./features/dashboard/jefe/jefe-dashboard.component')
              .then(m => m.JefeDashboardComponent)
          },
          {
            path: 'team',
            canActivate: [RoleGuard],
            data: { role: 'jefe' },
            loadComponent: () => import('./features/dashboard/jefe/equipo/equipo.component')
              .then(m => m.EquipoComponent)
          },
          {
            path: 'schedules',
            canActivate: [RoleGuard],
            data: { role: 'jefe' },
            loadComponent: () => import('./features/dashboard/jefe/mis-horarios/mis-horarios.component')
              .then(m => m.MisHorariosComponent)
          },
          {
            path: 'reports',
            canActivate: [RoleGuard],
            data: { role: 'jefe' },
            loadComponent: () => import('./features/dashboard/jefe/reporte-horas/reporte-horas.component')
              .then(m => m.ReporteHorasComponent)
          }
        ]
      },

      // Default redirect
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
