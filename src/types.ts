import { ReactNode } from "react";

export interface BlitzWareAuthContextType {
  user: BlitzWareAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: (options?: LogoutOptions) => Promise<void>;
}

export interface BlitzWareAuthParams {
  responseType?: "code" | "token";
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
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

export interface LogoutOptions {
  postLogoutRedirectUri?: string;
  state?: string;
  revokeTokens?: boolean;
  method?: "GET" | "POST";
}

export class BlitzWareAuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "BlitzWareAuthError";
  }
}
