export interface Team {
  id: number;
  name: string;
  description: string;
  leader_id: number;
  leader: { id: number; name: string; email: string };
  members: any[];
  max_members: number;
  is_active: boolean;
  created_at: string;
}
