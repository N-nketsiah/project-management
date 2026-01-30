// src/app/core/models/analytics.model.ts
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCompletionTime: number;
  tasksOverdue: number;
  tasksByStatus: TaskStatusStats[];
  tasksByPriority: TaskPriorityStats[];
  tasksByAssignee: TaskAssigneeStats[];
  weeklyTrend: WeeklyTrendData[];
  projectMetrics: ProjectMetrics[];
}

export interface TaskStatusStats {
  status: string;
  count: number;
  percentage: number;
}

export interface TaskPriorityStats {
  priority: string;
  count: number;
  avgCompletionTime: number;
}

export interface TaskAssigneeStats {
  assigneeId: string;
  assigneeName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  avgCompletionTime: number;
}

export interface WeeklyTrendData {
  week: string;
  created: number;
  completed: number;
  inProgress: number;
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  health: 'good' | 'warning' | 'critical';
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  tasksCompleted: number;
  avgCompletionTime: number;
  currentWorkload: number;
  productivityScore: number;
  trend: 'up' | 'down' | 'stable';
}
