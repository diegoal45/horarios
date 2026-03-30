import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-worker-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worker-calendar.component.html',
  styleUrls: ['./worker-calendar.component.css']
})
export class WorkerCalendarComponent {
  @Input() calendar: any;
}
