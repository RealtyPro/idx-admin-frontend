"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useLogout } from "@/services/auth/AuthQueries";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Listings", href: "/admin/listings", icon: DocumentTextIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Enquiries", href: "/admin/inquiries", icon: EnvelopeIcon },
  { name: "Blog", href: "/admin/blog", icon: DocumentTextIcon },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Newsletter", href: "/admin/newsletter", icon: DocumentTextIcon },
  // { name: "Pages", href: "/admin/pages", icon: DocumentTextIcon },
  { name: "Neighborhoods", href: "/admin/neighbourhoods", icon: MapPinIcon },
];

export default function adminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const logoutMutation = useLogout();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userInitials, setUserInitials] = useState("JD");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  useEffect(() => {
    // Check for authentication and load user data from sessionStorage
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("access_token");

      // Redirect to login if no token exists
      if (!token) {
        router.push("/login");
        return;
      }

      const name = sessionStorage.getItem("user_name") || "User";
      const email = sessionStorage.getItem("user_email") || "user@example.com";
      const profilePic = sessionStorage.getItem("user_profile_pic");

      setUserName(name);
      setUserEmail(email);
      setUserProfilePic(profilePic);

      // Generate initials from name
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      setUserInitials(initials || "JD");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Clear sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token_type");
        sessionStorage.removeItem("user_name");
        sessionStorage.removeItem("user_email");
        sessionStorage.removeItem("user_profile_pic");
      }
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      // Even if logout API fails, clear local storage and redirect
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token_type");
        sessionStorage.removeItem("user_name");
        sessionStorage.removeItem("user_email");
        sessionStorage.removeItem("user_profile_pic");
      }
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transition-all duration-300 bg-white border-r border-gray-200 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Button */}
          <div
            className={`flex items-center gap-2 p-6 ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? (
              <Image
                src="/images/ailogo.png"
                alt="RealtiPro Logo"
                width={40}
                height={40}
                className="w-10 h-auto"
              />
            ) : (
              <Image
                src="/images/realtipro-logo.png"
                alt="RealtiPro Logo"
                width={140}
                height={46}
                className="h-10 w-auto"
              />
            )}
            <button
              className={`ml-auto p-1 rounded-lg hover:bg-gray-100 transition ${collapsed ? "ml-0" : "ml-4"}`}
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              type="button"
            >
              {collapsed ? (
                <ChevronRightIcon className="w-5 h-5 text-dark-secondary" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 text-dark-secondary" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-dark-secondary hover:bg-gray-50"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div
            className={`p-4 border-t border-gray-200 ${collapsed ? "px-2" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Link
                href="/admin/profile"
                className={`flex items-center rounded-lg hover:bg-gray-50 transition-colors ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2 flex-1"}`}
                title={collapsed ? "Profile" : undefined}
              >
                <div className="flex-shrink-0 relative">
                  {userProfilePic ? (
                    <>
                      <img
                        src={userProfilePic}
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Hide image and show fallback
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center absolute inset-0"
                        style={{ display: "none" }}
                      >
                        <span className="text-primary font-medium text-xs">
                          {userInitials}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium text-xs">
                        {userInitials}
                      </span>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div
                    className="flex-1 min-w-0"
                    style={{ paddingLeft: "10px" }}
                  >
                    <p className="text-sm font-medium text-dark truncate">
                      {userName}
                    </p>
                    <p
                      className="text-dark-secondary truncate"
                      style={{ fontSize: "9px" }}
                    >
                      {userEmail}
                    </p>
                  </div>
                )}
              </Link>
              <button
                className="flex-shrink-0 p-2 rounded-lg text-dark-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                aria-label="Logout"
                type="button"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={collapsed ? "pl-20" : "pl-64"}>
        <main className="py-6">{children}</main>
      </div>
    </div>
  );
}
