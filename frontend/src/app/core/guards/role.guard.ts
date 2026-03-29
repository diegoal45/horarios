import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take, timeout } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Soporta 'role' (singular) o 'roles' (plural)
    const requiredRole = route.data['role'] as string;
    const requiredRoles = route.data['roles'] as string[] || [];

    console.log(`[RoleGuard] Validando acceso a: ${state.url}, requiredRole: ${requiredRole}`);

    return this.authService.user$.pipe(
      // Esperar a que haya usuario (ignorar null/undefined inicial)
      filter(user => {
        if (!user) {
          console.log('[RoleGuard] Esperando usuario...');
          return false;
        }
        return true;
      }),
      take(1),
      timeout(5000), // Timeout de 5 segundos
      map((user) => {
        if (!user) {
          console.log('❌ [RoleGuard] No hay usuario autenticado después del timeout');
          this.router.navigate(['/login']);
          return false;
        }

        const userRole = user.role?.toLowerCase().trim() || undefined;
        
        if (!userRole) {
          console.log('❌ [RoleGuard] Usuario sin rol asignado');
          this.router.navigate(['/login']);
          return false;
        }

        // Normalizar "administrador" a "admin" para comparación
        const normalizedRole = userRole === 'administrador' ? 'admin' : userRole;

        // Verificar contra rol singular
        if (requiredRole) {
          const normalizedRequired = requiredRole.toLowerCase() === 'administrador' ? 'admin' : requiredRole.toLowerCase();
          const hasAccess = normalizedRole === normalizedRequired;
          
          if (!hasAccess) {
            console.log(`❌ [RoleGuard] Usuario con rol "${userRole}" intentando acceder a ruta que requiere rol "${requiredRole}". Ruta: ${state.url}`);
            this.redirectByRole(normalizedRole);
            return false;
          }
          console.log(`✅ [RoleGuard] Usuario "${userRole}" tiene acceso a ${state.url}`);
          return true;
        }

        // Verificar contra roles múltiples
        if (requiredRoles.length > 0) {
          const normalizedRequired = requiredRoles.map(r => r.toLowerCase() === 'administrador' ? 'admin' : r.toLowerCase());
          const hasAccess = normalizedRequired.includes(normalizedRole);
          
          if (!hasAccess) {
            console.log(`❌ [RoleGuard] Usuario con rol "${userRole}" intentando acceder a ruta que requiere ${requiredRoles.join(', ')}. Ruta: ${state.url}`);
            this.redirectByRole(normalizedRole);
            return false;
          }
          console.log(`✅ [RoleGuard] Usuario "${userRole}" tiene acceso a ${state.url}`);
          return true;
        }

        // Sin restricción de rol (ruta pública)
        console.log(`✅ [RoleGuard] Ruta sin restricción de rol`);
        return true;
      })
    );
  }

  private redirectByRole(role: string): void {
    if (!role) {
      console.log('[RoleGuard] Sin rol, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    const lowerRole = role.toLowerCase();
    console.log(`[RoleGuard] Redirigiendo usuario con rol "${role}" a su dashboard`);
    if (lowerRole === 'admin' || lowerRole === 'administrador') {
      this.router.navigate(['/dashboard/admin']);
    } else if (lowerRole === 'jefe') {
      this.router.navigate(['/dashboard/jefe']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
