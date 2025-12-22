import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { getAdminRole, getUserPermissions } from "@/lib/admin/permissions";

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default async function AdminRootLayout({ children }: AdminRootLayoutProps) {
  // 1. Check authentication
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  // 2. Check admin role
  const role = await getAdminRole(clerkUserId);
  if (!role) {
    // User is not an admin, redirect to home
    redirect("/?error=unauthorized");
  }

  // 3. Get user permissions
  const permissions = await getUserPermissions(clerkUserId);

  // 4. Render admin layout with user's role and permissions
  return (
    <AdminLayout role={role} permissions={permissions}>
      {children}
    </AdminLayout>
  );
}
