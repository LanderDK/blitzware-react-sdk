import { ReactNode } from "react";
export interface BlitzWareAuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    redirectCallback: () => void;
}
export interface BlitzWareAuthParams {
    responseType?: "code" | "token";
    clientId: string;
    redirectUri: string;
    state: string;
}
export interface BlitzWareAuthProviderParams {
    children: ReactNode;
    authParams: BlitzWareAuthParams;
}
export interface ProtectedRouteProps {
    component: React.ComponentType<any>;
}
//# sourceMappingURL=index.d.ts.map