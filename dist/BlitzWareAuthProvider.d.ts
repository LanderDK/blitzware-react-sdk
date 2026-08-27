import React from "react";
import { BlitzWareAuthProviderParams, BlitzWareAuthUser, GetAccessTokenOptions } from "./types";
/**
 * Custom hook to get the authenticated user.
 * @returns The current authenticated user or null.
 */
export declare const useAuthUser: () => BlitzWareAuthUser | null;
/**
 * Custom hook to check if the user is authenticated.
 * @returns True if authenticated, false otherwise.
 */
export declare const useIsAuthenticated: () => boolean;
/**
 * Custom hook to check if authentication is loading.
 * @returns True if loading, false otherwise.
 */
export declare const useAuthLoading: () => boolean;
/**
 * Custom hook to get the login function.
 * @returns The login function.
 */
export declare const useLogin: () => () => void;
/**
 * Custom hook to get the logout function.
 * @returns The logout function.
 */
export declare const useLogout: () => () => Promise<void>;
export declare const useAccessToken: () => (options?: GetAccessTokenOptions) => Promise<string | null>;
/**
 * Custom hook to check if the user has the required role(s).
 * @param role - Single role or array of roles to check
 * @param requireAllRoles - If true, user must have ALL roles (AND logic), if false, user needs ANY role (OR logic)
 * @returns True if user has the required role(s), false otherwise.
 */
export declare const useHasRole: (role?: string | string[], requireAllRoles?: boolean) => boolean;
/**
 * BlitzWareAuthProvider component that manages authentication state and provides context.
 * @param children - The child components to render.
 * @param authParams - The authentication parameters.
 * @returns The provider component wrapping its children.
 */
export declare const BlitzWareAuthProvider: React.FC<BlitzWareAuthProviderParams>;
//# sourceMappingURL=BlitzWareAuthProvider.d.ts.map