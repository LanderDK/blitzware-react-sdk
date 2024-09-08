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
import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "./BlitzWareAuthProvider";
export const ProtectedRoute = (_a) => {
    var { component: Component } = _a, rest = __rest(_a, ["component"]);
    const isAuthenticated = useIsAuthenticated();
    return isAuthenticated ? _jsx(Component, Object.assign({}, rest)) : _jsx(Navigate, { to: "/login" });
};
export default ProtectedRoute;
