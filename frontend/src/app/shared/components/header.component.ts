import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div class="flex items-center gap-6">
        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestión de Horarios Laborales
        </span>
        <div class="relative hidden md:block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            class="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-teal-500/20 transition-all"
            placeholder="Buscar empleados o reportes..."
            type="text"
          />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button class="p-2 relative text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors rounded-full active:scale-95 duration-150">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors rounded-full active:scale-95 duration-150">
          <span class="material-symbols-outlined">help</span>
        </button>
        <div class="h-8 w-8 rounded-full overflow-hidden bg-teal-100 border border-teal-200">
          <img
            alt="User profile avatar"
            class="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDM9nobU8xm-vAThyIwYlhQhpD7xA2Omgz-v4sajPG-KeiAlc7YdPvnKQylsNv5LodN-o-RNYadyGmQthiccSqLA4j5dgi9JpHRsL_zx7MIu8aYXB0JWDUaTS_qeoFkTiJ8AI5VJYqRG6e4GUnWpDJjUaOlgQ4UukMOwMGrAAjH7AyQz43DGvJKTt-WctvYwrkOSfhHjx9UWWpdkIJxfGZ5C7nZuqAaVbxovezYG3yX_Z3IgpOHAvYjjEgH-Qo8Y7k1x1IJUMDb7D9"
          />
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {}
