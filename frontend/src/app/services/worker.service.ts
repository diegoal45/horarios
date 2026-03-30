import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WorkerService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<any> {
    // Usar el endpoint correcto para el usuario autenticado
    return this.api['http'].get<any>(this.api['apiUrl'] + '/user/profile');
  }

  getSchedules(): Observable<any> {
    return this.api.getMySchedules();
  }

  getShifts(): Observable<any> {
    return this.api.getMyShifts();
  }

  downloadReport(): Observable<HttpResponse<Blob>> {
    // Mismo flujo que jefe: backend resuelve alcance por rol/usuario autenticado
    return this.api.downloadTeamSchedulesPdf();
  }
}
