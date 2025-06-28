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

export const hasAuthParams = (searchParams = window.location.search): boolean =>
  (TOKEN_RE.test(searchParams) || CODE_RE.test(searchParams)) &&
  STATE_RE.test(searchParams);

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

export const fetchUserInfo = async (
  accessToken: string
): Promise<BlitzWareAuthUser> => {
  const userInfoUrl = BASE_URL + "userinfo";
  try {
    const response = await axios.get(userInfoUrl, {
      params: {
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error) {
    throw new BlitzWareAuthError(
      "Failed to fetch user info",
      "userinfo_failed"
    );
  }
};

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

export const setToken = (
  type: "access_token" | "refresh_token",
  token: string
) => {
  localStorage.setItem(type, token);
};

export const getToken = (
  type: "access_token" | "refresh_token"
): string | null => {
  return localStorage.getItem(type);
};

export const removeToken = (type: "access_token" | "refresh_token") => {
  localStorage.removeItem(type);
};

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

const parseExp = (exp: number | string) => {
  if (!exp) return null;
  if (typeof exp !== "number") exp = Number(exp);
  if (isNaN(exp)) return null;
  return new Date(exp * 1000);
};

export const isTokenValid = (): boolean => {
  const token = getToken("access_token");
  if (!token) return false;

  const { exp } = parseJwt(token);
  const expiration = parseExp(exp);
  if (!expiration) return false;
  return expiration > new Date();
};

export const setState = (state: string) => {
  localStorage.setItem("state", state);
};

export const getState = () => {
  return localStorage.getItem("state");
};

export const removeState = () => {
  localStorage.removeItem("state");
};

/**
 * Generate a high-entropy code_verifier
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
 * Create a code_challenge from a code_verifier
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
 * Save code_verifier
 */
const setCodeVerifier = (verifier: string) => {
  localStorage.setItem("pkce_code_verifier", verifier);
};

/**
 * Get code_verifier
 */
const getCodeVerifier = (): string | null => {
  return localStorage.getItem("pkce_code_verifier");
};

/**
 * Remove code_verifier
 */
const removeCodeVerifier = () => {
  localStorage.removeItem("pkce_code_verifier");
};
