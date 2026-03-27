import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
      <div 
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        [@slideIn]
        [ngClass]="getToastClasses(toast.type)"
        class="pointer-events-auto p-4 rounded-lg shadow-xl border"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <span class="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">
            {{ getIcon(toast.type) }}
          </span>
          
          <!-- Message -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium leading-snug break-words">{{ toast.message || 'Sin mensaje' }}</p>
          </div>

          <!-- Close button -->
          <button 
            (click)="removeToast(toast.id)"
            class="flex-shrink-0 text-lg hover:opacity-60 transition-opacity ml-2"
            type="button"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mt-2 h-1 bg-current opacity-20 rounded-full overflow-hidden">
          <div 
            class="h-full bg-current"
            [style.animation]="'progress ' + (toast.duration / 1000) + 's linear forwards'"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {
    console.log('ToastContainerComponent constructor - servicio inyectado');
  }

  ngOnInit(): void {
    console.log('ToastContainerComponent ngOnInit - suscribiéndome a toasts');
    this.toastService.toasts
      .pipe(takeUntil(this.destroy$))
      .subscribe((toasts) => {
        console.log('Toast actualizado:', toasts);
        console.log('Toasts array:', toasts.map(t => ({ id: t.id, message: t.message, type: t.type })));
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeToast(id: string): void {
    console.log('Removiendo toast con ID:', id);
    this.toastService.remove(id);
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  getIcon(type: string): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    };
    return icons[type as keyof typeof icons] || 'info';
  }

  getToastClasses(type: string): string {
    const classes = {
      success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
    };
    return classes[type as keyof typeof classes] || classes.info;
  }
}
