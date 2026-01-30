// src/app/core/services/auth.service.ts - CORRECTED VERSION
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUserSignal = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}`).pipe(
      map(users => {
        if (users.length > 0 && users[0].email === credentials.email) {
          return users[0];
        }
        throw new Error('Invalid credentials');
      }),
      tap(user => {
        this.setUser(user);
        localStorage.setItem('token', 'mock-jwt-token');
      })
    );
  }

  register(user: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
      tap(newUser => this.setUser(newUser))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
