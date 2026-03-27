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
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Login con email y contraseña
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Guardar token (Sanctum usa access_token)
        localStorage.setItem(this.tokenKey, response.access_token);
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
    if (this.getToken()) {
      this.refreshUser().subscribe({
        error: () => this.logout().subscribe()
      });
    }
  }
}
