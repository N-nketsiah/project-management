// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';
import { InstallPromptComponent } from './shared/components/install-prompt/install-prompt.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationContainerComponent,
    InstallPromptComponent,
    ThemeToggleComponent
  ],
  template: `
    <app-notification-container></app-notification-container>
    <app-install-prompt></app-install-prompt>

    @if (showNavbar) {
      <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400">TaskFlow</h1>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a routerLink="/dashboard" routerLinkActive="border-blue-500 text-gray-900 dark:text-gray-100" 
                   class="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition">
                  Dashboard
                </a>
                <a routerLink="/kanban" routerLinkActive="border-blue-500 text-gray-900 dark:text-gray-100"
                   class="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition">
                  Kanban
                </a>
                <a routerLink="/tasks" routerLinkActive="border-blue-500 text-gray-900 dark:text-gray-100"
                   class="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition">
                  Tasks
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <app-theme-toggle></app-theme-toggle>
              @if (currentUser()) {
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ currentUser()?.name }}</span>
                  <button (click)="logout()"
                          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    Logout
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </nav>
    }

    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  showNavbar = false;
  currentUser = this.authService.currentUserSignal;

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showNavbar = !event.url.includes('/login');
    });
  }

  logout() {
    this.authService.logout();
  }
}
