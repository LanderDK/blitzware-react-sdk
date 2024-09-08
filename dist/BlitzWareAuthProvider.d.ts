import React from "react";
import { BlitzWareAuthProviderParams, BlitzWareAuthUser } from "./types";
export declare const useAuthUser: () => BlitzWareAuthUser | null;
export declare const useIsAuthenticated: () => boolean;
export declare const useAuthLoading: () => boolean;
export declare const useLogin: () => () => void;
export declare const useLogout: () => () => void;
export declare const BlitzWareAuthProvider: React.FC<BlitzWareAuthProviderParams>;
//# sourceMappingURL=BlitzWareAuthProvider.d.ts.map