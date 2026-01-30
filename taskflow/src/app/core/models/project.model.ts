// src/app/core/models/project.model.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt?: string;
  deadline?: string;
  progress?: number;
  ownerId: string;
  teamMembers?: string[];
}

export interface CreateProjectDto {
  name: string;
  description: string;
  deadline?: string;
  teamMembers?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  deadline?: string;
  progress?: number;
  teamMembers?: string[];
}
