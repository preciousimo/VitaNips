// src/types/common.ts
export interface PaginatedResponse<T> {
    count: number; // Total number of items available
    next: string | null; // URL for the next page, or null if none
    previous: string | null; // URL for the previous page, or null if none
    results: T[]; // The array of items for the current page
  }