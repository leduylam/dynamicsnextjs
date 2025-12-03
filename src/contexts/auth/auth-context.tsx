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
  roles: any[];
  permissions: string[];
}
interface AuthContextType {
  user: User | null;
  roles: string[] | null;
  permissions: string[] | null;
  login: (userData: UserData) => void;
  logout: () => void;
  clearState: () => void;
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
  initialData?: UserData;
}

const toSlug = (v: any): string =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const normalizeRolesToSlugs = (roles: any[]): string[] => {
  const normalized = (roles ?? [])
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

  // Debug log để kiểm tra role normalization
  console.log('[Auth] Role normalization:', {
    input: roles,
    output: normalized
  });

  return normalized;
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
    const wholesaleRoles = [
      "admin",
      "user",
      "super-admin",
      "corporate",
      "sale",
      "sales-manager",
      "accounting",
      "warehouse",
      "designer",
    ];

    setAccessRight(
      "canWholeSalePrice",
      wholesaleRoles,
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

  useEffect(() => {
    if (initialData) {
      const r = normalizeRolesToSlugs(initialData.roles ?? []);
      setRoles(r);
      checkAllAccessRights(r, initialData.permissions ?? []);
      setLoading(false);
      return;
    }

    let mounted = true;
    const abortController = new AbortController();

    const initializeAuth = async () => {
      if (!mounted) return;

      try {
        setLoading(true);

        const res = await http.get(API_ENDPOINTS.ME, {
          signal: abortController.signal,
        });

        if (!mounted) return;

        const data = res.data as UserData;
        const roleSlugs = normalizeRolesToSlugs(data.roles ?? []);
        setUser(data.user ?? null);
        setRoles(roleSlugs);
        setPermissions(data.permissions ?? []);
        checkAllAccessRights(roleSlugs, data.permissions ?? []);

      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return;
        }

        if (!mounted) return;

        const status = error.response?.status;

        if (status === 401 || status === 419) {
          try {
            await http.post(API_ENDPOINTS.REFRESH_TOKEN, {}, {
              signal: abortController.signal,
              withCredentials: true,
            });

            if (!mounted) return;

            const meRes = await http.get(API_ENDPOINTS.ME, {
              signal: abortController.signal,
            });

            if (!mounted) return;

            const data = meRes.data as UserData;
            const roleSlugs = normalizeRolesToSlugs(data.roles ?? []);
            setUser(data.user ?? null);
            setRoles(roleSlugs);
            setPermissions(data.permissions ?? []);
            checkAllAccessRights(roleSlugs, data.permissions ?? []);

            if (mounted) setLoading(false);
            return;

          } catch (refreshError: any) {
            if (refreshError.name === 'AbortError' || refreshError.name === 'CanceledError') {
              return;
            }
            const refreshStatus = refreshError.response?.status;
            if (refreshStatus === 401 || refreshStatus === 419) {
              setUser(null);
              setRoles([]);
              setPermissions([]);
              setAccessRights({});
              if (mounted) setLoading(false);
              return;
            }
          }
        }

        if (!mounted) return;
        setUser(null);
        setRoles([]);
        setPermissions([]);
        setAccessRights({});

      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [initialData]);

  const login = (userData: UserData) => {
    const roleSlugs = normalizeRolesToSlugs(userData.roles ?? []);
    setUser(userData.user);
    setRoles(roleSlugs);
    setPermissions(userData.permissions ?? []);
    checkAllAccessRights(roleSlugs, userData.permissions ?? []);
  };

  const logout = async () => {
    try {
      await http.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Silent fail
    } finally {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setAccessRights({});
    }
  };

  const clearState = () => {
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
        clearState,
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
