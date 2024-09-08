import { ReactNode } from "react";
export interface BlitzWareAuthContextType {
    user: BlitzWareAuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}
export interface BlitzWareAuthParams {
    responseType?: "code" | "token";
    clientId: string;
    redirectUri: string;
}
export interface BlitzWareAuthProviderParams {
    children: ReactNode;
    authParams: BlitzWareAuthParams;
}
export interface ProtectedRouteProps {
    component: React.ComponentType<any>;
}
export interface BlitzWareAuthUser {
    id: string;
    username: string;
    email?: string;
    roles?: string[];
}
//# sourceMappingURL=types.d.ts.map