import { ReactNode } from "react";
export interface BlitzWareAuthParams {
    responseType?: "code" | "token";
    clientId: string;
    redirectUri: string;
    authBaseUrl?: string;
}
export interface GetAccessTokenOptions {
    minValiditySeconds?: number;
    forceRefresh?: boolean;
    rejectedToken?: string;
}
export interface BlitzWareAuthProviderParams {
    children: ReactNode;
    authParams: BlitzWareAuthParams;
}
export interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    role?: string | string[];
    requireAllRoles?: boolean;
}
export interface BlitzWareAuthUser {
    id: string;
    username: string;
    email?: string;
    roles?: string[];
}
/**
 * RFC 7662 OAuth2 Token Introspection Response
 */
export interface TokenIntrospectionResponse {
    active: boolean;
    client_id?: string;
    username?: string;
    token_type?: string;
    exp?: number;
    iat?: number;
    sub?: string;
    aud?: string;
    iss?: string;
    jti?: string;
    scope?: string;
}
/**
 * Clean authentication context interface
 * Following industry standards for simplicity
 */
export interface BlitzWareAuthContextType {
    user: BlitzWareAuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    getAccessToken: (options?: GetAccessTokenOptions) => Promise<string | null>;
}
export declare class BlitzWareAuthError extends Error {
    code: string;
    details?: Record<string, any>;
    constructor(message: string, code: string, details?: Record<string, any>);
}
//# sourceMappingURL=types.d.ts.map