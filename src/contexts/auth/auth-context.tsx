import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}
interface UserData {
  user: User;
  roles: any[]; // có thể là string[] hoặc object[]
  permissions: string[];
}
interface AuthContextType {
  user: User | null;
  roles: string[] | null; // <-- luôn là slug[]
  permissions: string[] | null;
  login: (userData: UserData) => void;
  logout: () => void;
  loading: boolean;
  accessRights: Record<string, boolean>;
  setAccessRight: (
    key: string,
    requiredRoles?: string[],
    requiredPermissions?: string[]
  ) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialData?: UserData; // từ SSR
}

// --- helpers ---
const toSlug = (v: any): string =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const normalizeRolesToSlugs = (roles: any[]): string[] => {
  // Hỗ trợ cả dạng ["Admin", "Super Admin"] hoặc [{slug:"admin"},{name:"Super Admin"}]
  return (roles ?? [])
    .map((r: any) => {
      if (!r) return null;
      if (typeof r === "string") return toSlug(r);
      if (typeof r === "object") {
        if (r.slug) return toSlug(r.slug);
        if (r.name) return toSlug(r.name);
      }
      return null;
    })
    .filter(Boolean) as string[];
};

export const AuthProvider = ({ children, initialData }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialData?.user || null);
  const [roles, setRoles] = useState<string[]>(
    initialData?.roles ? normalizeRolesToSlugs(initialData.roles) : []
  );
  const [permissions, setPermissions] = useState<string[]>(
    initialData?.permissions || []
  );
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [accessRights, setAccessRights] = useState<Record<string, boolean>>({});

  const setAccessRight = (
    key: string,
    requiredRoles: string[] = [],
    requiredPermissions: string[] = [],
    checkRoles: string[] = roles,
    checkPermissions: string[] = permissions
  ) => {
    // So sánh theo slug
    const requiredRoleSlugs = requiredRoles.map(toSlug);
    const hasRole = requiredRoleSlugs.some(
      (role) => checkRoles?.includes(role) ?? false
    );
    const hasPermission = requiredPermissions.some(
      (perm) => checkPermissions?.includes(perm) ?? false
    );
    setAccessRights((prev) => ({ ...prev, [key]: hasRole || hasPermission }));
  };

  const checkAllAccessRights = (
    checkRoles: string[],
    checkPermissions: string[]
  ) => {
    setAccessRight(
      "canWholeSalePrice",
      ["admin", "user", "super-admin"],
      [],
      checkRoles,
      checkPermissions
    );
    setAccessRight(
      "canEdit",
      ["admin"],
      ["edit"],
      checkRoles,
      checkPermissions
    );
  };

  // Hydrate từ SSR nếu có
  useEffect(() => {
    if (initialData) {
      const r = normalizeRolesToSlugs(initialData.roles ?? []);
      setRoles(r);
      checkAllAccessRights(r, initialData.permissions ?? []);
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await http.get(API_ENDPOINTS.ME);
        if (!mounted) return;
        const data = res.data as UserData;
        const roleSlugs = normalizeRolesToSlugs(data.roles ?? []);
        setUser(data.user ?? null);
        setRoles(roleSlugs);
        setPermissions(data.permissions ?? []);
        checkAllAccessRights(roleSlugs, data.permissions ?? []);
      } catch {
        if (!mounted) return;
        setUser(null);
        setRoles([]);
        setPermissions([]);
        setAccessRights({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialData]);

  // login: nhận mọi format, convert về slug luôn
  const login = (userData: UserData) => {
    const roleSlugs = normalizeRolesToSlugs(userData.roles ?? []);
    setUser(userData.user);
    setRoles(roleSlugs);
    setPermissions(userData.permissions ?? []);
    checkAllAccessRights(roleSlugs, userData.permissions ?? []);
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setAccessRights({});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        login,
        logout,
        loading,
        accessRights,
        setAccessRight,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
