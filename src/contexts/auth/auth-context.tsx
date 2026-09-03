import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { adaptMe, adaptRefresh } from "@framework/utils/adapt";
import {
  getToken,
  hasSessionHint,
  setAccessToken,
} from "@framework/utils/get-token";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  pricing_tier?: string | null;
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
    requiredPermissions?: string[],
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
  console.log("[Auth] Role normalization:", {
    input: roles,
    output: normalized,
  });

  return normalized;
};

export const AuthProvider = ({ children, initialData }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialData?.user || null);
  const [roles, setRoles] = useState<string[]>(
    initialData?.roles ? normalizeRolesToSlugs(initialData.roles) : [],
  );
  const [permissions, setPermissions] = useState<string[]>(
    initialData?.permissions || [],
  );
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [accessRights, setAccessRights] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<number | null>(user?.id ?? null);

  // Giá product/cart là auth-gated (BE null-hoá cho guest). Query có thể đã bắn
  // TRƯỚC khi phiên sẵn sàng (access cookie hết hạn → BE lặng lẽ trả giá guest,
  // không 401 nên interceptor không refresh) → cache giữ giá 0 tới hết staleTime.
  // Mỗi lần user đổi (init /me xong, login, logout) → invalidate để refetch với
  // token hiện tại. So sánh prev/current id để không refetch thừa mỗi render.
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (prevUserIdRef.current === currentId) return;
    prevUserIdRef.current = currentId;
    queryClient.invalidateQueries({
      predicate: (query) => {
        const root = query.queryKey[0];
        return (
          typeof root === "string" &&
          (root.startsWith("/api/v1/products") || root.startsWith("/api/v1/cart"))
        );
      },
    });
  }, [user?.id, queryClient]);

  const setAccessRight = (
    key: string,
    requiredRoles: string[] = [],
    requiredPermissions: string[] = [],
    checkRoles: string[] = roles,
    checkPermissions: string[] = permissions,
  ) => {
    const requiredRoleSlugs = requiredRoles.map(toSlug);
    const hasRole = requiredRoleSlugs.some(
      (role) => checkRoles?.includes(role) ?? false,
    );
    const hasPermission = requiredPermissions.some(
      (perm) => checkPermissions?.includes(perm) ?? false,
    );

    setAccessRights((prev) => ({ ...prev, [key]: hasRole || hasPermission }));
  };

  const checkAllAccessRights = (
    checkRoles: string[],
    checkPermissions: string[],
    pricingTier?: string | null,
  ) => {
    // BE gate giá wholesale = users.pricing_tier ∈ {user, admin}
    // (BaseApiController::canViewWholesalePrice) — khách storefront KHÔNG có
    // Spatie role nên phải check tier trước; role staff giữ làm fallback.
    const wholesaleTiers = ["user", "admin"];
    const tierAllowed = wholesaleTiers.includes(toSlug(pricingTier));

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
    const roleAllowed = wholesaleRoles
      .map(toSlug)
      .some((role) => checkRoles?.includes(role) ?? false);

    setAccessRights((prev) => ({
      ...prev,
      canWholeSalePrice: tierAllowed || roleAllowed,
    }));
    setAccessRight(
      "canEdit",
      ["admin"],
      ["edit"],
      checkRoles,
      checkPermissions,
    );
  };

  useEffect(() => {
    if (initialData) {
      const r = normalizeRolesToSlugs(initialData.roles ?? []);
      setRoles(r);
      checkAllAccessRights(
        r,
        initialData.permissions ?? [],
        initialData.user?.pricing_tier,
      );
      setLoading(false);
      return;
    }

    let mounted = true;
    const abortController = new AbortController();

    const initializeAuth = async () => {
      if (!mounted) return;

      // Khách vãng lai thật (không token trong bộ nhớ VÀ không cờ phiên) → bỏ
      // probe ME, tránh 401 noise.
      //
      // Vế thứ hai KHÔNG còn là `getRefreshToken()`: cookie đó chưa bao giờ được
      // ghi nên điều kiện luôn đúng, và với token nay nằm trong bộ nhớ thì mọi
      // lần reload đều rơi vào đây ⇒ người đang đăng nhập bị coi là khách. Cờ
      // phiên là thứ duy nhất sống qua reload mà JS đọc được.
      if (!getToken() && !hasSessionHint()) {
        setUser(null);
        setRoles([]);
        setPermissions([]);
        setAccessRights({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await http.get(API_ENDPOINTS.ME, {
          signal: abortController.signal,
        });

        if (!mounted) return;

        const data = adaptMe(res.data) as UserData;
        const roleSlugs = normalizeRolesToSlugs(data.roles ?? []);
        setUser(data.user ?? null);
        setRoles(roleSlugs);
        setPermissions(data.permissions ?? []);
        checkAllAccessRights(
          roleSlugs,
          data.permissions ?? [],
          data.user?.pricing_tier,
        );
      } catch (error: any) {
        if (error.name === "AbortError" || error.name === "CanceledError") {
          return;
        }

        if (!mounted) return;

        const status = error.response?.status;

        if (status === 401 || status === 419) {
          try {
            const refreshRes = await http.post(
              API_ENDPOINTS.REFRESH_TOKEN,
              {},
              {
                signal: abortController.signal,
                withCredentials: true,
              },
            );
            const { access_token, remember } = adaptRefresh(refreshRes?.data);
            if (access_token && typeof window !== "undefined") {
              // Qua helper chung, KHÔNG `Cookies.set` trần: tên cookie + thuộc
              // tính bảo mật chỉ được khai một chỗ (`get-token.ts`). Bản cũ chép
              // lại y hệt bốn dòng đó — hôm nay giá trị còn trùng, nhưng đây
              // đúng là kiểu bản-sao-thứ-hai rồi trôi lệch mà không ai thấy.
              setAccessToken(access_token, remember);
            }

            if (!mounted) return;

            const meRes = await http.get(API_ENDPOINTS.ME, {
              signal: abortController.signal,
            });

            if (!mounted) return;

            const data = adaptMe(meRes.data) as UserData;
            const roleSlugs = normalizeRolesToSlugs(data.roles ?? []);
            setUser(data.user ?? null);
            setRoles(roleSlugs);
            setPermissions(data.permissions ?? []);
            checkAllAccessRights(
              roleSlugs,
              data.permissions ?? [],
              data.user?.pricing_tier,
            );

            if (mounted) setLoading(false);
            return;
          } catch (refreshError: any) {
            if (
              refreshError.name === "AbortError" ||
              refreshError.name === "CanceledError"
            ) {
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
    checkAllAccessRights(
      roleSlugs,
      userData.permissions ?? [],
      userData.user?.pricing_tier,
    );
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

/**
 * Mảnh khoá định danh cho `queryKey` của MỌI query mang GIÁ.
 * `null` = khách vãng lai (cũng là giá trị SSR luôn dùng).
 *
 * Vì sao cần: giá chỉ trả cho người đã đăng nhập (BE `canViewAnyPrice`), còn SSR
 * cố ý chạy KHÔNG token nên dữ liệu `dehydrate()` gửi kèm HTML luôn là bản
 * không-giá. Dùng chung queryKey với SSR thì bản không-giá đó nằm trong cache và
 * `staleTime` giữ nó lại — người đã đăng nhập nhìn trang không có giá mà **không
 * request nào lỗi** để retry. Có mảnh khoá này thì lúc phiên khôi phục xong khoá
 * đổi ⇒ fetch lại ⇒ giá hiện ra, còn bản SSR vẫn phục vụ ngay lần paint đầu nên
 * không mất SSR cho nội dung/SEO.
 *
 * ⚠ `staleTime: 0` + `refetchOnMount` KHÔNG thay được nó: hai thứ đó chỉ bắn một
 * lần lúc mount, mà lúc mount phiên thường chưa khôi phục xong (token nằm trong
 * bộ nhớ) ⇒ lấy về bản không-giá rồi nằm lì. Triệu chứng thật 2026-09-03: 8 sản
 * phẩm đầu kẹt "Loading price…", từ sản phẩm thứ 9 (trang 2, fetch lúc cuộn) mới
 * có giá.
 *
 * Dùng `user?.id` chứ không phải cờ boolean — nó còn tách cache giữa hai người
 * khác nhau, nên giá theo tier của người này không bị phục vụ cho người kia sau
 * một lượt đăng xuất/đăng nhập trong cùng phiên trình duyệt. Idiom lấy từ
 * `useNewArrivalProductsQuery`, giữ MỘT cách duy nhất trong repo.
 *
 * KHÔNG ném khi đứng ngoài provider — đây chỉ là gợi ý cache; thiếu provider thì
 * câu trả lời đúng là "coi như khách", không phải làm vỡ trang.
 */
export const usePriceAudienceKey = (): number | string | null => {
  const ctx = useContext(AuthContext);

  return ctx?.user?.id ?? null;
};
