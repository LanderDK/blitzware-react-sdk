import {
  BlitzWareAuthParams,
  BlitzWareAuthUser,
  BlitzWareAuthError,
} from "./types";
import { Buffer } from "buffer";
import axios from "axios";

const TOKEN_RE = /[?&]access_token=[^&]+/;
const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
const BASE_URL = "https://auth.blitzware.xyz/api/auth/";

/**
 * Checks if the URL search parameters contain authentication parameters.
 * @param searchParams - The URL search string to check (defaults to window.location.search).
 * @returns True if authentication parameters are present, false otherwise.
 */
export const hasAuthParams = (searchParams = window.location.search): boolean =>
  (TOKEN_RE.test(searchParams) || CODE_RE.test(searchParams)) &&
  STATE_RE.test(searchParams);

/**
 * Generates the BlitzWare authorization URL with optional PKCE support.
 * @param params - The authorization parameters.
 * @param state - The state string to include in the request.
 * @returns The full authorization URL.
 */
export const generateAuthUrl = async (
  { responseType = "code", clientId, redirectUri }: BlitzWareAuthParams,
  state: string
): Promise<string> => {
  const authUrl = BASE_URL + "authorize";
  const queryParams = new URLSearchParams({
    response_type: responseType,
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  if (responseType === "code") {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    setCodeVerifier(verifier);
    queryParams.append("code_challenge", challenge);
    queryParams.append("code_challenge_method", "S256");
  }

  return `${authUrl}?${queryParams.toString()}`;
};

/**
 * Exchanges an authorization code for access and refresh tokens.
 * @param code - The authorization code received from the authorization server.
 * @param clientId - The client ID.
 * @param redirectUri - The redirect URI.
 * @returns An object containing the access token and optionally a refresh token.
 * @throws BlitzWareAuthError if the code_verifier is missing or the exchange fails.
 */
export const exchangeCodeForToken = async (
  code: string,
  clientId: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string }> => {
  const codeVerifier = getCodeVerifier();
  if (!codeVerifier)
    throw new BlitzWareAuthError(
      "Missing PKCE code_verifier",
      "missing_code_verifier"
    );

  const tokenUrl = BASE_URL + "token";

  try {
    const response = await axios.post(
      tokenUrl,
      {
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    removeCodeVerifier();
    return response.data;
  } catch (error) {
    throw new BlitzWareAuthError(
      "Failed to exchange code for token",
      "exchange_failed"
    );
  }
};

/**
 * Fetches user information using the provided access token.
 * @param accessToken - The access token.
 * @returns The authenticated user's information.
 * @throws BlitzWareAuthError if the request fails.
 */
export const fetchUserInfo = async (
  accessToken: string
): Promise<BlitzWareAuthUser> => {
  const userInfoUrl = BASE_URL + "userinfo";
  try {
    const response = await axios.get(userInfoUrl, {
      params: {
        access_token: accessToken,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new BlitzWareAuthError(
      "Failed to fetch user info",
      "userinfo_failed"
    );
  }
};

/**
 * Attempts to refresh the access token using the stored refresh token.
 * @param clientId - The client ID.
 * @returns An object containing the new access token and optionally a new refresh token.
 * @throws BlitzWareAuthError if no refresh token is available or the refresh fails.
 */
export const tryRefreshToken = async (
  clientId: string
): Promise<{ access_token: string; refresh_token?: string }> => {
  const refreshToken = getToken("refresh_token");
  if (!refreshToken)
    throw new BlitzWareAuthError(
      "No refresh token available",
      "no_refresh_token"
    );

  const tokenUrl = BASE_URL + "token";

  try {
    const response = await axios.post(
      tokenUrl,
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    setToken("access_token", response.data.access_token);
    if (response.data.refresh_token) {
      setToken("refresh_token", response.data.refresh_token);
    }

    return response.data;
  } catch (error) {
    removeToken("access_token");
    removeToken("refresh_token");
    throw new BlitzWareAuthError("Failed to refresh token", "refresh_failed");
  }
};

/**
 * Stores an access or refresh token in localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @param token - The token value.
 */
export const setToken = (
  type: "access_token" | "refresh_token",
  token: string
) => {
  localStorage.setItem(type, token);
};

/**
 * Retrieves an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @returns The token value or null if not found.
 */
export const getToken = (
  type: "access_token" | "refresh_token"
): string | null => {
  return localStorage.getItem(type);
};

/**
 * Removes an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 */
export const removeToken = (type: "access_token" | "refresh_token") => {
  localStorage.removeItem(type);
};

/**
 * Decodes a JWT and returns its payload as an object.
 * @param token - The JWT string.
 * @returns The decoded payload object, or {} if decoding fails.
 */
const parseJwt = (token: string) => {
  try {
    if (!token) return {};
    const base64Url = token.split(".")[1];
    const payload = Buffer.from(base64Url, "base64");
    const jsonPayload = payload.toString("ascii");
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Converts a JWT exp (expiration) value to a Date object.
 * @param exp - The expiration value (number or string).
 * @returns The expiration as a Date, or null if invalid.
 */
const parseExp = (exp: number | string) => {
  if (!exp) return null;
  if (typeof exp !== "number") exp = Number(exp);
  if (isNaN(exp)) return null;
  return new Date(exp * 1000);
};

/**
 * Checks if the stored access token is valid (not expired).
 * @returns True if the token is valid, false otherwise.
 */
export const isTokenValid = (): boolean => {
  const token = getToken("access_token");
  if (!token) return false;

  const { exp } = parseJwt(token);
  const expiration = parseExp(exp);
  if (!expiration) return false;
  return expiration > new Date();
};

/**
 * Stores the OAuth state value in localStorage.
 * @param state - The state string.
 */
export const setState = (state: string) => {
  localStorage.setItem("state", state);
};

/**
 * Retrieves the OAuth state value from localStorage.
 * @returns The state string or null if not found.
 */
export const getState = () => {
  return localStorage.getItem("state");
};

/**
 * Removes the OAuth state value from localStorage.
 */
export const removeState = () => {
  localStorage.removeItem("state");
};

/**
 * Generates a high-entropy PKCE code_verifier.
 * @returns The code_verifier string.
 */
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Generates a PKCE code_challenge from a code_verifier.
 * @param verifier - The code_verifier string.
 * @returns The code_challenge string.
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const hash = new Uint8Array(digest);
  return btoa(String.fromCharCode(...hash))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Stores the PKCE code_verifier in localStorage.
 * @param verifier - The code_verifier string.
 */
const setCodeVerifier = (verifier: string) => {
  localStorage.setItem("pkce_code_verifier", verifier);
};

/**
 * Retrieves the PKCE code_verifier from localStorage.
 * @returns The code_verifier string or null if not found.
 */
const getCodeVerifier = (): string | null => {
  return localStorage.getItem("pkce_code_verifier");
};

/**
 * Removes the PKCE code_verifier from localStorage.
 */
export const removeCodeVerifier = () => {
  localStorage.removeItem("pkce_code_verifier");
};

/**
 * Generates a cryptographically secure random state string.
 * @returns A base64url-encoded random string.
 */
export const generateSecureState = (): string => {
  const array = new Uint8Array(32); // 256 bits of entropy
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Logs out the user from the BlitzWare authentication service.
 * @param clientId - The client ID.
 * @param options - Optional logout configuration.
 * @returns Promise that resolves when logout is complete.
 * @throws BlitzWareAuthError if logout fails.
 */
export const logoutFromService = async (clientId: string): Promise<void> => {
  const logoutUrl = BASE_URL + "logout";

  try {
    await axios.post(
      logoutUrl,
      { client_id: clientId },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    throw new BlitzWareAuthError("Failed to log out", "logout_failed");
  }
};

/**
 * Revokes a specific token.
 * @param token - The token to revoke.
 * @param tokenTypeHint - The type of token being revoked.
 * @param clientId - The client ID.
 * @throws BlitzWareAuthError if revocation fails.
 */
export const revokeToken = async (
  token: string,
  tokenTypeHint: "access_token" | "refresh_token",
  clientId: string
): Promise<void> => {
  const revokeUrl = BASE_URL + "revoke";

  try {
    await axios.post(
      revokeUrl,
      {
        token,
        token_type_hint: tokenTypeHint,
        client_id: clientId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw new BlitzWareAuthError("Failed to revoke token", "revoke_failed");
  }
};
