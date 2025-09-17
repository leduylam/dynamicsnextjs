import { useAuth } from "@contexts/auth/auth-context";

export const useCheckAccess = (
  requiredRoles: string[] = [],
  requiredPermissions: string[] = []
) => {
  const { roles = [], permissions = [] } = useAuth() ?? {};
  const hasRole = requiredRoles.some((role) => roles?.includes(role) ?? false);
  const hasPermission = requiredPermissions.some(
    (perm) => permissions?.includes(perm) ?? false
  );
  return hasRole || hasPermission;
};
