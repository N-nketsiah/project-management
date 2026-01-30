// src/app/shared/components/analytics-widget/analytics-widget.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { TaskAnalytics } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-analytics-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Completion Rate -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-6">
        <h4 class="text-sm font-medium opacity-90">Completion Rate</h4>
        <p class="text-3xl font-bold mt-2">{{ analytics()?.completionRate | number: '1.0-0' }}%</p>
        <p class="text-xs opacity-75 mt-2">{{ analytics()?.completedTasks }} of {{ analytics()?.totalTasks }} tasks</p>
      </div>

      <!-- Average Completion Time -->
      <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-sm p-6">
        <h4 class="text-sm font-medium opacity-90">Avg Completion</h4>
        <p class="text-3xl font-bold mt-2">{{ analytics()?.avgCompletionTime | number: '1.1-1' }}d</p>
        <p class="text-xs opacity-75 mt-2">Average days to complete</p>
      </div>

      <!-- Overdue Tasks -->
      <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-sm p-6">
        <h4 class="text-sm font-medium opacity-90">Overdue</h4>
        <p class="text-3xl font-bold mt-2">{{ analytics()?.tasksOverdue }}</p>
        <p class="text-xs opacity-75 mt-2">Tasks needing attention</p>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      @for (status of analytics()?.tasksByStatus; track status.status) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ status.status }}</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ status.count }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ status.percentage | number: '1.0-0' }}%</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AnalyticsWidgetComponent implements OnInit {
  @Input() projectId!: string;

  private analyticsService = inject(AnalyticsService);

  analytics = this.analyticsService.analytics;

  ngOnInit() {
    if (this.projectId) {
      this.analyticsService.getProjectAnalytics(this.projectId).subscribe();
    }
  }
}
