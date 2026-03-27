import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatCard {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-4">
        <span [class]="'p-2 rounded-lg material-symbols-outlined ' + card.iconBgColor + ' ' + card.iconColor">
          {{ card.icon }}
        </span>
        <span *ngIf="card.trend" [class]="'text-xs font-bold px-2 py-0.5 rounded ' + trendBgColor + ' ' + trendTextColor">
          {{ card.trend }}
        </span>
      </div>
      <div>
        <p class="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{{ card.label }}</p>
        <h3 class="text-3xl font-bold tracking-tighter text-slate-900">{{ card.value }}</h3>
      </div>
    </div>
  `,
  styles: []
})
export class StatCardComponent {
  @Input() card!: StatCard;

  get trendBgColor(): string {
    return this.card.trendColor === 'amber' ? 'bg-amber-50' : 'bg-teal-50';
  }

  get trendTextColor(): string {
    return this.card.trendColor === 'amber' ? 'text-amber-600' : 'text-teal-600';
  }
}
