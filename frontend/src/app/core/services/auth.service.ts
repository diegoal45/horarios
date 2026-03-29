import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest } from '../models';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Login con email y contraseña
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('%c[AuthService] Login intentando...', 'color: blue; font-weight: bold', credentials.email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        console.log('%c[AuthService] ✅ Login exitoso, guardando token...', 'color: green; font-weight: bold');
        // Guardar token (Sanctum usa access_token)
        localStorage.setItem(this.tokenKey, response.access_token);
        // Guardar usuario para carga rápida
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        console.log('%c[AuthService] Token y usuario guardados en localStorage:', 'color: green', {
          token: response.access_token.substring(0, 20) + '...',
          user: response.user.email,
          role: response.user.role
        });
        this.userSubject.next(response.user);
      })
    );
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: { name: string; email: string; password: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this.userSubject.next(response.user);
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.userSubject.next(null);
      })
    );
  }

  /**
   * Obtener token guardado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verificar si está logueado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtener usuario actual como observable
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Refrescar datos del usuario actual
   */
  refreshUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  /**
   * Cargar usuario si existe token guardado
   */
  private loadStoredUser(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.userKey);
    
    console.log('%c[AuthService] loadStoredUser - Token:', 'color: blue; font-weight: bold', token ? 'SÍ existe' : 'NO existe');
    
    if (token && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        // Emitir usuario guardado inmediatamente
        this.userSubject.next(user);
        console.log('%c[AuthService] ✅ Usuario cargado de localStorage:', 'color: green; font-weight: bold', {
          user: user.email,
          role: user.role
        });
        
        // Refrescar usuario en background
        console.log('%c[AuthService] Refrescando usuario en background...', 'color: blue');
        this.refreshUser().subscribe({
          next: (updatedUser) => {
            console.log('%c[AuthService] ✅ Usuario refrescado:', 'color: green; font-weight: bold', updatedUser);
          },
          error: (err) => { 
            console.error('%c[AuthService] ❌ Error refrescando usuario:', 'color: red; font-weight: bold', err);
            this.logout().subscribe();
          }
        });
      } catch (e) {
        console.error('%c[AuthService] ❌ Error parseando usuario de localStorage:', 'color: red', e);
      }
    } else if (token) {
      console.log('%c[AuthService] Token existe pero no hay usuario guardado, obteniendo del servidor...', 'color: blue');
      this.refreshUser().subscribe({
        next: (user) => {
          console.log('%c[AuthService] ✅ Usuario obtenido del servidor:', 'color: green; font-weight: bold', user);
        },
        error: (err) => { 
          console.error('%c[AuthService] ❌ Error obteniendo usuario:', 'color: red; font-weight: bold', err);
          this.logout().subscribe();
        }
      });
    } else {
      console.log('%c[AuthService] No hay token guardado', 'color: gray');
    }
  }
}
