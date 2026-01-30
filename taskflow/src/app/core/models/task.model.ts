// src/app/core/models/task.model.ts
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  projectId: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignee?: string;
  search?: string;
}
