// src/app/shared/components/templates-manager/templates-manager.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskTemplateService } from '../../../core/services/task-template.service';
import { TaskTemplate } from '../../../core/models/task-template.model';

@Component({
  selector: 'app-templates-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Task Templates</h3>

      <!-- Templates List -->
      <div class="space-y-3">
        @for (template of templates(); track template.id) {
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 transition">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 dark:text-gray-100">{{ template.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ template.description }}</p>
                <div class="flex gap-2 mt-3">
                  <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                    Priority: {{ template.priority }}
                  </span>
                  @if (template.estimatedHours) {
                    <span class="inline-block bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                      {{ template.estimatedHours }}h
                    </span>
                  }
                  <span class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                    Used {{ template.usageCount }} times
                  </span>
                </div>
                @if (template.checklist && template.checklist.length > 0) {
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    📋 {{ template.checklist.length }} checklist items
                  </p>
                }
              </div>
              <div class="flex gap-2">
                <button
                  (click)="useTemplate(template.id)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                >
                  Use
                </button>
                <button
                  (click)="duplicateTemplate(template.id)"
                  class="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition"
                >
                  Copy
                </button>
                <button
                  (click)="deleteTemplate(template.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        }

        @if (templates().length === 0) {
          <p class="text-gray-500 dark:text-gray-400 text-center py-8">No templates yet. Create one to save time!</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TemplatesManagerComponent implements OnInit {
  private templateService = inject(TaskTemplateService);

  templates = this.templateService.templateList;

  ngOnInit() {
    this.templateService.getTemplates().subscribe();
  }

  useTemplate(templateId: string) {
    this.templateService.incrementUsageCount(templateId).subscribe({
      next: () => {
        alert('Template applied! Check your task list.');
      }
    });
  }

  duplicateTemplate(templateId: string) {
    this.templateService.duplicateTemplate(templateId).subscribe({
      next: () => {
        alert('Template duplicated successfully!');
      }
    });
  }

  deleteTemplate(templateId: string) {
    if (confirm('Are you sure you want to delete this template?')) {
      this.templateService.deleteTemplate(templateId).subscribe();
    }
  }
}
