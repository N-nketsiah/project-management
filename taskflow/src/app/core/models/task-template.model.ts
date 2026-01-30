// src/app/core/models/task-template.model.ts
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
  defaultAssignee?: string;
  createdAt: string;
  createdBy: string;
  usageCount: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface CreateTemplateDto {
  name: string;
  description: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags?: string[];
  checklist?: Omit<ChecklistItem, 'id'>[];
  defaultAssignee?: string;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
  defaultAssignee?: string;
}
