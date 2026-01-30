# CRUD Operations Guide

This guide documents the enhanced CRUD (Create, Read, Update, Delete) operations in the TaskFlow application.

## Overview

All CRUD services now include:
- **Type-safe operations** with DTOs (Data Transfer Objects)
- **State management** with RxJS BehaviorSubject and Angular Signals
- **Error handling** with automatic error propagation
- **Loading states** to track operation progress
- **Caching** to reduce unnecessary API calls
- **Bulk operations** for batch processing
- **Generic base service** for easy extension

## Services

### 1. TaskService

#### Models
```typescript
// Create a new task
interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
}

// Update a task
interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

// Filter tasks
interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignee?: string;
  search?: string;
}
```

#### Usage Examples

**Read Operations:**
```typescript
constructor(private taskService: TaskService) {}

// Get all tasks
this.taskService.getTasks().subscribe(tasks => {
  console.log(tasks);
});

// Get task by ID
this.taskService.getTaskById('123').subscribe(task => {
  console.log(task);
});

// Get tasks with filters
this.taskService.getTasksByFilter({
  status: 'in-progress',
  priority: 'high'
}).subscribe(tasks => {
  console.log(tasks);
});

// Get tasks by status
this.taskService.getTasksByStatus('todo').subscribe(tasks => {
  console.log(tasks);
});

// Get tasks by project
this.taskService.getTasksByProject('project-123').subscribe(tasks => {
  console.log(tasks);
});
```

**Create Operation:**
```typescript
const newTask: CreateTaskDto = {
  title: 'Implement login',
  description: 'Create login page',
  priority: 'high',
  projectId: 'project-123',
  dueDate: '2026-02-28'
};

this.taskService.createTask(newTask).subscribe(
  createdTask => console.log('Created:', createdTask),
  error => console.error('Error:', error)
);
```

**Update Operation:**
```typescript
const updates: UpdateTaskDto = {
  status: 'in-progress',
  actualHours: 2
};

this.taskService.updateTask('task-123', updates).subscribe(
  updatedTask => console.log('Updated:', updatedTask),
  error => console.error('Error:', error)
);
```

**Delete Operation:**
```typescript
this.taskService.deleteTask('task-123').subscribe(
  () => console.log('Deleted'),
  error => console.error('Error:', error)
);
```

**Bulk Operations:**
```typescript
// Create multiple tasks
const newTasks: CreateTaskDto[] = [
  { title: 'Task 1', ... },
  { title: 'Task 2', ... }
];

this.taskService.bulkCreateTasks(newTasks).subscribe(
  tasks => console.log('Created:', tasks),
  error => console.error('Error:', error)
);

// Update multiple tasks
const updates = [
  { id: 'task-1', data: { status: 'done' } },
  { id: 'task-2', data: { status: 'in-progress' } }
];

this.taskService.bulkUpdateTasks(updates).subscribe(
  tasks => console.log('Updated:', tasks),
  error => console.error('Error:', error)
);

// Delete multiple tasks
this.taskService.bulkDeleteTasks(['task-1', 'task-2']).subscribe(
  () => console.log('Deleted'),
  error => console.error('Error:', error)
);
```

### 2. ProjectService

Similar structure to TaskService with the following operations:

```typescript
// Read
getProjects(): Observable<Project[]>
getProjectById(id: string): Observable<Project>
getActiveProjects(): Observable<Project[]>

// Create
createProject(project: CreateProjectDto): Observable<Project>

// Update
updateProject(id: string, project: UpdateProjectDto): Observable<Project>

// Delete
deleteProject(id: string): Observable<void>

// Bulk operations
bulkCreateProjects(projects: CreateProjectDto[]): Observable<Project[]>
bulkUpdateProjects(updates: Array<{ id: string; data: UpdateProjectDto }>): Observable<Project[]>
bulkDeleteProjects(ids: string[]): Observable<void>
```

### 3. UserService

Handles user management with CRUD operations:

