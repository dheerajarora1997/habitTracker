import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from './route';

describe('updateProfileSchema Validation', () => {
  it('should pass with a valid name and URL avatar', () => {
    const payload = {
      name: 'John Doe',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    };

    const result = updateProfileSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should pass with a valid name and empty string avatar (removing picture)', () => {
    const payload = {
      name: 'Jane Smith',
      avatarUrl: '', // Clear profile picture
    };

    const result = updateProfileSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should fail if name is less than 2 characters', () => {
    const payload = {
      name: 'A',
      avatarUrl: '',
    };

    const result = updateProfileSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Name must be at least 2 characters');
    }
  });

  it('should fail if avatarUrl is present but is not a valid URL', () => {
    const payload = {
      name: 'John Doe',
      avatarUrl: 'invalid-url-format',
    };

    const result = updateProfileSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid input');
    }
  });
});
