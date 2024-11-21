import { useUser } from "@clerk/nextjs";

export type Role = "superuser" | "admin" | "manager" | "worker" | "external_worker" | "consultant" | "concierge";

export function useRole() {
  const { user } = useUser();
  const role = user?.publicMetadata.role as Role | undefined;
  
  const hasRole = (requiredRole: Role) => {
    const roleHierarchy: Record<Role, number> = {
      superuser: 6,
      admin: 5,
      manager: 4,
      worker: 3,
      external_worker: 2,
      consultant: 1,
      concierge: 0,
    };

    if (!role) return false;
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return { role, hasRole };
} 