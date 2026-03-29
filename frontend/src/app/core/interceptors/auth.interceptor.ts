import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  
  console.log('[AuthInterceptor] URL:', req.url);
  console.log('[AuthInterceptor] Token:', token ? 'existe' : 'NO EXISTE');

  let request = req;
  
  // Añadir token Bearer a todas las peticiones si existe
  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[AuthInterceptor] Header agregado:', request.headers.get('Authorization'));
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[AuthInterceptor] Error:', error.status, error.message);
      
      // Si el token expiró (401) o no autorizado
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        
        const currentUrl = router.url;
        
        // Solo redirigir si NO estamos en login, register o forgot-password
        if (!currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/forgot-password')) {
          router.navigate(['/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};
