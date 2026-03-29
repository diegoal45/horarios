import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="modalService.modal() as modalData" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop with blur effect -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" (click)="close()"></div>
      
      <!-- Modal -->
      <div class="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700">
        <!-- Gradient accent line -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-transparent"></div>
        
        <!-- Background blur effect -->
        <div class="absolute top-0 right-0 w-40 h-40 bg-teal-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <!-- Header -->
        <div class="relative z-10 flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <div>
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {{ modalData.title }}
            </h2>
          </div>
          <button 
            (click)="close()" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="relative z-10 p-8 overflow-y-auto max-h-[calc(80vh-180px)] text-slate-900 dark:text-slate-100">
          <div [innerHTML]="modalData.content"></div>
        </div>

        <!-- Actions Footer -->
        <div *ngIf="modalData.actions && modalData.actions.length > 0" class="relative z-10 flex gap-3 p-8 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
          <button 
            *ngFor="let action of modalData.actions"
            (click)="executeAction(action)"
            [class.bg-gradient-to-r]="action.type === 'primary'"
            [class.from-teal-600]="action.type === 'primary'"
            [class.to-emerald-600]="action.type === 'primary'"
            [class.hover:from-teal-700]="action.type === 'primary'"
            [class.hover:to-emerald-700]="action.type === 'primary'"
            [class.border]="action.type === 'secondary'"
            [class.border-slate-300]="action.type === 'secondary'"
            [class.dark:border-slate-600]="action.type === 'secondary'"
            [class.text-slate-700]="action.type === 'secondary'"
            [class.dark:text-slate-300]="action.type === 'secondary'"
            [class.hover:bg-slate-100]="action.type === 'secondary'"
            [class.dark:hover:bg-slate-800]="action.type === 'secondary'"
            [class.text-white]="action.type === 'primary'"
            class="px-6 py-2.5 font-semibold rounded-lg transition-all"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  constructor(public modalService: ModalService) {}

  executeAction(action: any): void {
    if (action.action) {
      action.action();
    }
  }

  close(): void {
    this.modalService.close();
  }
}
