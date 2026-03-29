import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
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

  getMySchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/my-schedules`);
  }

  getUserSchedules(userId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/schedules`);
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

  generateSchedules(teamId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules/generate`, { team_id: teamId });
  }

  publishSchedules(teamId: number, weekStart: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules/publish`, { team_id: teamId, week_start: weekStart });
  }

  getTeamSchedules(teamId: number, weekStart: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams/${teamId}/schedules?week_start=${weekStart}`);
  }

  updateSchedules(shifts: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/shifts/bulk-update`, { shifts });
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

  // ====== TEAMS ======
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams`);
  }

  getTeam(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/teams/${id}`);
  }

  getLedTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/led-teams`);
  }

  getUserTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-teams`);
  }

  createTeam(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams`, data);
  }

  updateTeam(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/teams/${id}`, data);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teams/${id}`);
  }

  getTeamMembers(teamId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/teams/${teamId}/members`);
  }

  addTeamMember(teamId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams/${teamId}/members`, { user_id: userId });
  }

  removeTeamMember(teamId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/teams/${teamId}/members`, {
      body: { user_id: userId }
    });
  }

  // ====== REPORTS ======
  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/users`, { responseType: 'blob' });
  }

  exportSchedules(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/schedules`, { responseType: 'blob' });
  }

  downloadTeamSchedulesPdf(userId?: string | number): Observable<HttpResponse<Blob>> {
    const url = userId
      ? `${this.apiUrl}/reports/team-schedules-pdf?user_id=${encodeURIComponent(String(userId))}`
      : `${this.apiUrl}/reports/team-schedules-pdf`;

    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  getAccessLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/access-log`);
  }
}
