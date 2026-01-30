// src/app/core/services/analytics.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskAnalytics,
  TeamProductivity,
  ProjectMetrics,
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  private analyticsSubject = new BehaviorSubject<TaskAnalytics | null>(null);
  public analytics$ = this.analyticsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  analytics = signal<TaskAnalytics | null>(null);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  getProjectAnalytics(projectId: string): Observable<TaskAnalytics> {
    this.setLoading(true);
    return this.http
      .get<TaskAnalytics>(`${this.apiUrl}/projects/${projectId}`)
      .pipe(
        tap((analytics) => {
          this.analyticsSubject.next(analytics);
          this.analytics.set(analytics);
        }),
        catchError((err) => this.handleError(err)),
        finalize(() => this.setLoading(false)),
      );
  }

  getTeamProductivity(projectId: string): Observable<TeamProductivity[]> {
    return this.http
      .get<
        TeamProductivity[]
      >(`${this.apiUrl}/projects/${projectId}/team-productivity`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getProjectMetrics(projectId: string): Observable<ProjectMetrics> {
    return this.http
      .get<ProjectMetrics>(`${this.apiUrl}/projects/${projectId}/metrics`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getCompletionTrend(projectId: string, days: number = 30): Observable<any[]> {
    return this.http
      .get<
        any[]
      >(`${this.apiUrl}/projects/${projectId}/completion-trend?days=${days}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getTeamMetrics(projectId: string): Observable<TeamProductivity[]> {
    return this.http
      .get<
        TeamProductivity[]
      >(`${this.apiUrl}/projects/${projectId}/team-metrics`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getTaskMetrics(taskId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/tasks/${taskId}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Analytics Service Error:', error?.message);
    throw error;
  }
}
