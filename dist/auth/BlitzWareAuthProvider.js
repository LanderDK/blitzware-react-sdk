import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { isTokenValid, removeToken, setToken } from "../utils/tokenStorage";
import { generateAuthUrl } from "../utils/generateAuthUrl";
const BlitzWareAuthContext = React.createContext({});
const useBlitzWareAuth = () => React.useContext(BlitzWareAuthContext);
export const useIsAuthenticated = () => {
    const { isAuthenticated } = useBlitzWareAuth();
    return isAuthenticated;
};
export const useLogin = () => {
    const { login } = useBlitzWareAuth();
    return login;
};
export const useLogout = () => {
    const { logout } = useBlitzWareAuth();
    return logout;
};
export const useRedirectCallback = () => {
    const { redirectCallback } = useBlitzWareAuth();
    return redirectCallback;
};
export const BlitzWareAuthProvider = ({ children, authParams, }) => {
    const [authUrl] = React.useState(generateAuthUrl(authParams));
    const [isAuthenticated, setIsAuthenticated] = React.useState(isTokenValid());
    React.useEffect(() => {
        console.log(isTokenValid());
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("access_token");
        if (token) {
            setToken(token);
            setIsAuthenticated(true);
        }
        else {
            setIsAuthenticated(false);
        }
    }, []);
    const login = React.useCallback(() => {
        window.location.href = authUrl;
    }, [authUrl]);
    const logout = React.useCallback(() => {
        removeToken();
        setIsAuthenticated(false);
    }, []);
    const redirectCallback = React.useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("access_token");
        if (token) {
            setToken(token);
            setIsAuthenticated(true);
        }
        else {
            setIsAuthenticated(false);
        }
    }, []);
    const value = React.useMemo(() => ({ isAuthenticated, login, logout, redirectCallback }), [isAuthenticated, login, logout, redirectCallback]);
    return (_jsx(BlitzWareAuthContext.Provider, Object.assign({ value: value }, { children: children })));
};
