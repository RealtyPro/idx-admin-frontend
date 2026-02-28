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
  EnvelopeIcon,
  MapPinIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useLogout } from "@/services/auth/AuthQueries";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Squares2X2Icon },
  { name: "Listings", href: "/admin/listings", icon: HomeIcon },
  { name: "Users & Leads", href: "/admin/users", icon: UsersIcon },
  { name: "Enquiries", href: "/admin/inquiries", icon: EnvelopeIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: DocumentTextIcon },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Newsletter", href: "/admin/newsletter", icon: DocumentTextIcon },
  { name: "Neighborhoods", href: "/admin/neighbourhoods", icon: MapPinIcon },
];

export default function adminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userInitials, setUserInitials] = useState("JD");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("access_token");
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
    } catch {
      // continue to clear session
    } finally {
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
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Sidebar – dark navy */}
      <div className="fixed inset-y-0 left-0 w-[220px] bg-[#1B2537] z-30 flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-5 py-6">
          <Image
            src="/images/realtipro-logo.png"
            alt="RealtiPro"
            width={160}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg hover:bg-white/5 px-2 py-2 transition-colors"
            >
              <div className="flex-shrink-0 relative">
                {userProfilePic ? (
                  <>
                    <img
                      src={userProfilePic}
                      alt={userName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400/30"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <div
                      className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center absolute inset-0"
                      style={{ display: "none" }}
                    >
                      <span className="text-emerald-400 font-medium text-xs">
                        {userInitials}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-medium text-xs">
                      {userInitials}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </Link>
            <button
              className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Main Content */}
      <div className="pl-[220px]">
        <main className="py-6">{children}</main>
      </div>
    </div>
  );
}
