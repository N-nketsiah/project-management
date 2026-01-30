// src/app/shared/components/notification-container/notification-container.component.ts
import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (notification of notifications(); track notification.id) {
        <div
          @slideIn
          class="notification-card flex items-start p-4 rounded-lg shadow-lg max-w-sm"
          [ngClass]="{
            'bg-green-50 border-l-4 border-green-500': notification.type === 'success',
            'bg-red-50 border-l-4 border-red-500': notification.type === 'error',
            'bg-blue-50 border-l-4 border-blue-500': notification.type === 'info',
            'bg-yellow-50 border-l-4 border-yellow-500': notification.type === 'warning'
          }"
        >
          <div class="flex-shrink-0">
            @switch (notification.type) {
              @case ('success') {
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              @case ('error') {
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              @case ('warning') {
                <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              }
              @case ('info') {
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            }
          </div>

          <div class="ml-3 flex-1">
            <p class="text-sm font-medium"
               [ngClass]="{
                 'text-green-800': notification.type === 'success',
                 'text-red-800': notification.type === 'error',
                 'text-blue-800': notification.type === 'info',
                 'text-yellow-800': notification.type === 'warning'
               }">
              {{ notification.message }}
            </p>
          </div>

          <button
            (click)="removeNotification(notification.id)"
            class="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-card {
      min-width: 300px;
      animation: slideInRight 0.3s ease-out;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationContainerComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notificationsSignal;

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }
}
