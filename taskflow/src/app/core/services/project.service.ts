// src/app/core/services/project.service.ts
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
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  // State management
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Signals for reactive updates
  projectList = signal<Project[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadProjects();
  }

  // READ operations
  getProjects(): Observable<Project[]> {
    this.setLoading(true);
    return this.http.get<Project[]>(this.apiUrl).pipe(
      tap((projects) => {
        this.projectsSubject.next(projects);
        this.projectList.set(projects);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getProjectById(id: string): Observable<Project> {
    return this.http
      .get<Project>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getActiveProjects(): Observable<Project[]> {
    return this.http
      .get<Project[]>(`${this.apiUrl}?status=active`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  // CREATE operation
  createProject(project: CreateProjectDto): Observable<Project> {
    this.setLoading(true);
    const newProject = {
      ...project,
      createdAt: new Date().toISOString(),
      status: 'active' as const,
      progress: 0,
    };

    return this.http.post<Project>(this.apiUrl, newProject).pipe(
      tap((createdProject) => {
        this.updateProjectsCache(createdProject, 'add');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // UPDATE operation
  updateProject(id: string, project: UpdateProjectDto): Observable<Project> {
    this.setLoading(true);
    const payload = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Project>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updatedProject) => {
        this.updateProjectsCache(updatedProject, 'update');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // DELETE operation
  deleteProject(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.updateProjectsCache({ id } as Project, 'delete');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Bulk operations
  bulkCreateProjects(projects: CreateProjectDto[]): Observable<Project[]> {
    this.setLoading(true);
    if (projects.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = projects.map((p) => this.createProject(p));
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkUpdateProjects(
    updates: Array<{ id: string; data: UpdateProjectDto }>,
  ): Observable<Project[]> {
    this.setLoading(true);
    if (updates.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = updates.map(({ id, data }) =>
      this.updateProject(id, data),
    );
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkDeleteProjects(ids: string[]): Observable<void> {
    this.setLoading(true);
    if (ids.length === 0) {
      return of(void 0).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = ids.map((id) => this.deleteProject(id));
    return combineLatest(observables).pipe(
      map(() => void 0),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  private loadProjects(): void {
    this.getProjects().subscribe();
  }

  private updateProjectsCache(
    project: Project,
    action: 'add' | 'update' | 'delete',
  ): void {
    const currentProjects = this.projectsSubject.value;
    let updated: Project[];

    switch (action) {
      case 'add':
        updated = [project, ...currentProjects];
        break;
      case 'update':
        updated = currentProjects.map((p) =>
          p.id === project.id ? project : p,
        );
        break;
      case 'delete':
        updated = currentProjects.filter((p) => p.id !== project.id);
        break;
    }

    this.projectsSubject.next(updated);
    this.projectList.set(updated);
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
    console.error('Project Service Error:', errorMessage);
    throw error;
  }
}
