// src/app/shared/components/comments-panel/comments-panel.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { Comment, CreateCommentDto } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comments-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Comments ({{ comments().length }})
        </h3>

        <!-- Comment Form -->
        <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <textarea
            [(ngModel)]="newComment"
            placeholder="Add a comment... Use @username to mention"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
          <button
            (click)="addComment()"
            [disabled]="!newComment.trim() || isLoading()"
            class="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {{ isLoading() ? 'Posting...' : 'Post Comment' }}
          </button>
        </div>

        <!-- Comments List -->
        <div class="space-y-4">
          @for (comment of comments(); track comment.id) {
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-semibold text-gray-900 dark:text-gray-100">
                    {{ comment.userName || 'Anonymous' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ comment.createdAt | date: 'short' }}
                  </p>
                </div>
                <button
                  (click)="likeComment(comment.id)"
                  class="text-red-500 hover:text-red-600 font-medium"
                >
                  ❤️ {{ comment.likes || 0 }}
                </button>
              </div>
              <p class="text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CommentsPanelComponent implements OnInit {
  @Input() taskId!: string;

  private commentService = inject(CommentService);

  comments = this.commentService.commentList;
  isLoading = this.commentService.isLoading;
  newComment = '';

  ngOnInit() {
    if (this.taskId) {
      this.commentService.getCommentsByTask(this.taskId).subscribe();
    }
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const comment: CreateCommentDto = {
      taskId: this.taskId,
      userId: 'current-user',
      content: this.newComment,
      mentions: this.extractMentions(this.newComment)
    };

    this.commentService.createComment(comment).subscribe({
      next: () => {
        this.newComment = '';
      }
    });
  }

  likeComment(commentId: string) {
    this.commentService.likeComment(commentId).subscribe();
  }

  private extractMentions(text: string): string[] {
    const regex = /@(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(m => m.substring(1)) : [];
  }
}
