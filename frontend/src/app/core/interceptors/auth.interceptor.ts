import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Añadir token Bearer a todas las peticiones si existe
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token expiró (401) o no autorizado, limpiar sesión
        if (error.status === 401) {
          // Limpiar token y redirigir a login solo si NO estamos ya en una página de auth
          localStorage.removeItem('auth_token');
          
          // Obtener la URL actual del router
          const currentUrl = this.router.url;
          
          // Solo redirigir si NO estamos en login, register o forgot-password
          // Así permitimos que el componente maneje el error 401
          if (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/forgot-password')) {
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
