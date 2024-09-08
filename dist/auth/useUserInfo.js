import React from "react";
import { getToken } from "../utils/tokenStorage";
import { fetchUserInfo } from "../utils/fetchUserInfo";
export const useUserInfo = () => {
    const [userInfo, setUserInfo] = React.useState(null);
    React.useEffect(() => {
        const token = getToken();
        if (token) {
            fetchUserInfo(token).then(setUserInfo).catch(console.error);
        }
    }, []);
    return userInfo;
};
