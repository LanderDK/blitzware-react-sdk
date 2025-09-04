/**
 * Role checking logic tests
 * Testing the core hasRole functionality that's used by the useHasRole hook
 */

import { BlitzWareAuthUser } from '../src/types';

// Helper function that mimics the hasRole logic from the hook
const hasRole = (
  user: BlitzWareAuthUser | null, 
  isAuthenticated: boolean, 
  role?: string | string[], 
  requireAllRoles: boolean = false
): boolean => {
  if (!isAuthenticated || !user || !role) {
    return false;
  }

  const userRoles = user.roles || [];
  const requiredRoles = Array.isArray(role) ? role : [role];

  if (requiredRoles.length === 0) {
    return true;
  }

  if (requireAllRoles) {
    // AND logic: user must have ALL specified roles
    return requiredRoles.every(r => userRoles.includes(r));
  } else {
    // OR logic: user must have ANY of the specified roles
    return requiredRoles.some(r => userRoles.includes(r));
  }
};

describe('Role Checking Logic', () => {
  const mockUser: BlitzWareAuthUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['admin', 'moderator', 'user'],
  };

  describe('when user is not authenticated', () => {
    it('should return false regardless of role', () => {
      expect(hasRole(mockUser, false, 'admin')).toBe(false);
      expect(hasRole(mockUser, false, ['admin', 'user'])).toBe(false);
    });
  });

  describe('when user is null', () => {
    it('should return false regardless of authentication status', () => {
      expect(hasRole(null, true, 'admin')).toBe(false);
      expect(hasRole(null, true, ['admin', 'user'])).toBe(false);
    });
  });

  describe('when no role is specified', () => {
    it('should return false', () => {
      expect(hasRole(mockUser, true)).toBe(false);
      expect(hasRole(mockUser, true, undefined)).toBe(false);
    });
  });

  describe('when empty role array is provided', () => {
    it('should return true', () => {
      expect(hasRole(mockUser, true, [])).toBe(true);
    });
  });

  describe('single role checking', () => {
    it('should return true when user has the required role', () => {
      expect(hasRole(mockUser, true, 'admin')).toBe(true);
      expect(hasRole(mockUser, true, 'moderator')).toBe(true);
      expect(hasRole(mockUser, true, 'user')).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      expect(hasRole(mockUser, true, 'premium')).toBe(false);
      expect(hasRole(mockUser, true, 'guest')).toBe(false);
    });
  });

  describe('multiple role checking with OR logic (default)', () => {
    it('should return true when user has any of the required roles', () => {
      expect(hasRole(mockUser, true, ['admin', 'premium'])).toBe(true);
      expect(hasRole(mockUser, true, ['premium', 'moderator'])).toBe(true);
      expect(hasRole(mockUser, true, ['guest', 'user'])).toBe(true);
    });

    it('should return false when user has none of the required roles', () => {
      expect(hasRole(mockUser, true, ['premium', 'guest'])).toBe(false);
      expect(hasRole(mockUser, true, ['vip', 'subscriber'])).toBe(false);
    });
  });

  describe('multiple role checking with AND logic', () => {
    it('should return true when user has all required roles', () => {
      expect(hasRole(mockUser, true, ['admin', 'moderator'], true)).toBe(true);
      expect(hasRole(mockUser, true, ['user', 'admin'], true)).toBe(true);
      expect(hasRole(mockUser, true, ['moderator'], true)).toBe(true);
    });

    it('should return false when user does not have all required roles', () => {
      expect(hasRole(mockUser, true, ['admin', 'premium'], true)).toBe(false);
      expect(hasRole(mockUser, true, ['user', 'guest'], true)).toBe(false);
      expect(hasRole(mockUser, true, ['admin', 'moderator', 'premium'], true)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle user with no roles', () => {
      const userWithoutRoles: BlitzWareAuthUser = {
        id: '2',
        username: 'noroles',
        email: 'noroles@example.com',
      };

      expect(hasRole(userWithoutRoles, true, 'admin')).toBe(false);
      expect(hasRole(userWithoutRoles, true, [])).toBe(true);
    });

    it('should handle user with empty roles array', () => {
      const userWithEmptyRoles: BlitzWareAuthUser = {
        id: '3',
        username: 'emptyroles',
        email: 'empty@example.com',
        roles: [],
      };

      expect(hasRole(userWithEmptyRoles, true, 'admin')).toBe(false);
      expect(hasRole(userWithEmptyRoles, true, [])).toBe(true);
    });
  });
});
