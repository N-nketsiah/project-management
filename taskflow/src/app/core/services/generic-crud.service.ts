// src/app/core/services/generic-crud.service.ts
import { Injectable, signal, Signal } from '@angular/core';
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

export interface CrudEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrudOptions {
  cacheEnabled?: boolean;
  cacheDuration?: number;
}

@Injectable()
export abstract class GenericCrudService<
  T extends CrudEntity,
  CreateDto,
  UpdateDto,
> {
  protected abstract apiUrl: string;

  // State management
  protected itemsSubject = new BehaviorSubject<T[]>([]);
  public items$ = this.itemsSubject.asObservable();

  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  protected errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Signals for reactive updates
  itemList = signal<T[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Cache
  protected cache = new Map<string, T[]>();
  protected cacheExpiry = new Map<string, number>();
  protected CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  protected options: CrudOptions = {
    cacheEnabled: true,
    cacheDuration: 5 * 60 * 1000,
  };

  constructor(protected http: HttpClient) {}

  // READ operations
  getAll(): Observable<T[]> {
    this.setLoading(true);
    return this.http.get<T[]>(this.apiUrl).pipe(
      tap((items) => {
        this.itemsSubject.next(items);
        this.itemList.set(items);
        if (this.options.cacheEnabled) {
          this.cache.set('all', items);
          this.cacheExpiry.set(
            'all',
            Date.now() + (this.options.cacheDuration || this.CACHE_DURATION),
          );
        }
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  getById(id: string): Observable<T> {
    return this.http
      .get<T>(`${this.apiUrl}/${id}`)
      .pipe(catchError((err) => this.handleError(err)));
  }

  query(params: any): Observable<T[]> {
    let queryParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        queryParams = queryParams.set(key, params[key]);
      }
    });

    const cacheKey = JSON.stringify(params);
    if (this.options.cacheEnabled && this.isCached(cacheKey)) {
      return new Observable((observer) => {
        observer.next(this.cache.get(cacheKey)!);
        observer.complete();
      });
    }

    return this.http.get<T[]>(this.apiUrl, { params: queryParams }).pipe(
      tap((items) => {
        if (this.options.cacheEnabled) {
          this.cache.set(cacheKey, items);
          this.cacheExpiry.set(
            cacheKey,
            Date.now() + (this.options.cacheDuration || this.CACHE_DURATION),
          );
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  // CREATE operation
  create(item: CreateDto): Observable<T> {
    this.setLoading(true);
    const payload = {
      ...item,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<T>(this.apiUrl, payload).pipe(
      tap((createdItem) => {
        this.updateCache(createdItem, 'add');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // UPDATE operation
  update(id: string, item: UpdateDto): Observable<T> {
    this.setLoading(true);
    const payload = {
      ...item,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<T>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updatedItem) => {
        this.updateCache(updatedItem, 'update');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // DELETE operation
  delete(id: string): Observable<void> {
    this.setLoading(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.updateCache({ id } as T, 'delete');
      }),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Bulk operations
  bulkCreate(items: CreateDto[]): Observable<T[]> {
    this.setLoading(true);
    if (items.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = items.map((item) => this.create(item));
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkUpdate(updates: Array<{ id: string; data: UpdateDto }>): Observable<T[]> {
    this.setLoading(true);
    if (updates.length === 0) {
      return of([]).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = updates.map(({ id, data }) => this.update(id, data));
    return combineLatest(observables).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  bulkDelete(ids: string[]): Observable<void> {
    this.setLoading(true);
    if (ids.length === 0) {
      return of(void 0).pipe(finalize(() => this.setLoading(false)));
    }
    const observables = ids.map((id) => this.delete(id));
    return combineLatest(observables).pipe(
      map(() => void 0),
      catchError((err) => this.handleError(err)),
      finalize(() => this.setLoading(false)),
    );
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  setCacheOptions(options: Partial<CrudOptions>): void {
    this.options = { ...this.options, ...options };
  }

  protected updateCache(item: T, action: 'add' | 'update' | 'delete'): void {
    const current = this.itemsSubject.value;
    let updated: T[];

    switch (action) {
      case 'add':
        updated = [item, ...current];
        break;
      case 'update':
        updated = current.map((i) => (i.id === item.id ? item : i));
        break;
      case 'delete':
        updated = current.filter((i) => i.id !== item.id);
        break;
    }

    this.itemsSubject.next(updated);
    this.itemList.set(updated);
    this.clearCache();
  }

  protected setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
    this.isLoading.set(loading);
  }

  protected handleError(error: any): Observable<never> {
    const errorMessage =
      error?.error?.message || error?.message || 'An error occurred';
    this.errorSubject.next(errorMessage);
    this.error.set(errorMessage);
    console.error('CRUD Service Error:', errorMessage);
    throw error;
  }

  private isCached(key: string): boolean {
    return this.cache.has(key) && Date.now() < (this.cacheExpiry.get(key) || 0);
  }
}
