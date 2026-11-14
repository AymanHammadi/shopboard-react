import { describe, expect, it } from 'vitest';
import { createProfile } from '../src/modules/auth/auth.logic';
import { loginSchema, signupSchema } from '../src/modules/auth/auth.types';

const fields = {
  name: '  Alex Doe  ',
  email: 'Alex@Example.com',
  password: 'password123',
};

describe('local authentication rules', () => {
  it('validates signup fields and permits a valid form', () => {
    const result = signupSchema.safeParse({
      name: '',
      email: 'invalid',
      password: 'short',
    });
    expect(result.success).toBe(false);
    if (result.success === false)
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        'Enter your full name (at least 2 characters).',
        'Enter a valid email address.',
        'Use at least 8 characters.',
      ]);
    expect(signupSchema.parse(fields).name).toBe('Alex Doe');
  });
  it('does not require a full name for login', () => {
    expect(loginSchema.safeParse({ ...fields, name: '' }).success).toBe(true);
  });
  it('creates a minimal profile and never includes the password', () => {
    expect(createProfile(fields, 'signup')).toEqual({
      name: 'Alex Doe',
      email: 'alex@example.com',
    });
    expect(createProfile(fields, 'login')).toEqual({
      name: 'alex',
      email: 'alex@example.com',
    });
    expect(createProfile(fields, 'signup')).not.toHaveProperty('password');
  });
});
