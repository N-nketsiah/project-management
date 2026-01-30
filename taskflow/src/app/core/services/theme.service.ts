// src/app/core/services/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'taskflow-theme';
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      const theme = this.theme();
      this.applyTheme(theme);
      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
