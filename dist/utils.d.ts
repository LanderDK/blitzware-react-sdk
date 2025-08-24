import { BlitzWareAuthParams, BlitzWareAuthUser } from "./types";
/**
 * Clears the current session by removing all stored tokens and state.
 */
export declare const clearSession: () => void;
/**
 * Checks if the URL search parameters contain authentication parameters.
 * @param searchParams - The URL search string to check (defaults to window.location.search).
 * @returns True if authentication parameters are present, false otherwise.
 */
export declare const hasAuthParams: (searchParams?: string) => boolean;
/**
 * Generates the BlitzWare authorization URL with optional PKCE support.
 * @param params - The authorization parameters.
 * @param state - The state string to include in the request.
 * @returns The full authorization URL.
 */
export declare const generateAuthUrl: ({ responseType, clientId, redirectUri }: BlitzWareAuthParams, state: string) => Promise<string>;
/**
 * Exchanges an authorization code for access and refresh tokens.
 * @param code - The authorization code received from the authorization server.
 * @param clientId - The client ID.
 * @param redirectUri - The redirect URI.
 * @returns An object containing the access token and optionally a refresh token.
 * @throws BlitzWareAuthError if the code_verifier is missing or the exchange fails.
 */
export declare const exchangeCodeForToken: (code: string, clientId: string, redirectUri: string) => Promise<{
    access_token: string;
    refresh_token?: string;
}>;
/**
 * Fetches user information using the provided access token.
 * @param accessToken - The access token.
 * @returns The authenticated user's information.
 * @throws BlitzWareAuthError if the request fails.
 */
export declare const fetchUserInfo: (accessToken: string) => Promise<BlitzWareAuthUser>;
/**
 * Attempts to refresh the access token using the stored refresh token.
 * @param clientId - The client ID.
 * @returns An object containing the new access token and optionally a new refresh token.
 * @throws BlitzWareAuthError if no refresh token is available or the refresh fails.
 */
export declare const tryRefreshToken: (clientId: string) => Promise<{
    access_token: string;
    refresh_token?: string;
}>;
/**
 * Stores an access or refresh token in localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @param token - The token value.
 */
export declare const setToken: (type: "access_token" | "refresh_token", token: string) => void;
/**
 * Retrieves an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @returns The token value or null if not found.
 */
export declare const getToken: (type: "access_token" | "refresh_token") => string | null;
/**
 * Removes an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 */
export declare const removeToken: (type: "access_token" | "refresh_token") => void;
/**
 * Checks if the stored access token is valid (not expired).
 * @returns True if the token is valid, false otherwise.
 */
export declare const isTokenValid: () => boolean;
/**
 * Stores the OAuth state value in localStorage.
 * @param state - The state string.
 */
export declare const setState: (state: string) => void;
/**
 * Retrieves the OAuth state value from localStorage.
 * @returns The state string or null if not found.
 */
export declare const getState: () => string | null;
/**
 * Removes the OAuth state value from localStorage.
 */
export declare const removeState: () => void;
/**
 * Removes the PKCE code_verifier from localStorage.
 */
export declare const removeCodeVerifier: () => void;
/**
 * Generates a cryptographically secure random state string.
 * @returns A base64url-encoded random string.
 */
export declare const generateSecureState: () => string;
/**
 * Logs out the user from the BlitzWare authentication service.
 * @param clientId - The client ID.
 * @param options - Optional logout configuration.
 * @returns Promise that resolves when logout is complete.
 * @throws BlitzWareAuthError if logout fails.
 */
export declare const logoutFromService: (clientId: string) => Promise<void>;
/**
 * Revokes a specific token.
 * @param token - The token to revoke.
 * @param tokenTypeHint - The type of token being revoked.
 * @param clientId - The client ID.
 * @throws BlitzWareAuthError if revocation fails.
 */
export declare const revokeToken: (token: string, tokenTypeHint: "access_token" | "refresh_token", clientId: string) => Promise<void>;
//# sourceMappingURL=utils.d.ts.map