import React from "react";
import {
  BlitzWareAuthProviderParams,
  BlitzWareAuthContextType,
  BlitzWareAuthUser,
} from "./types";
import {
  generateAuthUrl,
  hasAuthParams,
  isTokenValid,
  removeToken,
  setToken,
  setState,
  getState,
  removeState,
  fetchUserInfo,
  getToken,
} from "./utils";
import { nanoid } from "nanoid";

const BlitzWareAuthContext = React.createContext<BlitzWareAuthContextType>(
  {} as BlitzWareAuthContextType
);

const useBlitzWareAuth = () => React.useContext(BlitzWareAuthContext);

export const useAuthUser = () => {
  const { user } = useBlitzWareAuth();
  return user;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useBlitzWareAuth();
  return isAuthenticated;
};

export const useAuthLoading = () => {
  const { isLoading } = useBlitzWareAuth();
  return isLoading;
};

export const useLogin = () => {
  const { login } = useBlitzWareAuth();
  return login;
};

export const useLogout = () => {
  const { logout } = useBlitzWareAuth();
  return logout;
};

export const BlitzWareAuthProvider: React.FC<BlitzWareAuthProviderParams> = ({
  children,
  authParams,
}) => {
  const authState = React.useRef(getState() || nanoid());
  const didInitialise = React.useRef(false);
  const [user, setUser] = React.useState<BlitzWareAuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(isTokenValid());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (didInitialise.current) return;
    didInitialise.current = true;

    if (hasAuthParams()) {
      const urlParams = new URLSearchParams(window.location.search);

      const state = urlParams.get("state");
      if (state !== authState.current) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const access_token = urlParams.get("access_token");
      if (access_token) {
        setToken("access_token", access_token);
        setIsAuthenticated(true);
        fetchUserInfo(access_token).then((data) => {
          setUser(data);
          setIsLoading(false);
        });
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }

      const refresh_token = urlParams.get("refresh_token");
      if (refresh_token) setToken("refresh_token", refresh_token);
    } else {
      setIsAuthenticated(isTokenValid());
      if (isTokenValid()) {
        fetchUserInfo(getToken("access_token") as string).then((data) => {
          setUser(data);
          setIsLoading(false);
        });
      }
    }
  }, []);

  const login = React.useCallback(() => {
    const newState = nanoid();
    setState(newState);
    const newAuthUrl = generateAuthUrl(authParams, newState);
    window.location.href = newAuthUrl;
  }, [authParams]);

  const logout = React.useCallback(() => {
    removeToken("access_token");
    removeToken("refresh_token");
    removeState();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ isAuthenticated, user, isLoading, login, logout }),
    [isAuthenticated, user, isLoading, login, logout]
  );

  return (
    <BlitzWareAuthContext.Provider value={value}>
      {children}
    </BlitzWareAuthContext.Provider>
  );
};
