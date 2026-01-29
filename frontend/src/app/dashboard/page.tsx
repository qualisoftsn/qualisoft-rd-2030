"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    switch (user.U_Role) {
      case 'SUPER_ADMIN':
        router.push("/admin/super-dashboard"); // Matrix des Tenants
        break;
      case 'ADMIN_RQ':
        router.push("/dashboard/smi-global"); // Pilotage 360° du SMI
        break;
      case 'PILOTE':
        router.push(`/dashboard/processus/cockpit/${user.assignedProcessId}`); // Tunneling
        break;
      case 'AUDITEUR':
        router.push("/dashboard/audit-center"); // Planning & Rapports
        break;
      case 'OBSERVATEUR':
        router.push("/dashboard/consultation"); // Vue Read-only
        break;
      default:
        router.push("/dashboard/my-tasks"); // Vue "User" standard
    }
  }, [user, router]);

  return <div className="h-screen bg-[#0B0F1A] animate-pulse" />;
}