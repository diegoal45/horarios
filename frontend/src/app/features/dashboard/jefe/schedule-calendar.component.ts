import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

interface ScheduleBlock {
  id: string;
  title: string;
  task: string;
  startTime: string;
  endTime: string;
  type: 'Apertura' | 'Temprano' | 'Extendido' | 'Corto';
  color: 'green' | 'teal' | 'orange';
  day: number;
  startRow: number;
  height: number;
}

interface Employee {
  id: string | number;
  name: string;
  role?: string;
}

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 border border-outline-variant/5">
      <!-- Header for Calendar -->
      <div class="px-8 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed">
            <span class="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <div>
            <h1 class="text-title-lg font-bold text-on-surface leading-tight">
              Calendario: {{ selectedEmployee?.name || 'Empleado' }}
            </h1>
            <p class="text-label-sm text-secondary">{{ weekDisplay }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            (click)="goToToday()"
            class="bg-surface-container-highest px-3 py-1.5 rounded-lg text-on-surface text-label-md font-medium hover:bg-surface-container-high transition-colors"
          >
            Hoy
          </button>
          <div class="flex bg-surface-container-low rounded-lg p-1">
            <button
              (click)="previousWeek()"
              class="p-1 hover:bg-surface-container-lowest rounded transition-colors"
            >
              <span class="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              (click)="nextWeek()"
              class="p-1 hover:bg-surface-container-lowest rounded transition-colors"
            >
              <span class="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex-1 overflow-auto hide-scrollbar relative">
        <div class="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr] min-w-[800px]">
          <!-- Header Days -->
          <div class="sticky top-0 z-20 bg-surface-container-low border-b border-outline-variant/10 py-2"></div>

          <div
            *ngFor="let day of weekDays"
            class="sticky top-0 z-20 bg-surface-container-low border-b border-outline-variant/10 py-2 text-center"
          >
            <p class="text-[0.65rem] text-secondary uppercase font-semibold">{{ day.label }}</p>
            <p class="text-title-sm font-bold">{{ day.date }}</p>
          </div>

          <!-- Time Slots & Grid Lines -->
          <!-- Hour Column -->
          <div class="col-start-1 bg-surface-container-low/20 space-y-0">
            <div
              *ngFor="let hour of hours"
              class="grid-row-h flex items-start justify-center pt-2 text-[0.65rem] font-medium text-secondary"
            >
              {{ hour }}
            </div>
          </div>

          <!-- Grid Background & Schedule Blocks -->
          <div class="col-start-2 col-end-7 grid grid-cols-5 relative" [style.height.px]="gridHeight">
            <!-- Column lines -->
            <div class="absolute inset-0 grid grid-cols-5 pointer-events-none">
              <div class="border-r border-outline-variant/5"></div>
              <div class="border-r border-outline-variant/5"></div>
              <div class="border-r border-outline-variant/5"></div>
              <div class="border-r border-outline-variant/5"></div>
              <div></div>
            </div>

            <!-- Row lines -->
            <div class="absolute inset-0 flex flex-col pointer-events-none">
              <div
                *ngFor="let hour of hours"
                class="grid-row-h border-b border-outline-variant/5"
              ></div>
            </div>

            <!-- Schedule Blocks -->
            <div
              *ngFor="let block of scheduleBlocks"
              [ngClass]="getBlockClasses(block)"
              class="absolute p-2.5 rounded-lg shadow-sm z-10 flex flex-col justify-between border-l-[4px]"
              [style.top.px]="block.startRow * rowHeight + 48"
              [style.height.px]="block.height * rowHeight"
              [style.width.%]="16"
              [style.left.%]="(block.day - 1) * 20 + 2"
            >
              <div>
                <p class="text-[0.55rem] font-bold uppercase tracking-widest" [ngClass]="getTypeColor(block)">
                  {{ block.type }}
                </p>
                <p class="text-[0.7rem] font-bold leading-tight mt-0.5">{{ block.task }}</p>
              </div>
              <p class="text-[0.6rem] font-medium text-secondary">{{ block.startTime }} - {{ block.endTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid-row-h {
        height: 3.5rem;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
  ]
})
export class ScheduleCalendarComponent implements OnInit {
  @Input() selectedEmployee: Employee | null = null;

  hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  weekDays: Array<{ label: string; date: number }> = [];
  scheduleBlocks: ScheduleBlock[] = [];
  currentWeekStart = new Date();
  rowHeight = 56; // grid-row-h height
  gridHeight = this.hours.length * this.rowHeight + 48;

  weekDisplay = '';

  constructor(private apiService: ApiService) {
    this.initializeWeek();
  }

  ngOnInit(): void {
    this.loadSchedules();
  }

  ngOnChanges(): void {
    this.loadSchedules();
  }

  private initializeWeek(): void {
    const now = this.currentWeekStart;
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));

    this.weekDays = [];
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      this.weekDays.push({
        label: days[i],
        date: date.getDate()
      });
    }

    const endDate = new Date(monday);
    endDate.setDate(monday.getDate() + 4);
    this.weekDisplay = `Semana del ${monday.getDate()} al ${endDate.getDate()} de ${this.getMonthName(monday.getMonth())}, ${monday.getFullYear()}`;
  }

  private loadSchedules(): void {
    if (!this.selectedEmployee) return;

    // Load real schedules from API
    this.apiService.getUserSchedules(this.selectedEmployee.id).subscribe({
      next: (shifts: any[]) => {
        // Transform API shifts into ScheduleBlock format
        this.scheduleBlocks = shifts.map((shift, index) => {
          const startHour = parseInt(shift.startTime.split(':')[0]);
          const startMinutes = parseInt(shift.startTime.split(':')[1]);
          const startRow = (startHour - 7) + (startMinutes / 60); // Calculate grid row relative to 7:00
          
          const endHour = parseInt(shift.endTime.split(':')[0]);
          const endMinutes = parseInt(shift.endTime.split(':')[1]);
          const endTotalHours = endHour + (endMinutes / 60);
          const height = endTotalHours - startHour; // Height in hours

          // Determine type based on start time and duration
          let type: 'Apertura' | 'Temprano' | 'Extendido' | 'Corto' = 'Apertura';
          if (startHour < 8) type = 'Temprano';
          if (height > 8) type = 'Extendido';
          if (height < 6) type = 'Corto';

          // Get day of week index, but add 1 because template expects 1-5 not 0-4
          const dayMap = {
            'Lunes': 1,
            'Martes': 2,
            'Miércoles': 3,
            'Jueves': 4,
            'Viernes': 5
          };
          const dayColumn = dayMap[shift.shift as keyof typeof dayMap] ?? 1;

          return {
            id: shift.id.toString(),
            title: `${shift.shift}`,
            task: `${shift.startTime} - ${shift.endTime}`,
            startTime: shift.startTime,
            endTime: shift.endTime,
            type,
            color: type === 'Temprano' ? 'green' : (type === 'Extendido' ? 'teal' : 'orange'),
            day: dayColumn,
            startRow,
            height
          };
        });
      },
      error: (err) => {
        console.error('Error loading employee schedules:', err);
        this.scheduleBlocks = [];
      }
    });
  }

  getBlockClasses(block: ScheduleBlock): object {
    const colorMap = {
      green: 'bg-green-500/10 border-green-500/20 text-on-surface glass-card border-l-green-600',
      teal: 'bg-teal-500/10 border-teal-500/20 text-on-surface glass-card border-l-teal-800',
      orange: 'bg-orange-500/10 border-orange-500/20 text-on-surface glass-card border-l-orange-600'
    };
    return {
      [colorMap[block.color]]: true
    };
  }

  getTypeColor(block: ScheduleBlock): string {
    const colorMap = {
      green: 'text-green-700',
      teal: 'text-teal-900',
      orange: 'text-orange-700'
    };
    return colorMap[block.color];
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.initializeWeek();
    this.loadSchedules();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.initializeWeek();
    this.loadSchedules();
  }

  goToToday(): void {
    this.currentWeekStart = new Date();
    this.initializeWeek();
    this.loadSchedules();
  }

  private getMonthName(month: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month];
  }
}
