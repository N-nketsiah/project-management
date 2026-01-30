import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchFilters } from '../../../core/services/search.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        <button
          (click)="resetFilters()"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all
        </button>
      </div>

      <div class="space-y-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            [(ngModel)]="filters.status"
            (ngModelChange)="applyFilters()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option [ngValue]="undefined">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <select
            [(ngModel)]="filters.priority"
            (ngModelChange)="applyFilters()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option [ngValue]="undefined">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <!-- Project Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project
          </label>
          <select
            [(ngModel)]="filters.projectId"
            (ngModelChange)="applyFilters()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option [ngValue]="undefined">All Projects</option>
            @for (project of projects(); track project.id) {
              <option [ngValue]="project.id">{{ project.name }}</option>
            }
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created From
          </label>
          <input
            type="date"
            [(ngModel)]="filters.dateFrom"
            (ngModelChange)="applyFilters()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created To
          </label>
          <input
            type="date"
            [(ngModel)]="filters.dateTo"
            (ngModelChange)="applyFilters()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Active Filters Summary -->
      @if (activeFiltersCount() > 0) {
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ activeFiltersCount() }} filter(s) active
          </p>
        </div>
      }
    </div>
  `
})
export class FilterPanelComponent implements OnInit {
  filters: SearchFilters = { query: '' };
  projects = signal<Project[]>([]);

  constructor(
    private searchService: SearchService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(projects => {
      this.projects.set(projects);
    });

    // Initialize with current filters
    this.filters = { ...this.searchService.getFilters() };
  }

  applyFilters(): void {
    this.searchService.updateFilters(this.filters);
  }

  resetFilters(): void {
    this.filters = { query: this.filters.query }; // Keep search query
    this.searchService.resetFilters();
  }

  activeFiltersCount(): number {
    let count = 0;
    if (this.filters.status) count++;
    if (this.filters.priority) count++;
    if (this.filters.projectId) count++;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    return count;
  }
}
