import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="p-6 text-center">
      <p class="text-on-surface-variant/40 text-xs font-label uppercase tracking-[0.2em]">
        Precision Architect Design System v2.4
      </p>
    </footer>
  `,
  styles: []
})
export class FooterComponent {}
