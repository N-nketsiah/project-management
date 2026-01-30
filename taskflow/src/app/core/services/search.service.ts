import { Injectable, signal, computed } from '@angular/core';
import { Task } from '../models/task.model';

export interface SearchFilters {
  query: string;
  status?: string;
  priority?: string;
  projectId?: number;
  assignee?: number;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private allTasks = signal<Task[]>([]);
  private filters = signal<SearchFilters>({ query: '' });

  // Computed filtered tasks
  filteredTasks = computed(() => {
    const tasks = this.allTasks();
    const filter = this.filters();

    return tasks.filter((task) => {
      // Text search
      if (filter.query) {
        const query = filter.query.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description
          ?.toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (filter.status && task.status !== filter.status) return false;

      // Priority filter
      if (filter.priority && task.priority !== filter.priority) return false;

      // Project filter
      if (filter.projectId && task.projectId !== filter.projectId.toString())
        return false;

      // Assignee filter
      if (filter.assignee && task.assignee !== filter.assignee.toString())
        return false;

      // Date range filter
      if (filter.dateFrom && task.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && task.createdAt > filter.dateTo) return false;

      return true;
    });
  });

  setTasks(tasks: Task[]): void {
    this.allTasks.set(tasks);
  }

  updateFilters(filters: Partial<SearchFilters>): void {
    this.filters.update((current) => ({ ...current, ...filters }));
  }

  resetFilters(): void {
    this.filters.set({ query: '' });
  }

  getFilters() {
    return this.filters();
  }
}
