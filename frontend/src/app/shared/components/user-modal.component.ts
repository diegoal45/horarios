import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../services/modal.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../services/toast.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div *ngIf="modal() as modalData" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop with blur effect -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="close()"></div>
      
      <!-- Modal -->
      <div class="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Gradient accent line -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-transparent"></div>
        
        <!-- Background blur effect -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <!-- Header -->
        <div class="relative z-10 flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {{ isEditing ? 'Editar' : 'Crear' }} Usuario
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ isEditing ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema' }}
            </p>
          </div>
          <button 
            (click)="close()" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="relative z-10 p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Nombre</label>
              <input 
                type="text" 
                formControlName="name" 
                class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Email</label>
              <input 
                type="email" 
                formControlName="email" 
                class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="juan@example.com"
              />
            </div>

            <!-- Rol -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Rol</label>
              <select 
                formControlName="role" 
                class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="trabajador">Trabajador</option>
                <option value="jefe">Jefe</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <!-- Contraseña (solo para crear) -->
            <div *ngIf="!isEditing">
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Contraseña</label>
              <input 
                type="password" 
                formControlName="password" 
                class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <button 
                type="button" 
                (click)="close()"
                class="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                [disabled]="!form.valid || isLoading"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span *ngIf="isLoading" class="inline-block animate-spin mr-2">⟳</span>
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserModalComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  isLoading = false;
  userId?: number;

  get modal() {
    return this.modalService.modal;
  }

  constructor(
    private modalService: ModalService,
    private apiService: ApiService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['trabajador', Validators.required],
      password: ['', []]
    });
  }

  onSubmit() {
    if (!this.form.valid) return;

    this.isLoading = true;
    const data = this.form.value;

    if (this.isEditing && this.userId) {
      this.apiService.updateUser(this.userId, data).subscribe({
        next: (user) => {
          this.toastService.success(`Usuario "${user.name}" actualizado exitosamente`);
          this.close();
          this.isLoading = false;
          // Reload data
          window.location.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al actualizar usuario');
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.createUser(data).subscribe({
        next: (user) => {
          this.toastService.success(`Usuario "${user.name}" creado exitosamente`);
          this.close();
          this.isLoading = false;
          window.location.reload();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al crear usuario');
          this.isLoading = false;
        }
      });
    }
  }

  close() {
    this.modalService.close();
    this.form.reset();
  }
}
