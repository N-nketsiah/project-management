// src/app/core/services/realtime.service.ts
import { Injectable, signal } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private updateSubject = new Subject<Task[]>();
  private pollingInterval = 5000; // 5 seconds
  private isPolling = signal(false);

  updates$ = this.updateSubject.asObservable();

  constructor(private taskService: TaskService) {}

  startPolling(): void {
    if (this.isPolling()) return;

    this.isPolling.set(true);

    interval(this.pollingInterval)
      .pipe(
        switchMap(() => this.taskService.getTasks())
      )
      .subscribe({
        next: (tasks) => this.updateSubject.next(tasks),
        error: (err) => console.error('Polling error:', err)
      });
  }

  stopPolling(): void {
    this.isPolling.set(false);
  }

  // Simulate real-time updates (for demo purposes)
  simulateTaskUpdate(task: Task): void {
    this.updateSubject.next([task]);
  }
}
