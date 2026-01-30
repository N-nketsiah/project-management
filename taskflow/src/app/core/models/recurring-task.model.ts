// src/app/core/models/recurring-task.model.ts
export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export interface RecurringTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  frequency: RecurrenceFrequency;
  nextDueDate: string;
  lastGeneratedDate?: string;
  generatedInstances?: number;
  endDate?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  createdBy: string;
}

export interface CreateRecurringTaskDto {
  title: string;
  description: string;
  projectId: string;
  frequency: RecurrenceFrequency;
  nextDueDate: string;
  endDate?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateRecurringTaskDto {
  title?: string;
  description?: string;
  frequency?: RecurrenceFrequency;
  nextDueDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  isActive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
