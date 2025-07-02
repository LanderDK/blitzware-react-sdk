var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BlitzWareAuthError, } from "./types";
import { Buffer } from "buffer";
import axios from "axios";
const TOKEN_RE = /[?&]access_token=[^&]+/;
const CODE_RE = /[?&]code=[^&]+/;
const STATE_RE = /[?&]state=[^&]Ò+/;
const BASE_URL = "http://localhost:9001/api/auth/";
/**
 * Checks if the URL search parameters contain authentication parameters.
 * @param searchParams - The URL search string to check (defaults to window.location.search).
 * @returns True if authentication parameters are present, false otherwise.
 */
export const hasAuthParams = (searchParams = window.location.search) => (TOKEN_RE.test(searchParams) || CODE_RE.test(searchParams)) &&
    STATE_RE.test(searchParams);
/**
 * Generates the BlitzWare authorization URL with optional PKCE support.
 * @param params - The authorization parameters.
 * @param state - The state string to include in the request.
 * @returns The full authorization URL.
 */
export const generateAuthUrl = (_a, state_1) => __awaiter(void 0, [_a, state_1], void 0, function* ({ responseType = "code", clientId, redirectUri }, state) {
    const authUrl = BASE_URL + "authorize";
    const queryParams = new URLSearchParams({
        response_type: responseType,
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
    });
    if (responseType === "code") {
        const verifier = generateCodeVerifier();
        const challenge = yield generateCodeChallenge(verifier);
        setCodeVerifier(verifier);
        queryParams.append("code_challenge", challenge);
        queryParams.append("code_challenge_method", "S256");
    }
    return `${authUrl}?${queryParams.toString()}`;
});
/**
 * Exchanges an authorization code for access and refresh tokens.
 * @param code - The authorization code received from the authorization server.
 * @param clientId - The client ID.
 * @param redirectUri - The redirect URI.
 * @returns An object containing the access token and optionally a refresh token.
 * @throws BlitzWareAuthError if the code_verifier is missing or the exchange fails.
 */
export const exchangeCodeForToken = (code, clientId, redirectUri) => __awaiter(void 0, void 0, void 0, function* () {
    const codeVerifier = getCodeVerifier();
    if (!codeVerifier)
        throw new BlitzWareAuthError("Missing PKCE code_verifier", "missing_code_verifier");
    const tokenUrl = BASE_URL + "token";
    try {
        const response = yield axios.post(tokenUrl, {
            grant_type: "authorization_code",
            code,
            client_id: clientId,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        removeCodeVerifier();
        return response.data;
    }
    catch (error) {
        throw new BlitzWareAuthError("Failed to exchange code for token", "exchange_failed");
    }
});
/**
 * Fetches user information using the provided access token.
 * @param accessToken - The access token.
 * @returns The authenticated user's information.
 * @throws BlitzWareAuthError if the request fails.
 */
export const fetchUserInfo = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfoUrl = BASE_URL + "userinfo";
    try {
        const response = yield axios.get(userInfoUrl, {
            params: {
                access_token: accessToken,
            },
        });
        return response.data;
    }
    catch (error) {
        throw new BlitzWareAuthError("Failed to fetch user info", "userinfo_failed");
    }
});
/**
 * Attempts to refresh the access token using the stored refresh token.
 * @param clientId - The client ID.
 * @returns An object containing the new access token and optionally a new refresh token.
 * @throws BlitzWareAuthError if no refresh token is available or the refresh fails.
 */
