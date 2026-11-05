import { describe, expect, it } from 'vitest';
import { createProfile, validateAuth } from '../src/modules/auth/auth.logic';

const fields = {
  name: '  Alex Doe  ',
  email: 'Alex@Example.com',
  password: 'password123',
};

describe('local authentication rules', () => {
  it('validates signup fields and permits a valid form', () => {
    expect(
      validateAuth({ name: '', email: 'invalid', password: 'short' }, 'signup'),
    ).toEqual({
      name: 'Enter your full name (at least 2 characters).',
      email: 'Enter a valid email address.',
      password: 'Use at least 8 characters.',
    });
    expect(validateAuth(fields, 'signup')).toEqual({});
  });
  it('does not require a full name for login', () => {
    expect(validateAuth({ ...fields, name: '' }, 'login')).toEqual({});
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
