// src/app/features/kanban/kanban.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KanbanComponent } from './kanban.component';
import { TaskService } from '../../core/services/task.service';
import { of, throwError } from 'rxjs';
import { Task } from '../../core/models/task.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

describe('KanbanComponent', () => {
  let component: KanbanComponent;
  let fixture: ComponentFixture<KanbanComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      priority: 'high',
      projectId: 1,
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'in-progress',
      priority: 'medium',
      projectId: 1,
      createdAt: '2024-01-02'
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'updateTask']);

    await TestBed.configureTestingModule({
      imports: [KanbanComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    taskService.getTasks.and.returnValue(of(mockTasks));

    fixture = TestBed.createComponent(KanbanComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and organize tasks by status', () => {
    fixture.detectChanges();

    expect(taskService.getTasks).toHaveBeenCalled();
    
    const columns = component.columns();
    const todoColumn = columns.find(c => c.id === 'todo');
    const inProgressColumn = columns.find(c => c.id === 'in-progress');

    expect(todoColumn?.tasks.length).toBe(1);
    expect(inProgressColumn?.tasks.length).toBe(1);
  });

  it('should return correct priority color', () => {
    expect(component.getPriorityColor('low')).toContain('blue');
    expect(component.getPriorityColor('medium')).toContain('yellow');
    expect(component.getPriorityColor('high')).toContain('orange');
    expect(component.getPriorityColor('urgent')).toContain('red');
  });

  it('should handle loading state', () => {
    expect(component.loading()).toBe(false);
    
    component.loadTasks();
    expect(component.loading()).toBe(true);
    
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.loading()).toBe(false);
    });
  });
});