```typescript
// Read
getUsers(): Observable<User[]>
getUserById(id: string): Observable<User>
getUserByEmail(email: string): Observable<User[]>

// Create
createUser(user: CreateUserDto): Observable<User>

// Update
updateUser(id: string, user: UpdateUserDto): Observable<User>

// Delete
deleteUser(id: string): Observable<void>

// Bulk operations
bulkCreateUsers(users: CreateUserDto[]): Observable<User[]>
bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserDto }>): Observable<User[]>
bulkDeleteUsers(ids: string[]): Observable<void>
```

## State Management

Each service provides multiple ways to access state:

### Observable-based (Traditional)
```typescript
this.taskService.tasks$.subscribe(tasks => {
  this.taskList = tasks;
});

this.taskService.loading$.subscribe(isLoading => {
  this.isLoading = isLoading;
});

this.taskService.error$.subscribe(error => {
  this.errorMessage = error;
});
```

### Signal-based (Modern)
```typescript
// In component
export class TaskListComponent {
  tasks = this.taskService.taskList;
  isLoading = this.taskService.isLoading;
  error = this.taskService.error;

  constructor(private taskService: TaskService) {}

  // Use signals directly in template
  // {{ tasks() }}
  // {{ isLoading() }}
  // {{ error() }}
}
```

### In Template
```html
<!-- Observable approach -->
<div *ngIf="(taskService.loading$ | async) as loading">
  <div *ngIf="loading">Loading...</div>
</div>

<div *ngFor="let task of (taskService.tasks$ | async) as tasks">
  {{ task.title }}
</div>

<!-- Signal approach -->
<div *ngIf="taskService.isLoading()">Loading...</div>

<div *ngFor="let task of taskService.taskList()">
  {{ task.title }}
</div>
```

## Caching

Services automatically cache results to reduce API calls:

```typescript
// First call - hits API
this.taskService.getTasksByFilter({ status: 'todo' }).subscribe(...);

// Second call within 5 minutes - returns cached result
this.taskService.getTasksByFilter({ status: 'todo' }).subscribe(...);

// Clear cache
this.taskService.clearCache();
```

## Error Handling

Errors are automatically propagated to error observables:

```typescript
this.taskService.error$.subscribe(error => {
  if (error) {
    this.showNotification(error, 'error');
  }
});
```

## Generic CRUD Service

For entities not specifically covered, extend the `GenericCrudService`:

```typescript
export interface CategoryCreateDto {
  name: string;
  description?: string;
}

export interface CategoryUpdateDto {
  name?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends GenericCrudService<Category, CategoryCreateDto, CategoryUpdateDto> {
  protected apiUrl = `${environment.apiUrl}/categories`;

  constructor(http: HttpClient) {
    super(http);
  }
}
```

## Best Practices

1. **Use DTOs** - Always use Create/Update DTOs for type safety
2. **Handle errors** - Subscribe to error$ for user notifications
3. **Monitor loading** - Display loading spinners during operations
4. **Cache management** - Call clearCache() when manually refreshing data
5. **Signals over Observables** - Prefer signals in modern Angular code
6. **Unsubscribe** - Use `async` pipe or `takeUntilDestroyed()` to prevent memory leaks

## Example Component

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { TaskService } from './core/services/task.service';

@Component({
  selector: 'app-task-list',
  template: `
    <div *ngIf="taskService.isLoading()" class="loading">Loading...</div>
    
    <div *ngIf="taskService.error()" class="error">
      {{ taskService.error() }}
    </div>

    <ul>
      <li *ngFor="let task of taskService.taskList()">
        {{ task.title }}
        <button (click)="deleteTask(task.id)">Delete</button>
      </li>
    </ul>

    <form (ngSubmit)="createTask()">
      <input [(ngModel)]="newTask.title" placeholder="Task title">
      <button type="submit">Create</button>
    </form>
  `
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  newTask: any = {};

  ngOnInit() {
    this.taskService.getTasks().subscribe();
  }

  createTask() {
    this.taskService.createTask(this.newTask).subscribe(
      () => {
        this.newTask = {};
        this.taskService.clearCache();
      }
    );
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe();
  }
}
```
