import { User } from './user.model';

export interface Schedule {
  id: number;
  user_id: number;
  date: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateScheduleRequest {
  user_id: number;
  date: string;
}
