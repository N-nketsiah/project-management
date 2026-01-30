// src/app/core/services/comment.service.ts
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
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  public comments$ = this.commentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  commentList = signal<Comment[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  getCommentsByTask(taskId: string): Observable<Comment[]> {
    this.setLoading(true);
    return this.http.get<Comment[]>(`${this.apiUrl}?taskId=${taskId}`).pipe(
      tap((comments) => {
        this.commentsSubject.next(comments);
        this.commentList.set(comments);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getCommentById(id: string): Observable<Comment> {
    return this.http
      .get<Comment>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  createComment(comment: CreateCommentDto): Observable<Comment> {
    this.setLoading(true);
    const newComment = {
      ...comment,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<Comment>(this.apiUrl, newComment).pipe(
      tap((created) => {
        const current = this.commentsSubject.value;
        this.commentsSubject.next([created, ...current]);
        this.commentList.set([created, ...current]);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  updateComment(id: string, comment: UpdateCommentDto): Observable<Comment> {
    this.setLoading(true);
    const payload = {
      ...comment,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updated) => {
        const current = this.commentsSubject.value;
        const updated_list = current.map((c) =>
          c.id === updated.id ? updated : c,
        );
        this.commentsSubject.next(updated_list);
        this.commentList.set(updated_list);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  deleteComment(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.commentsSubject.value;
        const filtered = current.filter((c) => c.id !== id);
        this.commentsSubject.next(filtered);
        this.commentList.set(filtered);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  likeComment(id: string): Observable<Comment> {
    const current = this.commentsSubject.value;
    const existing = current.find((c) => c.id === id);
    const nextLikes = (existing?.likes || 0) + 1;

    return this.http
      .patch<Comment>(`${this.apiUrl}/${id}`, { likes: nextLikes })
      .pipe(
        tap((updated) => {
          const updated_list = current.map((c) =>
            c.id === updated.id ? updated : c,
          );
          this.commentsSubject.next(updated_list);
          this.commentList.set(updated_list);
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  private handleError(error: any): Observable<never> {
    console.error('Comment Service Error:', error?.message);
    throw error;
  }
}
