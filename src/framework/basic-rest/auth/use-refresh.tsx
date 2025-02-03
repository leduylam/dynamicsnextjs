// import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { getRefreshToken } from "@framework/utils/get-token";

export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token is not available');
        }
        // const response = await http.post(`${API_ENDPOINTS.REFRESH_TOKEN}`, { refresh_token: refreshToken });

        // const { access_token, expires_in } = response.data;
        // const expires = new Date(new Date().getTime() + expires_in * 60 * 60 * 1000);
        // Cookies.set('access_token', access_token, { expires });
        // return access_token;
    } catch (error) {
        console.error('Unable to refresh access token', error);
        window.location.href = '/login'; // Chuyển hướng đến trang đăng nhập nếu refresh thất bại
        return null;
    }
};