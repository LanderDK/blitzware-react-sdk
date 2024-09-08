import { Buffer } from "buffer";
export const setToken = (token) => {
    localStorage.setItem("access_token", token);
};
export const getToken = () => {
    return localStorage.getItem("access_token");
};
export const removeToken = () => {
    localStorage.removeItem("access_token");
};
const parseJwt = (token) => {
    try {
        if (!token)
            return {};
        const base64Url = token.split(".")[1];
        const payload = Buffer.from(base64Url, "base64");
        const jsonPayload = payload.toString("ascii");
        return JSON.parse(jsonPayload);
    }
    catch (error) {
        console.error(error);
    }
};
const parseExp = (exp) => {
    if (!exp)
        return null;
    if (typeof exp !== "number")
        exp = Number(exp);
    if (isNaN(exp))
        return null;
    return new Date(exp * 1000);
};
export const isTokenValid = () => {
    const token = getToken();
    if (!token)
        return false;
    const { exp } = parseJwt(token);
    const expiration = parseExp(exp);
    if (!expiration)
        return false;
    return expiration > new Date();
};
