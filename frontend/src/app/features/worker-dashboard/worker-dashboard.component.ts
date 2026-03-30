import { Component, OnInit } from '@angular/core';
import { WorkerService } from '../../services/worker.service';
import { CommonModule } from '@angular/common';
import { WorkerCalendarComponent } from './worker-calendar.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, WorkerCalendarComponent],
  templateUrl: './worker-dashboard.component.html',
  styleUrls: ['./worker-dashboard.component.css']
})
export class WorkerDashboardComponent implements OnInit {
  profile: any;
  schedules: any[] = [];
  shifts: any[] = [];
  summary: any;
  kpis: any;
  calendar: any;
  loading = true;
  error: string | null = null;

  constructor(
    private workerService: WorkerService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    Promise.all([
      this.workerService.getProfile().toPromise(),
      this.workerService.getSchedules().toPromise(),
      this.workerService.getShifts().toPromise()
    ]).then(([profile, schedules, shifts]) => {
      if (!profile || !profile.id) {
        this.error = 'No se pudo cargar el perfil del usuario autenticado.';
        this.loading = false;
        return;
      }
      // Mapear perfil a los campos esperados
      this.profile = {
        name: profile.name,
        role: profile.role,
        email: profile.email,
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email)}&background=random`,
        employeeId: profile.id,
        raw: profile
      };
      // Mapear horarios y turnos a formato usable
      this.schedules = Array.isArray(schedules) ? schedules : [];
      this.shifts = Array.isArray(shifts) ? shifts : [];
      this.calculateSummaryAndKPIs();
      this.buildCalendar();
      this.loading = false;
    }).catch(err => {
      this.error = 'Error cargando datos del usuario: ' + (err?.error?.message || err?.message || err);
      this.loading = false;
      console.error(err);
    });
  }

  private parseApiDate(dateValue: string | undefined): Date | null {
    if (!dateValue) {
      return null;
    }

    // API devuelve d/m/Y en my-schedules
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);
      const parsed = new Date(year, month, day);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  calculateSummaryAndKPIs() {
    // Ejemplo simple: sumar horas de los schedules de la semana actual
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Lunes
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Viernes

    const weekSchedules = this.schedules.filter(s => {
      const d = this.parseApiDate(s.date || s.start);
      return !!d && d >= weekStart && d <= weekEnd;
    });
    const workedHours = weekSchedules.reduce((sum, s) => sum + Number(s.hours || s.duration || 0), 0);
    const totalHours = 44; // O puedes calcularlo dinámicamente
    const percent = Math.round((workedHours / totalHours) * 100);
    const remainingHours = Math.max(0, totalHours - workedHours);

    this.summary = {
      workedHours,
      totalHours,
      percent,
      remainingHours
    };

    // KPIs ejemplo
    const todaySchedules = this.schedules.filter(s => {
      const d = this.parseApiDate(s.date || s.start);
      return !!d
        && d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate();
    });
    const todayWorked = todaySchedules.reduce((sum, s) => sum + Number(s.hours || s.duration || 0), 0);
    this.kpis = {
      weeklyAssigned: workedHours,
      weeklyTotal: totalHours,
      todayWorked,
      todayTotal: 7 // O calcula según contrato
    };
  }

  buildCalendar() {
    // Configuración de días y horas igual que el calendario del jefe
    const daysOfWeek = [
      { short: 'Lun', full: 'Lunes' },
      { short: 'Mar', full: 'Martes' },
      { short: 'Mie', full: 'Miércoles' },
      { short: 'Jue', full: 'Jueves' },
      { short: 'Vie', full: 'Viernes' }
    ];
    const hours = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];
    const rowHeight = 56;
    const gridHeight = hours.length * rowHeight;

    // Calcular semana actual (lunes a viernes)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const weekDays = daysOfWeek.map((d, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return { ...d, date: date.getDate() };
    });
    const weekStart = weekDays[0];
    const weekEnd = weekDays[4];

    // Mapear los turnos a bloques visuales
    const shifts = (this.schedules || []).map((shift) => {
      // API my-schedules devuelve campo shift con el nombre del día (Lunes, Martes, ...)
      const dayLabel = String(shift.shift || shift.day_of_week || '').toLowerCase();
      const dayIdx = daysOfWeek.findIndex(d => dayLabel.startsWith(d.full.toLowerCase().slice(0, 3)));
      if (dayIdx === -1) {
        return null;
      }

      // Horas
      const startRaw = String(shift.startTime || shift.start_time || shift.start || '07:00');
      const endRaw = String(shift.endTime || shift.end_time || shift.end || '08:00');
      const [startHour, startMin] = startRaw.split(':').map(Number);
      const [endHour, endMin] = endRaw.split(':').map(Number);
      const startRow = (startHour - 7) + (startMin / 60);
      const endRow = (endHour - 7) + (endMin / 60);
      const height = Math.max(1, endRow - startRow);

      // Visual
      return {
        top: startRow * rowHeight,
        left: dayIdx * 20 + 2,
        width: 16,
        height: height * rowHeight,
        type: shift.type || 'Turno',
        location: shift.location || shift.task || shift.shift || 'Turno asignado',
        start: startRaw.slice(0, 5),
        end: endRaw.slice(0, 5)
      };
    }).filter(Boolean);

    this.calendar = {
      weekStart: `${weekStart.short} ${weekStart.date}`,
      weekEnd: `${weekEnd.short} ${weekEnd.date}`,
      days: weekDays,
      hours,
      shifts,
      gridHeight
    };
  }

  printSchedule() {
    window.print();
  }

  downloadReport() {
    this.workerService.downloadReport().subscribe({
      next: (response) => {
        const pdfBlob = response.body;
        if (!pdfBlob || pdfBlob.size === 0) {
          this.toastService.error('El PDF se genero vacio.');
          return;
        }

        const filename = this.extractFilenameFromDisposition(response.headers.get('content-disposition'))
          || `horario_usuario_${new Date().toISOString().split('T')[0]}.pdf`;

        this.saveBlob(pdfBlob, filename);
        this.toastService.success('Reporte descargado correctamente.');
      },
      error: (err) => {
        this.handleDownloadError(err);
      }
    });
  }

  private handleDownloadError(err: any): void {
    // Cuando responseType es blob, errores JSON también llegan como Blob.
    if (err?.error instanceof Blob) {
      err.error.text().then((raw: string) => {
        try {
          const parsed = JSON.parse(raw);
          this.toastService.error(parsed?.error || parsed?.message || 'No se pudo descargar el reporte.');
        } catch {
          this.toastService.error('No se pudo descargar el reporte.');
        }
      }).catch(() => {
        this.toastService.error('No se pudo descargar el reporte.');
      });
      return;
    }

    this.toastService.error(err?.error?.error || err?.error?.message || 'No se pudo descargar el reporte.');
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private extractFilenameFromDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]).replace(/['"]/g, '').trim();
    }

    const basicMatch = contentDisposition.match(/filename=([^;]+)/i);
    if (basicMatch?.[1]) {
      return basicMatch[1].replace(/['"]/g, '').trim();
    }

    return null;
  }
}
