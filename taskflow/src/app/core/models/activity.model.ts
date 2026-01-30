// src/app/core/models/activity.model.ts
export type ActivityType =
  | 'created'
  | 'updated'
  | 'commented'
  | 'assigned'
  | 'status_changed'
  | 'priority_changed'
  | 'deleted'
  | 'reopened';

export interface Activity {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  action: ActivityType;
  details?: {
    before?: any;
    after?: any;
    field?: string;
  };
  createdAt: string;
  description: string;
}

export interface CreateActivityDto {
  taskId: string;
  userId: string;
  action: ActivityType;
  details?: any;
  description: string;
}
