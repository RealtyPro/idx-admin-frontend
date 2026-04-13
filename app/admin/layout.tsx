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
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { useLogout } from "@/services/auth/AuthQueries";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Squares2X2Icon },
  { name: "Listings", href: "/admin/listings", icon: HomeIcon },
  // { name: "Users & Leads", href: "/admin/users", icon: UsersIcon },
  { name: "Users & Leads", href: "/admin/inquiries", icon: EnvelopeIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: DocumentTextIcon },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Newsletter", href: "/admin/newsletter", icon: DocumentTextIcon },
  { name: "Neighborhoods", href: "/admin/neighbourhoods", icon: MapPinIcon },
  { name: "Open Houses", href: "/admin/open-houses", icon: CalendarDaysIcon },
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
      {/* Sidebar */}
      <div
        className="fixed inset-y-0 left-0 w-[230px] z-30 flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, #071c1b 0%, #0a2a29 45%, #0d3530 75%, #0f3d38 100%)" }}
      >
        {/* Ambient orbs */}
        <div
          className="absolute -top-20 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-20 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm40 0v1H0V0h40zM0 20h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 px-5 pt-6 pb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            <HomeIcon className="w-4 h-4 text-white" />
          </div>
          <Image
            src="/images/forlightbg-logo.png"
            alt="RealtiPro"
            width={110}
            height={32}
            className="h-6 w-auto brightness-0 invert opacity-90"
          />
        </div>

        {/* Section label */}
        <div className="relative z-10 px-5 mb-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-500/70">
            Main Menu
          </span>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {/* Active pill background */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))", borderLeft: "2px solid #10b981" }}
                  />
                )}
                {/* Hover background */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                )}
                <item.icon
                  className={`relative z-10 w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="relative z-10 mx-4 my-2 h-px bg-white/8" />

        {/* User Section */}
        <div className="relative z-10 p-3">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-3 mb-2 transition-all duration-200 group"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full relative overflow-hidden flex items-center justify-center border-2 border-emerald-400/40"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))" }}
            >
              <span className="text-emerald-300 font-semibold text-xs select-none">{userInitials}</span>
              {userProfilePic && (
                <img
                  src={userProfilePic}
                  alt={userName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
            </div>
          </Link>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-red-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            type="button"
          >
            <ArrowLeftOnRectangleIcon className="w-[18px] h-[18px] shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
            {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-[230px]">
        <main className="py-6">{children}</main>
      </div>
    </div>
  );
}
