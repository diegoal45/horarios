import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Schedule, Shift } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ====== USERS ======
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, data);
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // ====== SCHEDULES ======
  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/schedules`);
  }

  getSchedule(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/schedules/${id}`);
  }

  createSchedule(data: any): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}/schedules`, data);
  }

  updateSchedule(id: number, data: any): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/schedules/${id}`, data);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/schedules/${id}`);
  }

  generateSchedules(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules/generate`, data);
  }

  publishSchedules(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules/${id}/publish`, {});
  }

  // ====== SHIFTS ======
  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts`);
  }

  getShift(id: number): Observable<Shift> {
    return this.http.get<Shift>(`${this.apiUrl}/shifts/${id}`);
  }

  createShift(data: any): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/shifts`, data);
  }

  updateShift(id: number, data: any): Observable<Shift> {
    return this.http.put<Shift>(`${this.apiUrl}/shifts/${id}`, data);
  }

  deleteShift(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/shifts/${id}`);
  }

  getMyShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/my-shifts`);
  }

  // ====== REPORTS ======
  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/users`, { responseType: 'blob' });
  }

  exportSchedules(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/schedules`, { responseType: 'blob' });
  }

  getAccessLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/access-log`);
  }
}
