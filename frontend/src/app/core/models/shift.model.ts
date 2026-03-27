import { Schedule } from './schedule.model';

export interface Shift {
  id: number;
  schedule_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  schedule?: Schedule;
}

export interface CreateShiftRequest {
  schedule_id: number;
  start_time: string;
  end_time: string;
}
