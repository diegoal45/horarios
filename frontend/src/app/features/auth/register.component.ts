import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { FooterComponent } from '../../shared/components';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  loading = false;
  error: string | null = null;
  success = false;

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
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const passwordConfirm = form.get('passwordConfirm');

    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      passwordConfirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const userData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value
    };

    console.log('RegisterComponent.onSubmit - Iniciando registro con:', { name: userData.name, email: userData.email });

    this.authService.register(userData).subscribe({
      next: (response) => {
        try {
          console.log('RegisterComponent - Registro exitoso:', response);
          const successMsg = '¡Cuenta creada exitosamente! Redirigiendo al login...';
          console.log('RegisterComponent - Mostrando toast success con mensaje:', successMsg);
          
          this.success = true;
          this.toastService.success(successMsg);
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } catch (e) {
          console.error('RegisterComponent - Exception en success handler:', e);
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        try {
          console.log('RegisterComponent - Error en registro:', err);
          console.log('RegisterComponent - err.error:', err.error);
          console.log('RegisterComponent - err.status:', err.status);
          console.log('RegisterComponent - err.statusText:', err.statusText);
          
          // Extraer mensaje de error del API
          let errorMessage = 'Error en el registro. Intenta con otra información.';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.errors) {
            // Si hay errores de validación (Laravel format)
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
          
          console.log('RegisterComponent - errorMessage final:', errorMessage);
          console.log('RegisterComponent - Mostrando toast error con mensaje:', errorMessage);
          
          this.toastService.error(errorMessage);
          this.error = errorMessage;
        } catch (e) {
          console.error('RegisterComponent - Exception en error handler:', e);
          this.toastService.error('Error inesperado. Por favor intente de nuevo.');
        } finally {
          this.loading = false;
        }
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    if (field.errors['required']) return `${fieldName} es requerido`;
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    if (field.errors['requiredTrue']) return 'Debe aceptar los términos de servicio';

    return null;
  }
}
