import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  content: any;
  actions?: any;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSignal = signal<ModalConfig | null>(null);
  modal = signal<ModalConfig | null>(null);
  
  open(config: ModalConfig) {
    this.modal.set(config);
    this.modalSignal.set(config);
  }

  close() {
    this.modal.set(null);
    this.modalSignal.set(null);
  }
}
