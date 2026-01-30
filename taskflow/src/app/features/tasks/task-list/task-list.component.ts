// Updated Tasks Component with Search & Filters
// src/app/features/tasks/task-list/task-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { SearchService } from '../../../core/services/search.service';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { FilterPanelComponent } from '../../../shared/components/filter-panel/filter-panel.component';
import { CommentsPanelComponent } from '../../../shared/components/comments-panel/comments-panel.component';
import { ActivityTimelineComponent } from '../../../shared/components/activity-timeline/activity-timeline.component';
import { AnalyticsWidgetComponent } from '../../../shared/components/analytics-widget/analytics-widget.component';
import { RecurringTasksComponent } from '../../../shared/components/recurring-tasks/recurring-tasks.component';
import { TemplatesManagerComponent } from '../../../shared/components/templates-manager/templates-manager.component';
import {
  Task,
  TaskPriority,
  TaskStatus,
  CreateTaskDto,
} from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchBarComponent,
    FilterPanelComponent,
    CommentsPanelComponent,
    ActivityTimelineComponent,
    AnalyticsWidgetComponent,
    RecurringTasksComponent,
    TemplatesManagerComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            All Tasks
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Search and filter your tasks
          </p>
        </div>

        <!-- Analytics Widget (Top of Tasks Page) -->
        <div class="mb-6">
          <app-analytics-widget [projectId]="'1'"></app-analytics-widget>
        </div>

        <!-- Recurring Tasks (Below Analytics) -->
        <div class="mb-6">
          <app-recurring-tasks></app-recurring-tasks>
        </div>

        <!-- Task Templates (Below Recurring Tasks) -->
        <div class="mb-6">
          <app-templates-manager></app-templates-manager>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-1">
            <app-filter-panel></app-filter-panel>
          </div>

          <!-- Tasks List -->
          <div class="lg:col-span-3 space-y-4">
            <!-- Add Task -->
            <div
              class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-4">
                <h2
                  class="text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  Add Task
                </h2>
                @if (errorMessage) {
                  <span class="text-sm text-red-600">{{ errorMessage }}</span>
                }
              </div>
              <form
                (ngSubmit)="createTask()"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Title</label
                  >
                  <input
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="title"
                    [(ngModel)]="newTask.title"
                    required
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Project ID</label
                  >
                  <input
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="projectId"
                    [(ngModel)]="newTask.projectId"
                    required
                  />
                </div>
                <div class="md:col-span-2">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Description</label
                  >
                  <textarea
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="description"
                    [(ngModel)]="newTask.description"
                  ></textarea>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Status</label
                  >
                  <select
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="status"
                    [(ngModel)]="newTask.status"
                  >
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Priority</label
                  >
                  <select
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="priority"
                    [(ngModel)]="newTask.priority"
                  >
                    @for (priority of priorities; track priority) {
                      <option [value]="priority">{{ priority }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Due Date</label
                  >
                  <input
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    name="dueDate"
                    [(ngModel)]="newTask.dueDate"
                  />
                </div>
                <div class="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    [disabled]="isSaving"
                  >
                    {{ isSaving ? 'Saving...' : 'Add Task' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Search Bar -->
            <app-search-bar></app-search-bar>

            <!-- Results Count -->
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ filteredTasks().length }} task(s) found
            </div>

            <!-- Tasks Grid -->
            <div class="grid gap-4">
              @for (task of filteredTasks(); track task.id) {
                <div
                  class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                >
                  <div class="flex items-start justify-between mb-3">
                    <h3
                      class="font-semibold text-lg text-gray-900 dark:text-gray-100"
                    >
                      {{ task.title }}
                    </h3>
                    <div class="flex gap-2 items-center">
                      <span
                        class="text-xs px-2 py-1 rounded"
                        [ngClass]="{
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300':
                            task.status === 'todo',
                          'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300':
                            task.status === 'in-progress',
                          'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300':
                            task.status === 'review',
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300':
                            task.status === 'done',
                        }"
                      >
                        {{ task.status }}
                      </span>
                      <span
                        class="text-xs px-2 py-1 rounded"
                        [ngClass]="{
                          'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300':
                            task.priority === 'low',
                          'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300':
                            task.priority === 'medium',
                          'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300':
                            task.priority === 'high',
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300':
                            task.priority === 'urgent',
                        }"
                      >
                        {{ task.priority }}
                      </span>
                      <button
                        class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        type="button"
                        (click)="startEdit(task)"
                      >
                        Edit
                      </button>
                      <button
                        class="text-xs text-red-600 dark:text-red-400 hover:underline"
                        type="button"
                        (click)="deleteTask(task)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ task.description }}
                  </p>

                  <div
                    class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500"
                  >
                    @if (task.dueDate) {
                      <span>Due: {{ task.dueDate | date: 'MMM d, yyyy' }}</span>
                    }
                    <span
                      >Created: {{ task.createdAt | date: 'MMM d, yyyy' }}</span
                    >
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12">
                  <svg
                    class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p class="text-gray-600 dark:text-gray-400">No tasks found</p>
                </div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>

    @if (editingTask) {
      <div
        class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      >
        <div
          class="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Task
            </h2>
            <button
              class="text-sm text-gray-500 hover:text-gray-700"
              type="button"
              (click)="cancelEdit()"
            >
              Close
            </button>
          </div>
          <form
            (ngSubmit)="saveEdit()"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Title</label
              >
              <input
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editTitle"
                [(ngModel)]="editingTask.title"
                required
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Project ID</label
              >
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editProjectId"
                [(ngModel)]="editingTask.projectId"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Description</label
              >
              <textarea
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editDescription"
                [(ngModel)]="editingTask.description"
              ></textarea>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Status</label
              >
              <select
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editStatus"
                [(ngModel)]="editingTask.status"
              >
                @for (status of statuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Priority</label
              >
              <select
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editPriority"
                [(ngModel)]="editingTask.priority"
              >
                @for (priority of priorities; track priority) {
                  <option [value]="priority">{{ priority }}</option>
                }
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Due Date</label
              >
              <input
                type="date"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                name="editDueDate"
                [(ngModel)]="editingTask.dueDate"
              />
            </div>
            <div class="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                (click)="cancelEdit()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                [disabled]="isSaving"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>

          <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-comments-panel [taskId]="editingTask.id"></app-comments-panel>
            <app-activity-timeline [taskId]="editingTask.id"></app-activity-timeline>
          </div>
        </div>
      </div>
    }
  `,
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private searchService = inject(SearchService);

  filteredTasks = this.searchService.filteredTasks;
  statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
  priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  newTask: Partial<Task> = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    projectId: '1',
    dueDate: '',
  };

  editingTask: Task | null = null;
  isSaving = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.refreshTasks();
  }

  refreshTasks(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.searchService.setTasks(tasks);
    });
  }

  createTask(): void {
    this.errorMessage = null;
    const payload = this.buildPayload(this.newTask);
    if (!payload.title || !payload.projectId) {
      this.errorMessage = 'Title and Project ID are required.';
      return;
    }

    this.isSaving = true;
    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.resetNewTask();
        this.refreshTasks();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.isSaving = false;
        this.errorMessage = 'Failed to create task. Is the API running?';
      },
    });
  }

  startEdit(task: Task): void {
    this.editingTask = { ...task };
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  saveEdit(): void {
    const editing = this.editingTask;
    if (!editing) return;

    this.errorMessage = null;
    this.isSaving = true;
    const payload = this.buildPayload(editing);
    this.taskService.updateTask(editing.id, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.editingTask = null;
        this.refreshTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.isSaving = false;
        this.errorMessage = 'Failed to update task. Is the API running?';
      },
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.errorMessage = null;
    this.isSaving = true;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.isSaving = false;
        this.refreshTasks();
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.isSaving = false;
        this.errorMessage = 'Failed to delete task. Is the API running?';
      },
    });
  }

  private resetNewTask(): void {
    this.newTask = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: '1',
      dueDate: '',
    };
  }

  private buildPayload(task: Partial<Task>): CreateTaskDto {
    const payload: CreateTaskDto = {
      title: task.title?.trim() || '',
      description: task.description?.trim() || '',
      priority: task.priority || 'medium',
      projectId: task.projectId?.toString() || '1',
    };

    if (task.dueDate) {
      payload.dueDate = task.dueDate;
    }

    if (task.tags && task.tags.length > 0) {
      payload.tags = task.tags;
    }

    if (task.assignee) {
      payload.assignee = task.assignee;
    }

    return payload;
  }
}
