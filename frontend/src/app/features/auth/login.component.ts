import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.reset();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.toastService.success('¡Bienvenido de vuelta!');
        
        // Get current user and redirect based on role
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            const role = user?.role?.toLowerCase();
            let redirectPath = '/dashboard';
            
            if (role === 'administrador') {
              redirectPath = '/dashboard/admin';
            } else if (role === 'jefe') {
              redirectPath = '/dashboard/jefe';
            } else if (role === 'trabajador') {
              redirectPath = '/dashboard/trabajador';
            }
            
            setTimeout(() => this.router.navigate([redirectPath]), 500);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
        let errorMessage = 'Credenciales inválidas';
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
        this.toastService.error(errorMessage);
        this.loginForm.reset();
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    if (field.errors['required']) return `${fieldName} es requerido`;
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;

    return null;
  }
}
