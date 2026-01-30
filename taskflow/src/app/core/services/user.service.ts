// src/app/core/services/user.service.ts
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
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  // State management
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Signals for reactive updates
  userList = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  // READ operations
  getUsers(): Observable<User[]> {
    this.setLoading(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap((users) => {
        this.usersSubject.next(users);
        this.userList.set(users);
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  getUserByEmail(email: string): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${email}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  // CREATE operation
  createUser(user: CreateUserDto): Observable<User> {
    this.setLoading(true);
    const newUser = {
      ...user,
      createdAt: new Date().toISOString(),
      role: user.role || 'member',
    };

    return this.http.post<User>(this.apiUrl, newUser).pipe(
      tap((createdUser) => {
        this.updateUsersCache(createdUser, 'add');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // UPDATE operation
  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    this.setLoading(true);
    const payload = {
      ...user,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<User>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updatedUser) => {
        this.updateUsersCache(updatedUser, 'update');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // DELETE operation
  deleteUser(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.updateUsersCache({ id } as User, 'delete');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Bulk operations
  bulkCreateUsers(users: CreateUserDto[]): Observable<User[]> {
    this.setLoading(true);
    if (users.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = users.map((u) => this.createUser(u));
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkUpdateUsers(
    updates: Array<{ id: string; data: UpdateUserDto }>,
  ): Observable<User[]> {
    this.setLoading(true);
    if (updates.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = updates.map(({ id, data }) =>
      this.updateUser(id, data),
    );
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkDeleteUsers(ids: string[]): Observable<void> {
    this.setLoading(true);
    if (ids.length === 0) {
      return of(void 0).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = ids.map((id) => this.deleteUser(id));
    return combineLatest(observables).pipe(
      map(() => void 0),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  private loadUsers(): void {
    this.getUsers().subscribe();
  }

  private updateUsersCache(
    user: User,
    action: 'add' | 'update' | 'delete',
  ): void {
    const currentUsers = this.usersSubject.value;
    let updated: User[];

    switch (action) {
      case 'add':
        updated = [user, ...currentUsers];
        break;
      case 'update':
        updated = currentUsers.map((u) => (u.id === user.id ? user : u));
        break;
      case 'delete':
        updated = currentUsers.filter((u) => u.id !== user.id);
        break;
    }

    this.usersSubject.next(updated);
    this.userList.set(updated);
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
    console.error('User Service Error:', errorMessage);
    throw error;
  }
}
