// src/app/shared/components/activity-timeline/activity-timeline.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../core/services/activity.service';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Activity Timeline</h3>

      <div class="space-y-4">
        @for (activity of activities(); track activity.id) {
          <div class="flex gap-4">
            <!-- Timeline dot -->
            <div class="flex flex-col items-center">
              <div class="w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
              @if (!$last) {
                <div class="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 my-2"></div>
              }
            </div>

            <!-- Activity content -->
            <div class="flex-1 pb-4">
              <p class="font-semibold text-gray-900 dark:text-gray-100">
                {{ getActivityLabel(activity.action) }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ activity.userName || 'System' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {{ activity.createdAt | date: 'short' }}
              </p>
              @if (activity.description) {
                <div class="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {{ activity.description }}
                </div>
              }
            </div>
          </div>
        }

        @if (activities().length === 0) {
          <p class="text-gray-500 dark:text-gray-400 text-center py-8">No activity yet</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ActivityTimelineComponent implements OnInit {
  @Input() taskId!: string;

  private activityService = inject(ActivityService);

  activities = this.activityService.activityList;

  ngOnInit() {
    if (this.taskId) {
      this.activityService.getActivitiesByTask(this.taskId).subscribe();
    }
  }

  getActivityLabel(action: string): string {
    const labels: Record<string, string> = {
      'created': '🆕 Created',
      'updated': '✏️ Updated',
      'commented': '💬 Commented',
      'assigned': '👤 Assigned',
      'status_changed': '🔄 Status Changed',
      'priority_changed': '🎯 Priority Changed',
      'deleted': '🗑️ Deleted',
      'reopened': '🔄 Reopened'
    };
    return labels[action] || action;
  }
}
