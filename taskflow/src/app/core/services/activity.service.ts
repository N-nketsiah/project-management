// src/app/core/services/activity.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity, CreateActivityDto } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  public activities$ = this.activitiesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  activityList = signal<Activity[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  getActivitiesByTask(taskId: string): Observable<Activity[]> {
    this.setLoading(true);
    return this.http.get<Activity[]>(`${this.apiUrl}?taskId=${taskId}`).pipe(
      tap((activities) => {
        const sorted = activities.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        this.activitiesSubject.next(sorted);
        this.activityList.set(sorted);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getActivitiesByProject(projectId: string): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(`${this.apiUrl}?projectId=${projectId}`)
      .pipe(
        tap((activities) => {
          const sorted = activities.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          this.activitiesSubject.next(sorted);
          this.activityList.set(sorted);
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  getActivitiesByUser(userId: string): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(`${this.apiUrl}?userId=${userId}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  createActivity(activity: CreateActivityDto): Observable<Activity> {
    const newActivity = {
      ...activity,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<Activity>(this.apiUrl, newActivity).pipe(
      tap((created) => {
        const current = this.activitiesSubject.value;
        this.activitiesSubject.next([created, ...current]);
        this.activityList.set([created, ...current]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.activitiesSubject.value;
        const filtered = current.filter((a) => a.id !== id);
        this.activitiesSubject.next(filtered);
        this.activityList.set(filtered);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Activity Service Error:', error?.message);
    throw error;
  }
}
