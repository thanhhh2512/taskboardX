// Global application types


// Application theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Common UI types
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Common form types
export interface FormSubmitEvent {
  preventDefault: () => void;
}

// Navigation
export interface NavigationItem {
  title: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
}