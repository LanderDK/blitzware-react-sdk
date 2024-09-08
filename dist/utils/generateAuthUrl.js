export const generateAuthUrl = ({ responseType = "token", clientId, redirectUri, state, }) => {
    const baseUrl = "https://auth.blitzware.xyz/api/auth/authorize";
    const queryParams = new URLSearchParams({
        response_type: responseType,
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
    });
    return `${baseUrl}?${queryParams.toString()}`;
};
