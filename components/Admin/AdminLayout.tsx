"use client";

import {
  Activity,
  BarChart3,
  Flag,
  Home,
  MapPin,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import type { AdminRoleType } from "@/drizzle/schema/admin-roles";
import { PERMISSIONS } from "@/drizzle/schema/permissions";

interface AdminLayoutProps {
  children: ReactNode;
  role: AdminRoleType;
  permissions: string[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: Home,
    permission: PERMISSIONS.VIEW_ANALYTICS, // Everyone can view dashboard
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    permission: PERMISSIONS.VIEW_USERS,
  },
  {
    href: "/admin/teams",
    label: "Teams",
    icon: Shield,
    permission: PERMISSIONS.VIEW_TEAMS,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: Flag,
    permission: PERMISSIONS.VIEW_REPORTS,
  },
  {
    href: "/admin/centers",
    label: "Centers",
    icon: MapPin,
    permission: PERMISSIONS.VIEW_CENTERS,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: Activity,
    permission: PERMISSIONS.VIEW_AUDIT_LOGS,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    permission: PERMISSIONS.MANAGE_ADMINS,
  },
];

export function AdminLayout({ children, role, permissions }: AdminLayoutProps) {
  const pathname = usePathname();

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter((item) => {
    // Super admin sees everything
    if (permissions.includes("*")) return true;
    // Otherwise check specific permission
    return permissions.includes(item.permission);
  });

  const getRoleBadgeColor = (adminRole: AdminRoleType) => {
    switch (adminRole) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "content_reviewer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "support":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getRoleLabel = (adminRole: AdminRoleType) => {
    switch (adminRole) {
      case "super_admin":
        return "Super Admin";
      case "moderator":
        return "Moderator";
      case "content_reviewer":
        return "Content Reviewer";
      case "support":
        return "Support";
      default:
        return adminRole;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</span>
            </Link>
            <div className="mt-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleLabel(role)}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to TeamFinder
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-(--breakpoint-2xl) p-8">{children}</div>
      </main>
    </div>
  );
}
