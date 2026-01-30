// src/app/features/kanban/kanban.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models/task.model';

interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  columns = signal<Column[]>([
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'review', title: 'Review', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ]);

  loading = signal(false);

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        const updatedColumns = this.columns().map(column => ({
          ...column,
          tasks: tasks.filter(task => task.status === column.id)
        }));
        this.columns.set(updatedColumns);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update task status in backend
      this.taskService.updateTask(task.id, { status: targetStatus }).subscribe({
        next: () => console.log('Task status updated'),
        error: (err) => {
          console.error('Error updating task:', err);
          // Revert on error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
        }
      });
    }
  }

  getConnectedLists(): TaskStatus[] {
    return this.columns().map(column => column.id);
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors['low'];
  }

  getColumnColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      'todo': 'bg-gray-100',
      'in-progress': 'bg-blue-50',
      'review': 'bg-yellow-50',
      'done': 'bg-green-50'
    };
    return colors[status];
  }
}
