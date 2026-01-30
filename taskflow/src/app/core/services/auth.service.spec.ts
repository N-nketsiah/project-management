// src/app/core/services/auth.service.spec.ts - CORRECTED TESTS
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user and store token', (done) => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    };

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    service.login(credentials).subscribe({
      next: (user) => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('user')).toBeTruthy();

        const storedUser = JSON.parse(localStorage.getItem('user')!);
        expect(storedUser).toEqual(mockUser);
        done();
      },
      error: (err) => {
        fail('Login should not fail: ' + err);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users?email=test@example.com`);
    expect(req.request.method).toBe('GET');
    req.flush([mockUser]); // Return array as API does
  });

  it('should throw error for invalid credentials', (done) => {
    const credentials = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };

    service.login(credentials).subscribe({
      next: () => {
        fail('Should have thrown error');
        done();
      },
      error: (err) => {
        expect(err.message).toBe('Invalid credentials');
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users?email=wrong@example.com`);
    req.flush([]); // Empty array = no user found
  });

  it('should logout user and clear storage', () => {
    // Set up initial state
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test' }));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.currentUserSignal()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true if user is authenticated', () => {
    localStorage.setItem('token', 'mock-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false if user is not authenticated', () => {
    localStorage.removeItem('token');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should update signal when user logs in', (done) => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    };

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    service.login(credentials).subscribe({
      next: () => {
        expect(service.currentUserSignal()).toEqual(mockUser);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users?email=test@example.com`);
    req.flush([mockUser]);
  });

  it('should register new user', (done) => {
    const newUser: User = {
      id: 2,
      email: 'newuser@example.com',
      name: 'New User'
    };

    const userToRegister = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'password123'
    };

    service.register(userToRegister).subscribe({
      next: (user) => {
        expect(user).toEqual(newUser);
        expect(service.currentUserSignal()).toEqual(newUser);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    req.flush(newUser);
  });

  it('should restore user from localStorage on init', () => {
    const storedUser: User = {
      id: 1,
      email: 'stored@example.com',
      name: 'Stored User'
    };

    localStorage.setItem('user', JSON.stringify(storedUser));

    // Create new service instance to test initialization
    const newService = new AuthService(
      TestBed.inject(HttpClient),
      routerSpy
    );

    expect(newService.currentUserSignal()).toEqual(storedUser);
  });
});
