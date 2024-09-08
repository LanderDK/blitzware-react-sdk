var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Buffer } from "buffer";
import axios from "axios";
const TOKEN_RE = /[?&]access_token=[^&]+/;
const STATE_RE = /[?&]state=[^&]+/;
export const hasAuthParams = (searchParams = window.location.search) => TOKEN_RE.test(searchParams) && STATE_RE.test(searchParams);
export const generateAuthUrl = ({ responseType = "token", clientId, redirectUri }, state) => {
    const baseUrl = "https://auth.blitzware.xyz/api/auth/authorize";
    const queryParams = new URLSearchParams({
        response_type: responseType,
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
    });
    return `${baseUrl}?${queryParams.toString()}`;
};
export const fetchUserInfo = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.get(`https://auth.blitzware.xyz/api/auth/userinfo`, {
            params: {
                access_token: accessToken,
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error("Failed to fetch user info");
    }
});
export const setToken = (type, token) => {
    localStorage.setItem(type, token);
};
export const getToken = (type) => {
    return localStorage.getItem(type);
};
export const removeToken = (type) => {
    localStorage.removeItem(type);
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
    const token = getToken("access_token");
    if (!token)
        return false;
    const { exp } = parseJwt(token);
    const expiration = parseExp(exp);
    if (!expiration)
        return false;
    return expiration > new Date();
};
export const setState = (state) => {
    localStorage.setItem("state", state);
};
export const getState = () => {
    return localStorage.getItem("state");
};
export const removeState = () => {
    localStorage.removeItem("state");
};
