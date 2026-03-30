import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Editar Perfil</h1>
        <p class="text-slate-600 mt-1">Actualiza tu nombre, correo y contraseña.</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form (ngSubmit)="saveProfile()" class="space-y-5">
          <div>
            <label for="name" class="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              [(ngModel)]="form.name"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-semibold text-slate-700 mb-1">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="form.email"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div class="pt-2 border-t border-slate-200">
            <p class="text-sm font-semibold text-slate-700 mb-3">Cambiar contraseña (opcional)</p>

            <div class="space-y-4">
              <div>
                <label for="current_password" class="block text-sm font-semibold text-slate-700 mb-1">Contraseña actual</label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  [(ngModel)]="form.current_password"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-semibold text-slate-700 mb-1">Nueva contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  [(ngModel)]="form.password"
                  minlength="8"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label for="password_confirmation" class="block text-sm font-semibold text-slate-700 mb-1">Confirmar contraseña</label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  [(ngModel)]="form.password_confirmation"
                  minlength="8"
                  class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              (click)="goBack()"
              class="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="loading"
              class="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
              {{ loading ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class EditProfileComponent implements OnInit {
  loading = false;

  form = {
    name: '',
    email: '',
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.refreshUser().subscribe({
      next: (user) => {
        this.form.name = user?.name || '';
        this.form.email = user?.email || '';
      },
      error: () => {
        this.toastService.error('No se pudo cargar tu perfil.');
      }
    });
  }

  saveProfile(): void {
    if (this.form.password && this.form.password !== this.form.password_confirmation) {
      this.toastService.error('Las contraseñas no coinciden.');
      return;
    }

    if (this.form.password && !this.form.current_password) {
      this.toastService.error('Debes ingresar tu contraseña actual para cambiar la contraseña.');
      return;
    }

    this.loading = true;

    const payload: any = {
      name: this.form.name,
      email: this.form.email,
    };

    if (this.form.password) {
      payload.current_password = this.form.current_password;
      payload.password = this.form.password;
      payload.password_confirmation = this.form.password_confirmation;
    }

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Perfil actualizado correctamente.');
        this.router.navigate(['/dashboard/trabajador']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || 'No se pudo actualizar el perfil.';
        this.toastService.error(msg);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trabajador']);
  }
}
