// src/app/shared/components/search-bar/search-bar.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search tasks..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      @if (searchQuery) {
        <button
          (click)="clearSearch()"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      }
    </div>
  `
})
export class SearchBarComponent {
  searchQuery = '';

  constructor(private searchService: SearchService) {}

  onSearchChange(query: string): void {
    this.searchService.updateFilters({ query });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.updateFilters({ query: '' });
  }
}
