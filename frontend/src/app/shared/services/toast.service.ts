import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts: Observable<Toast[]> = this.toasts$.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000): void {
    // Validar que el mensaje existe
    if (!message || typeof message !== 'string') {
      console.warn('ToastService.show - mensaje inválido:', message);
      message = 'Sin mensaje disponible';
    }

    const id = crypto.randomUUID();
    const toast: Toast = { 
      id, 
      message: String(message).trim(), 
      type, 
      duration: Math.max(1000, duration) 
    };

    console.log('ToastService.show - Creando toast:', toast);

    const current = this.toasts$.value;
    const updated = [...current, toast];
    
    // Emitir el nuevo estado
    this.toasts$.next(updated);
    console.log('ToastService - Toasts actualizados:', updated);

    // Auto-remove después del tiempo especificado
    setTimeout(() => {
      console.log('ToastService - Removiendo toast automáticamente con ID:', id);
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number): void {
    const finalMessage = message && message.trim() 
      ? message 
      : 'Operación exitosa.';
    this.show(finalMessage, 'success', duration || 4000);
  }

  error(message: string, duration?: number): void {
    const finalMessage = message && message.trim() 
      ? message 
      : 'Ha ocurrido un error. Por favor intenta de nuevo.';
    this.show(finalMessage, 'error', duration || 5000);
  }

  info(message: string, duration?: number): void {
    const finalMessage = message && message.trim() 
      ? message 
      : 'Información disponible.';
    this.show(finalMessage, 'info', duration || 4000);
  }

  warning(message: string, duration?: number): void {
    const finalMessage = message && message.trim() 
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
