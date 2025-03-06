import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
interface User {
    id: number;
    name: string;
    email: string;
    phone: string,
    address: string
    // Add other user properties as needed
}

interface UserData {
    user: User;
    roles: string[];
    permissions: string[];
}
// Tạo context
interface AuthContextType {
    user: User | null;
    roles: string[] | null;
    permissions: string[] | null;
    login: (userData: UserData, accessToken: string, refreshToken: string, expiresIn: number) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider
import { ReactNode } from "react";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user từ API /me nếu có token
    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get("access_token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await http.get(API_ENDPOINTS.ME, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response) throw new Error("Không thể lấy thông tin user");
                const data = response.data;
                setUser(data.user);
                setRoles(data.roles);
                setPermissions(data.permissions);
            } catch (error) {
                console.error("Lỗi khi fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Hàm đăng nhập


    const login = (userData: UserData, accessToken: string, refreshToken: string, expiresIn: number) => {
        const expires = new Date(new Date().getTime() + expiresIn * 60 * 60 * 1000);
        Cookies.set("access_token", accessToken, { expires });
        Cookies.set("refresh_token", refreshToken, { expires });

        setUser(userData.user);
        setRoles(userData.roles);
        setPermissions(userData.permissions);
    };

    // Hàm đăng xuất
    const logout = () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        setUser(null);
        setRoles([]);
        setPermissions([]);
    };
    return (
        <AuthContext.Provider value={{ user, roles, permissions, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng auth
export const useAuth = () => {
    return useContext(AuthContext);
};