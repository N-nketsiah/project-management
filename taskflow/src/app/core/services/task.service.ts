// src/app/core/services/task.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  tap,
  catchError,
  finalize,
  combineLatest,
  of,
  map,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilter,
} from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  // State management
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Signals for reactive updates
  taskList = signal<Task[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Cache
  private cache = new Map<string, Task[]>();
  private cacheExpiry = new Map<string, number>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  // READ operations
  getTasks(): Observable<Task[]> {
    this.setLoading(true);
    return this.http.get<Task[]>(this.apiUrl).pipe(
      tap((tasks) => {
        this.tasksSubject.next(tasks);
        this.taskList.set(tasks);
        this.cache.set('all', tasks);
        this.cacheExpiry.set('all', Date.now() + this.CACHE_DURATION);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getTaskById(id: string): Observable<Task> {
    return this.http
      .get<Task>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getTasksByFilter(filter: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();

    if (filter.status) params = params.set('status', filter.status);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.projectId) params = params.set('projectId', filter.projectId);
    if (filter.assignee) params = params.set('assignee', filter.assignee);
    if (filter.search) params = params.set('q', filter.search);

    const cacheKey = JSON.stringify(filter);
    const isCached =
      this.cache.has(cacheKey) &&
      Date.now() < (this.cacheExpiry.get(cacheKey) || 0);

    if (isCached) {
      return new Observable((observer) => {
        observer.next(this.cache.get(cacheKey)!);
        observer.complete();
      });
    }

    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      tap((tasks) => {
        this.cache.set(cacheKey, tasks);
        this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.getTasksByFilter({ status: status as any });
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.getTasksByFilter({ projectId });
  }

  // CREATE operation
  createTask(task: CreateTaskDto): Observable<Task> {
    this.setLoading(true);
    const newTask = {
      ...task,
      createdAt: new Date().toISOString(),
      status: 'todo' as const,
    };

    return this.http.post<Task>(this.apiUrl, newTask).pipe(
      tap((createdTask) => {
        this.updateTasksCache(createdTask, 'add');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // UPDATE operation
  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    this.setLoading(true);
    const payload = {
      ...task,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Task>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updatedTask) => {
        this.updateTasksCache(updatedTask, 'update');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // DELETE operation
  deleteTask(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.updateTasksCache({ id } as Task, 'delete');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Bulk operations
  bulkCreateTasks(tasks: CreateTaskDto[]): Observable<Task[]> {
    this.setLoading(true);
    if (tasks.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = tasks.map((task) => this.createTask(task));
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkUpdateTasks(
    updates: Array<{ id: string; data: UpdateTaskDto }>,
  ): Observable<Task[]> {
    this.setLoading(true);
    if (updates.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = updates.map(({ id, data }) =>
      this.updateTask(id, data),
    );
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkDeleteTasks(ids: string[]): Observable<void> {
    this.setLoading(true);
    if (ids.length === 0) {
      return of(void 0).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = ids.map((id) => this.deleteTask(id));
    return combineLatest(observables).pipe(
      map(() => void 0),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  private loadTasks(): void {
    this.getTasks().subscribe();
  }

  private updateTasksCache(
    task: Task,
    action: 'add' | 'update' | 'delete',
  ): void {
    const currentTasks = this.tasksSubject.value;
    let updated: Task[];

    switch (action) {
      case 'add':
        updated = [task, ...currentTasks];
        break;
      case 'update':
        updated = currentTasks.map((t) => (t.id === task.id ? task : t));
        break;
      case 'delete':
        updated = currentTasks.filter((t) => t.id !== task.id);
        break;
    }

    this.tasksSubject.next(updated);
    this.taskList.set(updated);
    this.clearCache();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    const errorMessage =
      error?.error?.message || error?.message || 'An error occurred';
    this.errorSubject.next(errorMessage);
    this.error.set(errorMessage);
    console.error('Task Service Error:', errorMessage);
    throw error;
  }
}
