// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { forkJoin } from 'rxjs';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalProjects: number;
  completionRate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalProjects: 0,
    completionRate: 0
  });

  tasks = signal<Task[]>([]);
  projects = signal<Project[]>([]);
  loading = signal(false);

  // Task Status Chart
  taskStatusChart: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
      hoverBackgroundColor: ['#64748b', '#2563eb', '#d97706', '#059669']
    }]
  };

  taskStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Priority Distribution Chart
  priorityChart: ChartConfiguration<'bar'>['data'] = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [{
      label: 'Tasks by Priority',
      data: [0, 0, 0, 0],
      backgroundColor: '#3b82f6',
      borderRadius: 6
    }]
  };

  priorityChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({
      tasks: this.taskService.getTasks(),
      projects: this.projectService.getProjects()
    }).subscribe({
      next: ({ tasks, projects }) => {
        this.tasks.set(tasks);
        this.projects.set(projects);
        this.calculateStats(tasks, projects);
        this.updateCharts(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading.set(false);
      }
    });
  }

  calculateStats(tasks: Task[], projects: Project[]): void {
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    this.stats.set({
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      totalProjects: projects.length,
      completionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
    });
  }

  updateCharts(tasks: Task[]): void {
    // Update status chart
    const statusCounts = {
      'todo': tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      'review': tasks.filter(t => t.status === 'review').length,
      'done': tasks.filter(t => t.status === 'done').length
    };

    this.taskStatusChart.datasets[0].data = [
      statusCounts['todo'],
      statusCounts['in-progress'],
      statusCounts['review'],
      statusCounts['done']
    ];

    // Update priority chart
    const priorityCounts = {
      'low': tasks.filter(t => t.priority === 'low').length,
      'medium': tasks.filter(t => t.priority === 'medium').length,
      'high': tasks.filter(t => t.priority === 'high').length,
      'urgent': tasks.filter(t => t.priority === 'urgent').length
    };

    this.priorityChart.datasets[0].data = [
      priorityCounts['low'],
      priorityCounts['medium'],
      priorityCounts['high'],
      priorityCounts['urgent']
    ];
  }

  getRecentTasks(): Task[] {
    return this.tasks()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}
