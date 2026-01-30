// src/app/features/dashboard/dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { of } from 'rxjs';
import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let projectService: jasmine.SpyObj<ProjectService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'done',
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

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project 1',
      description: 'Test project',
      status: 'active',
      createdAt: '2024-01-01'
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks']);
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;

    taskService.getTasks.and.returnValue(of(mockTasks));
    projectService.getProjects.and.returnValue(of(mockProjects));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks and projects on init', () => {
    fixture.detectChanges();

    expect(taskService.getTasks).toHaveBeenCalled();
    expect(projectService.getProjects).toHaveBeenCalled();
    expect(component.tasks().length).toBe(2);
    expect(component.projects().length).toBe(1);
  });

  it('should calculate stats correctly', () => {
    fixture.detectChanges();

    const stats = component.stats();
    expect(stats.totalTasks).toBe(2);
    expect(stats.completedTasks).toBe(1);
    expect(stats.inProgressTasks).toBe(1);
    expect(stats.totalProjects).toBe(1);
    expect(stats.completionRate).toBe(50);
  });

  it('should get recent tasks sorted by date', () => {
    fixture.detectChanges();

    const recentTasks = component.getRecentTasks();
    expect(recentTasks[0].id).toBe(2); // Most recent first
  });
});
