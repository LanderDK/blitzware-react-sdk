var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useIsAuthenticated, useAuthLoading } from "./BlitzWareAuthProvider";
export const ProtectedRoute = (_a) => {
    var { component: Component } = _a, rest = __rest(_a, ["component"]);
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    // Show loading while authentication state is being determined
    if (isLoading) {
        return (_jsx("div", { style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
            }, children: "Loading..." }));
    }
    // Handle redirect without using React Router hooks to avoid context issues
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Use window.location to avoid Router context issues
            const currentPath = window.location.pathname;
            if (currentPath !== "/login") {
                window.location.href = "/login";
            }
        }
    }, [isAuthenticated, isLoading]);
    // Only render the component if authenticated
    if (!isAuthenticated) {
        return (_jsx("div", { style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
            }, children: "Redirecting to login..." }));
    }
    return _jsx(Component, Object.assign({}, rest));
};
export default ProtectedRoute;
