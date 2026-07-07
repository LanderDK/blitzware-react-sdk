/**
 * Utility Functions Tests
 * Testing core authentication utilities
 */

// Mock browser APIs
Object.defineProperty(window, 'btoa', {
  value: jest.fn((str: string) => Buffer.from(str, 'binary').toString('base64'))
});

Object.defineProperty(window, 'atob', {
  value: jest.fn((str: string) => Buffer.from(str, 'base64').toString('binary'))
});

// Mock axios
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
};

const mockAxios = {
  create: jest.fn(() => mockApiClient),
  post: jest.fn(),
  get: jest.fn(),
};

jest.mock('axios', () => mockAxios);

// Import utils after mocking
import {
  generateSecureState,
  hasAuthParams,
  isTokenValid,
  setToken,
  setState,
  getState,
  clearSession,
  fetchUserInfo,
  generateAuthUrl,
  normalizeAuthBaseUrl,
} from '../src/utils';

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.localStorage.setItem as jest.Mock).mockClear();
    (window.localStorage.removeItem as jest.Mock).mockClear();
    (window.localStorage.clear as jest.Mock).mockClear();
  });

  describe('generateSecureState', () => {
    it('should generate a secure state string', () => {
      const state1 = generateSecureState();
      const state2 = generateSecureState();

      expect(typeof state1).toBe('string');
      expect(typeof state2).toBe('string');
      expect(state1.length).toBeGreaterThan(0);
      expect(state2.length).toBeGreaterThan(0);
      expect(state1).not.toBe(state2); // Should be unique
    });

    it('should generate base64url encoded string', () => {
      const state = generateSecureState();
      
      // Base64url should not contain + / = characters
      expect(state).not.toMatch(/[+/=]/);
      // Should contain valid base64url characters
      expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('hasAuthParams', () => {
    beforeEach(() => {
      // Reset window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
        },
        writable: true,
      });
    });

    it('should return false when no auth params present', () => {
      window.location.search = '';
      expect(hasAuthParams()).toBe(false);

      window.location.search = '?other=param';
      expect(hasAuthParams()).toBe(false);
    });

    it('should return true when authorization code is present', () => {
      window.location.search = '?code=test-code&state=test-state';
      expect(hasAuthParams()).toBe(true);
    });

    it('should return true when access token is present', () => {
      window.location.search = '?access_token=test-token&state=test-state';
      expect(hasAuthParams()).toBe(true);
    });

    it('should return false when only error is present', () => {
      window.location.search = '?error=access_denied&state=test-state';
      expect(hasAuthParams()).toBe(false); // Error alone doesn't satisfy the function's requirements
    });
  });

  describe('token management', () => {
    describe('setToken', () => {
      it('should store token in localStorage', () => {
        setToken('access_token', 'test-token-value');
        
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'access_token',
          'test-token-value'
        );
      });

      it('should store refresh token in localStorage', () => {
        setToken('refresh_token', 'test-refresh-value');
        
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'refresh_token',
          'test-refresh-value'
        );
      });
    });

    describe('getToken (via isTokenValid)', () => {
      it('should validate token exists via isTokenValid', () => {
        // Create a valid JWT token with future expiration
        const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const mockToken = 'header.' + btoa(JSON.stringify({ exp: futureTime })) + '.signature';
        
        (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'access_token') return mockToken;
          return null;
        });

        const isValid = isTokenValid();
        expect(isValid).toBe(true);
        expect(window.localStorage.getItem).toHaveBeenCalledWith('access_token');
      });

      it('should handle missing token via isTokenValid', () => {
        (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

        const isValid = isTokenValid();
        expect(isValid).toBe(false);
      });
    });

    describe('isTokenValid', () => {
      it('should return false when no token exists', () => {
        (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
        
        expect(isTokenValid()).toBe(false);
      });

      it('should return true when token exists', () => {
        // Create a valid JWT token with future expiration
        const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const mockToken = 'header.' + btoa(JSON.stringify({ exp: futureTime })) + '.signature';
        
        (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'access_token') return mockToken;
          return null;
        });
        
        expect(isTokenValid()).toBe(true);
      });

      it('should return false for empty token', () => {
        (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
          if (key === 'blitzware_access_token') return '';
          return null;
        });
        
        expect(isTokenValid()).toBe(false);
      });
    });

    describe('clearSession', () => {
      it('should remove all BlitzWare tokens from localStorage', () => {
        clearSession();
        
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('access_token');
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('state');
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('pkce_code_verifier');
      });
    });
  });

  describe('fetchUserInfo', () => {
    it('fetches userinfo with a bearer token', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          id: 'user-id',
          username: 'alice',
          email: 'alice@example.com',
          roles: [],
        },
      });
      (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'access-token';
        return null;
      });

      const user = await fetchUserInfo();

      expect(mockApiClient.get).toHaveBeenCalledWith('userinfo', {
        headers: {
          Authorization: 'Bearer access-token',
        },
      });
      expect(user.email).toBe('alice@example.com');
    });
  });

  describe('authBaseUrl', () => {
    it('keeps the default auth URL when omitted', () => {
      expect(normalizeAuthBaseUrl()).toBe('https://auth.blitzware.xyz/api/auth/');
    });

    it('uses custom managed auth base URL for authorize URLs', async () => {
      const url = await generateAuthUrl({
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        responseType: 'token',
        authBaseUrl: 'https://acme.auth.blitzware.xyz/api/auth',
      }, 'test-state');

      expect(url).toContain('https://acme.auth.blitzware.xyz/api/auth/authorize');
      expect(url).not.toContain('/api/auth//authorize');
    });
  });

  describe('state management', () => {
    it('should handle state storage and retrieval', () => {
      setState('test-state-value');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('state', 'test-state-value');

      (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'state') return 'stored-state';
        return null;
      });

      const state = getState();
      expect(state).toBe('stored-state');
      expect(window.localStorage.getItem).toHaveBeenCalledWith('state');
    });
  });

  describe('error handling', () => {
    it('should handle localStorage failures gracefully', () => {
      // Mock localStorage to throw errors
      (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      // Functions should not throw errors even when localStorage fails
      expect(() => setToken('access_token', 'test')).not.toThrow();
    });

    it('should handle malformed tokens gracefully', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('malformed-token');
      
      // Should not throw when dealing with malformed tokens
      expect(() => isTokenValid()).not.toThrow();
    });
  });
});
