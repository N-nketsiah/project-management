// src/app/core/services/notification.service.ts
import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private notificationSubject = new Subject<Notification>();

  notifications$ = this.notificationSubject.asObservable();
  notificationsSignal = this.notifications.asReadonly();

  show(message: string, type: Notification['type'] = 'info', duration: number = 3000): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      duration
    };

    this.notifications.update(notifs => [...notifs, notification]);
    this.notificationSubject.next(notification);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
