// src/app/core/services/task-template.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '../models/task-template.model';

@Injectable({
  providedIn: 'root',
})
export class TaskTemplateService {
  private apiUrl = `${environment.apiUrl}/task-templates`;

  private templatesSubject = new BehaviorSubject<TaskTemplate[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  templateList = signal<TaskTemplate[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {
    this.loadTemplates();
  }

  getTemplates(): Observable<TaskTemplate[]> {
    this.setLoading(true);
    return this.http.get<TaskTemplate[]>(this.apiUrl).pipe(
      tap((templates) => {
        this.templatesSubject.next(templates);
        this.templateList.set(templates);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getTemplatesByProject(projectId: string): Observable<TaskTemplate[]> {
    return this.http
      .get<TaskTemplate[]>(`${this.apiUrl}?projectId=${projectId}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getTemplateById(id: string): Observable<TaskTemplate> {
    return this.http
      .get<TaskTemplate>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  createTemplate(template: CreateTemplateDto): Observable<TaskTemplate> {
    this.setLoading(true);
    const newTemplate = {
      ...template,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    return this.http.post<TaskTemplate>(this.apiUrl, newTemplate).pipe(
      tap((created) => {
        const current = this.templatesSubject.value;
        this.templatesSubject.next([created, ...current]);
        this.templateList.set([created, ...current]);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  updateTemplate(
    id: string,
    template: UpdateTemplateDto,
  ): Observable<TaskTemplate> {
    this.setLoading(true);
    return this.http.patch<TaskTemplate>(`${this.apiUrl}/${id}`, template).pipe(
      tap((updated) => {
        const current = this.templatesSubject.value;
        const updated_list = current.map((t) =>
          t.id === updated.id ? updated : t,
        );
        this.templatesSubject.next(updated_list);
        this.templateList.set(updated_list);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteTemplate(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.templatesSubject.value;
        const filtered = current.filter((t) => t.id !== id);
        this.templatesSubject.next(filtered);
        this.templateList.set(filtered);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  applyTemplate(
    templateId: string,
    projectId: string,
    taskData: any,
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${templateId}/apply`, { projectId, taskData })
      .pipe(catchError((err) => this.handleError(err)));
  }

  duplicateTemplate(id: string): Observable<TaskTemplate> {
    return this.http
      .post<TaskTemplate>(`${this.apiUrl}/${id}/duplicate`, {})
      .pipe(
        tap((duplicated) => {
          const current = this.templatesSubject.value;
          this.templatesSubject.next([duplicated, ...current]);
          this.templateList.set([duplicated, ...current]);
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  incrementUsageCount(id: string): Observable<TaskTemplate> {
    return this.http
      .patch<TaskTemplate>(`${this.apiUrl}/${id}/increment-usage`, {})
      .pipe(
        tap((updated) => {
          const current = this.templatesSubject.value;
          const updated_list = current.map((t) =>
            t.id === updated.id ? updated : t,
          );
          this.templatesSubject.next(updated_list);
          this.templateList.set(updated_list);
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  private loadTemplates(): void {
    this.getTemplates().subscribe();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Task Template Service Error:', error?.message);
    throw error;
  }
}