export const tryRefreshToken = (clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = getToken("refresh_token");
    if (!refreshToken)
        throw new BlitzWareAuthError("No refresh token available", "no_refresh_token");
    const tokenUrl = BASE_URL + "token";
    try {
        const response = yield axios.post(tokenUrl, {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        setToken("access_token", response.data.access_token);
        if (response.data.refresh_token) {
            setToken("refresh_token", response.data.refresh_token);
        }
        return response.data;
    }
    catch (error) {
        removeToken("access_token");
        removeToken("refresh_token");
        throw new BlitzWareAuthError("Failed to refresh token", "refresh_failed");
    }
});
/**
 * Stores an access or refresh token in localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @param token - The token value.
 */
export const setToken = (type, token) => {
    localStorage.setItem(type, token);
};
/**
 * Retrieves an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 * @returns The token value or null if not found.
 */
export const getToken = (type) => {
    return localStorage.getItem(type);
};
/**
 * Removes an access or refresh token from localStorage.
 * @param type - The type of token ("access_token" or "refresh_token").
 */
export const removeToken = (type) => {
    localStorage.removeItem(type);
};
/**
 * Decodes a JWT and returns its payload as an object.
 * @param token - The JWT string.
 * @returns The decoded payload object, or {} if decoding fails.
 */
const parseJwt = (token) => {
    try {
        if (!token)
            return {};
        const base64Url = token.split(".")[1];
        const payload = Buffer.from(base64Url, "base64");
        const jsonPayload = payload.toString("ascii");
        return JSON.parse(jsonPayload);
    }
    catch (error) {
        console.error(error);
    }
};
/**
 * Converts a JWT exp (expiration) value to a Date object.
 * @param exp - The expiration value (number or string).
 * @returns The expiration as a Date, or null if invalid.
 */
const parseExp = (exp) => {
    if (!exp)
        return null;
    if (typeof exp !== "number")
        exp = Number(exp);
    if (isNaN(exp))
        return null;
    return new Date(exp * 1000);
};
/**
 * Checks if the stored access token is valid (not expired).
 * @returns True if the token is valid, false otherwise.
 */
export const isTokenValid = () => {
    const token = getToken("access_token");
    if (!token)
        return false;
    const { exp } = parseJwt(token);
    const expiration = parseExp(exp);
    if (!expiration)
        return false;
    return expiration > new Date();
};
/**
 * Stores the OAuth state value in localStorage.
 * @param state - The state string.
 */
export const setState = (state) => {
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
const generateCodeVerifier = () => {
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
const generateCodeChallenge = (verifier) => __awaiter(void 0, void 0, void 0, function* () {
    const data = new TextEncoder().encode(verifier);
    const digest = yield window.crypto.subtle.digest("SHA-256", data);
    const hash = new Uint8Array(digest);
    return btoa(String.fromCharCode(...hash))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
});
/**
 * Stores the PKCE code_verifier in localStorage.
 * @param verifier - The code_verifier string.
 */
const setCodeVerifier = (verifier) => {
    localStorage.setItem("pkce_code_verifier", verifier);
};
/**
 * Retrieves the PKCE code_verifier from localStorage.
 * @returns The code_verifier string or null if not found.
 */
const getCodeVerifier = () => {
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
export const generateSecureState = () => {
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
export const logoutFromService = (clientId_1, ...args_1) => __awaiter(void 0, [clientId_1, ...args_1], void 0, function* (clientId, options = {}) {
    var _a, _b;
    const { postLogoutRedirectUri, state, revokeTokens = true, method = "POST", } = options;
    const logoutUrl = BASE_URL + "logout";
    const accessToken = getToken("access_token");
    const refreshToken = getToken("refresh_token");
    try {
        if (method === "GET") {
            // Use GET method with query parameters
            const queryParams = new URLSearchParams();
            if (postLogoutRedirectUri) {
                queryParams.append("post_logout_redirect_uri", postLogoutRedirectUri);
            }
            if (state) {
                queryParams.append("state", state);
            }
            const response = yield axios.get(`${logoutUrl}?${queryParams.toString()}`);
            // Handle redirect response
            if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.redirectUrl) {
                window.location.href = response.data.redirectUrl;
                return;
            }
        }
        else {
            // Use POST method with body
            const requestBody = {
                revoke_tokens: revokeTokens,
                client_id: clientId,
            };
            // Include token information if available
            if (accessToken) {
                requestBody.token = accessToken;
                requestBody.token_type_hint = "access_token";
            }
            else if (refreshToken) {
                requestBody.token = refreshToken;
                requestBody.token_type_hint = "refresh_token";
            }
            const queryParams = new URLSearchParams();
            if (postLogoutRedirectUri) {
                queryParams.append("post_logout_redirect_uri", postLogoutRedirectUri);
            }
            if (state) {
                queryParams.append("state", state);
            }
            const url = queryParams.toString()
                ? `${logoutUrl}?${queryParams.toString()}`
                : logoutUrl;
            const response = yield axios.post(url, requestBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // Handle redirect response
            if ((_b = response.data) === null || _b === void 0 ? void 0 : _b.redirectUrl) {
                window.location.href = response.data.redirectUrl;
                return;
            }
        }
    }
    catch (error) {
        // Log error but don't fail the logout process
        console.error("Error during service logout:", error);
        // Don't throw here - we still want to clear local tokens
    }
});
/**
 * Revokes a specific token.
 * @param token - The token to revoke.
 * @param tokenTypeHint - The type of token being revoked.
 * @param clientId - The client ID.
 * @throws BlitzWareAuthError if revocation fails.
 */
export const revokeToken = (token, tokenTypeHint, clientId) => __awaiter(void 0, void 0, void 0, function* () {
    const revokeUrl = BASE_URL + "revoke";
    try {
        yield axios.post(revokeUrl, {
            token,
            token_type_hint: tokenTypeHint,
            client_id: clientId,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        throw new BlitzWareAuthError("Failed to revoke token", "revoke_failed");
    }
});
