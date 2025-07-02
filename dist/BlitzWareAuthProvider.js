var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { generateAuthUrl, hasAuthParams, isTokenValid, removeToken, setToken, setState, getState, removeState, fetchUserInfo, getToken, exchangeCodeForToken, tryRefreshToken, removeCodeVerifier, generateSecureState, logoutFromService, } from "./utils";
const BlitzWareAuthContext = React.createContext({});
/**
 * Custom hook to access the BlitzWare authentication context.
 * @returns The BlitzWareAuthContext value.
 */
const useBlitzWareAuth = () => React.useContext(BlitzWareAuthContext);
/**
 * Custom hook to get the authenticated user.
 * @returns The current authenticated user or null.
 */
export const useAuthUser = () => {
    const { user } = useBlitzWareAuth();
    return user;
};
/**
 * Custom hook to check if the user is authenticated.
 * @returns True if authenticated, false otherwise.
 */
export const useIsAuthenticated = () => {
    const { isAuthenticated } = useBlitzWareAuth();
    return isAuthenticated;
};
/**
 * Custom hook to check if authentication is loading.
 * @returns True if loading, false otherwise.
 */
export const useAuthLoading = () => {
    const { isLoading } = useBlitzWareAuth();
    return isLoading;
};
/**
 * Custom hook to get the login function.
 * @returns The login function.
 */
export const useLogin = () => {
    const { login } = useBlitzWareAuth();
    return login;
};
/**
 * Custom hook to get the logout function.
 * @returns The logout function.
 */
export const useLogout = () => {
    const { logout } = useBlitzWareAuth();
    return logout;
};
/**
 * BlitzWareAuthProvider component that manages authentication state and provides context.
 * @param children - The child components to render.
 * @param authParams - The authentication parameters.
 * @returns The provider component wrapping its children.
 */
export const BlitzWareAuthProvider = ({ children, authParams, }) => {
    const authState = React.useRef(getState() || generateSecureState());
    const didInitialise = React.useRef(false);
    const [user, setUser] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(isTokenValid());
    const [isLoading, setIsLoading] = React.useState(true);
    /**
     * Effect to handle authentication callback and user state initialization.
     */
    React.useEffect(() => {
        if (didInitialise.current)
            return;
        didInitialise.current = true;
        const handleAuthCallback = () => __awaiter(void 0, void 0, void 0, function* () {
            if (hasAuthParams()) {
                const urlParams = new URLSearchParams(window.location.search);
                const state = urlParams.get("state");
                if (state !== authState.current) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }
                // Handle Authorization Code flow
                const code = urlParams.get("code");
                if (code) {
                    try {
                        const tokenResponse = yield exchangeCodeForToken(code, authParams.clientId, authParams.redirectUri);
                        setToken("access_token", tokenResponse.access_token);
                        if (tokenResponse.refresh_token) {
                            setToken("refresh_token", tokenResponse.refresh_token);
                        }
                        const userData = yield fetchUserInfo(tokenResponse.access_token);
                        setUser(userData);
                        setIsAuthenticated(true);
                        // Clean up URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                    catch (error) {
                        console.error("Failed to handle authorization code:", error);
                        setIsAuthenticated(false);
                    }
                    setIsLoading(false);
                    return;
                }
                // Handle Implicit flow
                const access_token = urlParams.get("access_token");
                if (access_token) {
                    setToken("access_token", access_token);
                    setIsAuthenticated(true);
                    fetchUserInfo(access_token).then((data) => {
                        setUser(data);
                        setIsLoading(false);
                    });
                }
                else {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                }
                const refresh_token = urlParams.get("refresh_token");
                if (refresh_token)
                    setToken("refresh_token", refresh_token);
            }
            else {
                if (isTokenValid()) {
                    fetchUserInfo(getToken("access_token")).then((data) => {
                        setUser(data);
                        setIsAuthenticated(true);
                    });
                    setIsLoading(false);
                }
                else {
                    tryRefreshToken(authParams.clientId)
                        .then((tokenResponse) => {
                        fetchUserInfo(tokenResponse.access_token).then((data) => {
                            setUser(data);
                            setIsAuthenticated(true);
                        });
                    })
                        .catch((e) => {
                        console.error(e);
                        setIsAuthenticated(false);
                    })
                        .finally(() => setIsLoading(false));
                }
            }
        });
        handleAuthCallback();
    }, [authParams.clientId, authParams.redirectUri]);
    /**
     * Initiates the login process by redirecting to the authorization URL.
     */
    const login = React.useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        const newState = generateSecureState();
        setState(newState);
        const newAuthUrl = yield generateAuthUrl(authParams, newState);
        window.location.href = newAuthUrl;
    }), [authParams]);
    /**
     * Logs out the user by clearing tokens and optionally calling the logout service.
     * @param options - Optional logout configuration.
     */
    const logout = React.useCallback((...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
        // Merge with default options from authParams
        const logoutOptions = Object.assign({ postLogoutRedirectUri: authParams.postLogoutRedirectUri, revokeTokens: true, method: "POST" }, options);
        try {
            // Call the logout service endpoint
            yield logoutFromService(authParams.clientId, logoutOptions);
        }
        catch (error) {
            // Log error but continue with local cleanup
            console.error("Service logout failed:", error);
        }
        // Always clear local state regardless of service call result
        removeToken("access_token");
        removeToken("refresh_token");
        removeState();
        removeCodeVerifier();
        setIsAuthenticated(false);
        setUser(null);
        // If no redirect happened from service, redirect locally if specified
        if (logoutOptions.postLogoutRedirectUri && !logoutOptions.state) {
            window.location.href = logoutOptions.postLogoutRedirectUri;
        }
    }), [authParams.clientId, authParams.postLogoutRedirectUri]);
    /**
     * Memoized context value for provider.
     */
    const value = React.useMemo(() => ({ isAuthenticated, user, isLoading, login, logout }), [isAuthenticated, user, isLoading, login, logout]);
    return (_jsx(BlitzWareAuthContext.Provider, { value: value, children: children }));
};
