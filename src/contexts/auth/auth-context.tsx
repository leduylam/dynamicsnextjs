
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ReactNode } from "react";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

// Định nghĩa các interface
interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
}

interface UserData {
    user: User;
    roles: string[];
    permissions: string[];
}

interface AuthContextType {
    user: User | null;
    roles: string[] | null;
    permissions: string[] | null;
    login: (userData: UserData, accessToken: string, refreshToken: string, expiresIn: number) => void;
    logout: () => void;
    loading: boolean;
}

// Tạo context
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider
interface AuthProviderProps {
    children: ReactNode;
    initialData?: UserData; // Nhận initialData từ server-side
}

export const AuthProvider = ({ children, initialData }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(initialData?.user || null);
    const [roles, setRoles] = useState<string[]>(initialData?.roles || []);
    const [permissions, setPermissions] = useState<string[]>(initialData?.permissions || []);
    const [loading, setLoading] = useState<boolean>(!initialData); // Chỉ loading nếu không có initialData

    // Fetch user từ API /me nếu không có initialData
    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get("access_token");
            if (!token || initialData) {
                setLoading(false); // Không fetch nếu đã có initialData hoặc không có token
                return;
            }

            try {
                setLoading(true);
                const response = await http.get(API_ENDPOINTS.ME, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response?.data) throw new Error("Không thể lấy thông tin user");
                const data = response.data;
                setUser(data.user);
                setRoles(data.roles);
                setPermissions(data.permissions);
            } catch (error) {
                console.error("Lỗi khi fetch user:", error);
                setUser(null);
                setRoles([]);
                setPermissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [initialData]); // Chỉ chạy lại nếu initialData thay đổi

    // Hàm đăng nhập
    const login = (userData: UserData, accessToken: string, refreshToken: string, expiresIn: number) => {
        const expires = new Date(new Date().getTime() + expiresIn * 60 * 60 * 1000); // expiresIn tính bằng giờ
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
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};