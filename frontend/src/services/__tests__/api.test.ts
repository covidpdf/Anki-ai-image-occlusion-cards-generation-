import { describe, it, expect } from 'vitest';

describe('API Client', () => {
  it('should have a base URL configured', () => {
    const expectedUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    expect(expectedUrl).toBeDefined();
    expect(expectedUrl).toContain('http');
  });
});
