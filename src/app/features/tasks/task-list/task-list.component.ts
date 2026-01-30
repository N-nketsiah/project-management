import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    
      All Tasks
      
        @for (task of tasks(); track task.id) {
          
            {{ task.title }}
            {{ task.description }}
            
              {{ task.status }}
              {{ task.priority }}
            
          
        }
      
    
  `
})
export class TaskListComponent implements OnInit {
  tasks = signal([]);

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => this.tasks.set(tasks));
  }
}
