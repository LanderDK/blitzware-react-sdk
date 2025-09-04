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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useIsAuthenticated, useAuthLoading, useHasRole } from "./BlitzWareAuthProvider";
export const ProtectedRoute = (_a) => {
    var { component: Component, role, requireAllRoles = false } = _a, rest = __rest(_a, ["component", "role", "requireAllRoles"]);
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAuthLoading();
    const hasRequiredRole = useHasRole(role, requireAllRoles);
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
    // Check role requirements if specified
    if (role && !hasRequiredRole) {
        return (_jsxs("div", { style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "18px",
                flexDirection: "column",
                gap: "10px",
            }, children: [_jsx("div", { children: "Access Denied" }), _jsx("div", { style: { fontSize: "14px", color: "#666" }, children: "You don't have the required permissions to access this page." })] }));
    }
    return _jsx(Component, Object.assign({}, rest));
};
export default ProtectedRoute;
