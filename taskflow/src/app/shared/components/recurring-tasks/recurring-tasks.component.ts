// src/app/shared/components/recurring-tasks/recurring-tasks.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecurringTaskService } from '../../../core/services/recurring-task.service';
import { RecurringTask } from '../../../core/models/recurring-task.model';

@Component({
  selector: 'app-recurring-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        ⏰ Recurring Tasks
      </h3>

      <!-- Recurring Tasks List -->
      <div class="space-y-3">
        @for (task of recurringTasks(); track task.id) {
          <div
            class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ task.title }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ task.description }}
                </p>
              </div>
              <button
                (click)="toggleTask(task.id, !task.isActive)"
                class="px-3 py-1 rounded text-sm font-medium transition"
                [ngClass]="
                  task.isActive
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                "
              >
                {{ task.isActive ? '✓ Active' : '○ Paused' }}
              </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div class="bg-white dark:bg-gray-700 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Frequency</span>
                <p
                  class="font-semibold text-gray-900 dark:text-gray-100 capitalize"
                >
                  {{ task.frequency }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-700 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Priority</span>
                <p
                  class="font-semibold text-gray-900 dark:text-gray-100 capitalize"
                >
                  {{ task.priority }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-700 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Instances</span>
                <p class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ task.generatedInstances || 0 }}
                </p>
              </div>
              <div class="bg-white dark:bg-gray-700 p-2 rounded">
                <span class="text-gray-600 dark:text-gray-400">Next Date</span>
                <p class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ task.nextDueDate | date: 'short' }}
                </p>
              </div>
            </div>

            <button
              (click)="generateNextInstance(task.id)"
              class="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition"
            >
              Generate Next Instance
            </button>
          </div>
        }

        @if (recurringTasks().length === 0) {
          <p class="text-gray-500 dark:text-gray-400 text-center py-8">
            No recurring tasks. Set up one for regular work!
          </p>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RecurringTasksComponent implements OnInit {
  private recurringService = inject(RecurringTaskService);

  recurringTasks = this.recurringService.taskList;

  ngOnInit() {
    this.recurringService.getRecurringTasks().subscribe();
  }

  toggleTask(taskId: string, isActive: boolean) {
    this.recurringService.updateRecurringTask(taskId, { isActive }).subscribe();
  }

  generateNextInstance(taskId: string) {
    this.recurringService.generateNextInstance(taskId).subscribe({
      next: () => {
        alert('Next instance generated successfully!');
      },
    });
  }
}
