import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HeaderComponent, FooterComponent } from '../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent],
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
    private router: Router
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
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    console.log('LoginComponent.onSubmit - Iniciando login con:', { email: credentials.email, password: '***' });

    this.authService.login(credentials).subscribe({
      next: (response) => {
        try {
          console.log('LoginComponent - Login exitoso:', response);
          const successMsg = '¡Bienvenido de vuelta!';
          console.log('LoginComponent - Mostrando toast success con mensaje:', successMsg);
          this.toastService.success(successMsg);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } catch (e) {
          console.error('LoginComponent - Exception en success handler:', e);
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        try {
          console.log('LoginComponent - Error en login:', err);
          console.log('LoginComponent - err.error:', err.error);
          console.log('LoginComponent - err.status:', err.status);
          console.log('LoginComponent - err.statusText:', err.statusText);
          
          // Extraer mensaje de error del API
          let errorMessage = 'Error en el inicio de sesión. Verifique sus credenciales.';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.errors) {
            // Si hay errores de validación
            const errorMessages = [];
            for (const field in err.error.errors) {
              if (Array.isArray(err.error.errors[field])) {
                errorMessages.push(err.error.errors[field][0]);
              }
            }
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join('. ');
            }
          } else if (err.statusText) {
            errorMessage = err.statusText;
          }
          
          console.log('LoginComponent - errorMessage final:', errorMessage);
          console.log('LoginComponent - Mostrando toast error con mensaje:', errorMessage);
          
          this.toastService.error(errorMessage);
          this.error = errorMessage;
        } catch (e) {
          console.error('LoginComponent - Exception en error handler:', e);
          this.toastService.error('Error inesperado. Por favor intente de nuevo.');
        } finally {
          this.loading = false;
        }
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
