// src/app/core/models/comment.model.ts
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes?: number;
  mentions?: string[];
}

export interface CreateCommentDto {
  taskId: string;
  userId: string;
  content: string;
  mentions?: string[];
}

export interface UpdateCommentDto {
  content: string;
}
