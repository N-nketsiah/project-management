// src/app/core/services/recurring-task.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  RecurringTask,
  CreateRecurringTaskDto,
  UpdateRecurringTaskDto,
} from '../models/recurring-task.model';

@Injectable({
  providedIn: 'root',
})
export class RecurringTaskService {
  private apiUrl = `${environment.apiUrl}/recurring-tasks`;

  private recurringTasksSubject = new BehaviorSubject<RecurringTask[]>([]);
  public recurringTasks$ = this.recurringTasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  taskList = signal<RecurringTask[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  getRecurringTasks(): Observable<RecurringTask[]> {
    this.setLoading(true);
    return this.http.get<RecurringTask[]>(this.apiUrl).pipe(
      tap((tasks) => {
        this.recurringTasksSubject.next(tasks);
        this.taskList.set(tasks);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getRecurringTasksByProject(projectId: string): Observable<RecurringTask[]> {
    return this.http
      .get<RecurringTask[]>(`${this.apiUrl}?projectId=${projectId}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getRecurringTaskById(id: string): Observable<RecurringTask> {
    return this.http
      .get<RecurringTask>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  createRecurringTask(task: CreateRecurringTaskDto): Observable<RecurringTask> {
    this.setLoading(true);
    const newTask = {
      ...task,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    return this.http.post<RecurringTask>(this.apiUrl, newTask).pipe(
      tap((created) => {
        const current = this.recurringTasksSubject.value;
        this.recurringTasksSubject.next([created, ...current]);
        this.taskList.set([created, ...current]);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  updateRecurringTask(
    id: string,
    task: UpdateRecurringTaskDto,
  ): Observable<RecurringTask> {
    this.setLoading(true);
    return this.http.patch<RecurringTask>(`${this.apiUrl}/${id}`, task).pipe(
      tap((updated) => {
        const current = this.recurringTasksSubject.value;
        const updated_list = current.map((t) =>
          t.id === updated.id ? updated : t,
        );
        this.recurringTasksSubject.next(updated_list);
        this.taskList.set(updated_list);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteRecurringTask(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.recurringTasksSubject.value;
        const filtered = current.filter((t) => t.id !== id);
        this.recurringTasksSubject.next(filtered);
        this.taskList.set(filtered);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  toggleRecurringTask(id: string): Observable<RecurringTask> {
    return this.http
      .patch<RecurringTask>(`${this.apiUrl}/${id}/toggle`, {})
      .pipe(
        tap((updated) => {
          const current = this.recurringTasksSubject.value;
          const updated_list = current.map((t) =>
            t.id === updated.id ? updated : t,
          );
          this.recurringTasksSubject.next(updated_list);
          this.taskList.set(updated_list);
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  generateNextInstance(id: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${id}/generate-next`, {})
      .pipe(catchError((err) => this.handleError(err)));
  }

  private loadTasks(): void {
    this.getRecurringTasks().subscribe();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Recurring Task Service Error:', error?.message);
    throw error;
  }
}
