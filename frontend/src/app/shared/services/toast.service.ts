import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts: Observable<Toast[]> = this.toasts$.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): void {
    try {
      // Validar y sanitizar mensaje
      if (!message) {
        message = 'Sin mensaje disponible';
      }
      
      const cleanMessage = String(message).trim();
      if (!cleanMessage) {
        message = 'Sin mensaje disponible';
      } else {
        message = cleanMessage;
      }

      const id = crypto.randomUUID();
      const toast: Toast = { 
        id, 
        message, 
        type, 
        duration: Math.max(2000, Math.min(duration || 5000, 10000)), // Min 2s, Max 10s
        createdAt: Date.now()
      };

      console.log('ToastService.show - Creando toast:', { id: id.substring(0, 8), message, type, duration: toast.duration });

      const current = this.toasts$.value;
      const updated = [...current, toast];
      
      // Emitir el nuevo estado
      this.toasts$.next(updated);
      console.log('ToastService.show - Toasts actualizados. Total:', updated.length);
    } catch (error) {
      console.error('ToastService.show - Error al crear toast:', error);
      // Fallback: intentar crear un toast simple
      const id = crypto.randomUUID();
      try {
        const fallbackToast: Toast = {
          id,
          message: 'Operación completada',
          type: type || 'info',
          duration: 5000,
          createdAt: Date.now()
        };
        this.toasts$.next([...this.toasts$.value, fallbackToast]);
      } catch (e) {
        console.error('ToastService.show - Fallback también falló:', e);
      }
    }
  }

  success(message: string, duration?: number): void {
    const finalMessage = message && String(message).trim() 
      ? message 
      : 'Operación exitosa.';
    this.show(finalMessage, 'success', duration || 4000);
  }

  error(message: string, duration?: number): void {
    const finalMessage = message && String(message).trim() 
      ? message 
      : 'Ha ocurrido un error. Por favor intenta de nuevo.';
    console.error('ToastService.error siendo llamado con mensaje:', finalMessage);
    this.show(finalMessage, 'error', duration || 5000);
  }

  info(message: string, duration?: number): void {
    const finalMessage = message && String(message).trim() 
      ? message 
      : 'Información disponible.';
    this.show(finalMessage, 'info', duration || 4000);
  }

  warning(message: string, duration?: number): void {
    const finalMessage = message && String(message).trim() 
      ? message 
      : 'Advertencia importante.';
    this.show(finalMessage, 'warning', duration || 4000);
  }

  remove(id: string): void {
    const current = this.toasts$.value;
    const updated = current.filter(t => t.id !== id);
    this.toasts$.next(updated);
    console.log('ToastService.remove - Toast removido. Toasts restantes:', updated);
  }

  clear(): void {
    this.toasts$.next([]);
    console.log('ToastService.clear - Todos los toasts removidos');
  }
}
