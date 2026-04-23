"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HomeModernIcon,
  StarIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  NewspaperIcon,
  InboxArrowDownIcon,
  MapIcon,
  RectangleGroupIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useLogout } from "@/services/auth/AuthQueries";
import { useTheme } from "@/app/provider/ThemeProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: RectangleGroupIcon },
  { name: "Listings", href: "/admin/listings", icon: HomeModernIcon },
  { name: "Users & Leads", href: "/admin/inquiries", icon: UsersIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: NewspaperIcon },
  { name: "Testimonials", href: "/admin/testimonials", icon: StarIcon },
  { name: "Newsletter", href: "/admin/newsletter", icon: InboxArrowDownIcon },
  { name: "Neighborhoods", href: "/admin/neighbourhoods", icon: MapIcon },
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
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const sidebarW = collapsed ? 56 : 240;

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
    <div className="min-h-screen admin-page-bg bg-[#F5F6FA]">
      {/* Expand / collapse toggle — outside sidebar so it's never clipped */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed z-40 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: sidebarW - 22,
          width: 44,
          height: 44,
          background: "linear-gradient(135deg, #8dc572, #6aad52)",
          border: "3px solid #fff",
          boxShadow: "0 4px 16px rgba(141,197,114,0.5)",
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRightIcon className="w-6 h-6 text-white" />
          : <ChevronLeftIcon className="w-6 h-6 text-white" />
        }
      </button>

      {/* Theme toggle — fixed to right edge of screen */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed z-50 right-5 top-5 flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-110 shadow-lg"
        style={{
          width: 44,
          height: 44,
          background: isDark ? "rgba(141,197,114,0.18)" : "#ffffff",
          border: "2px solid rgba(141,197,114,0.45)",
          boxShadow: isDark
            ? "0 4px 16px rgba(141,197,114,0.25)"
            : "0 4px 16px rgba(141,197,114,0.20)",
        }}
      >
        {isDark
          ? <SunIcon className="w-5 h-5" style={{ color: "#8dc572" }} />
          : <MoonIcon className="w-5 h-5" style={{ color: "#6aad52" }} />
        }
      </button>

      {/* Sidebar */}
      <div
        className="fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300"
        style={{
          width: `${sidebarW}px`,
          background: isDark
            ? "linear-gradient(170deg, #071c1b 0%, #0a2a29 40%, #0d3530 75%, #0f3d38 100%)"
            : "#ffffff",
          boxShadow: "none",
          borderRight: isDark
            ? "2.5px solid rgba(141,197,114,0.25)"
            : "2.5px solid rgba(141,197,114,0.35)",
        }}
      >
        {/* Ambient blobs */}
        <div
          className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(141,197,114,0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-24 -right-8 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(141,197,114,0.06) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className={`relative z-10 flex items-center justify-center px-4 pt-6 pb-5`}>
          {collapsed ? (
            <Image
              src={isDark ? "/images/ria-fordark.png" : "/images/ria-forlight.png"}
              alt="RIA"
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
          ) : (
            <Image
              src="/images/forlightbg-logo.png"
              alt="RealtiPro"
              width={160}
              height={48}
              className={`h-10 w-auto ${isDark ? "brightness-0 invert opacity-90" : ""}`}
            />
          )}
        </div>





        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-2 pt-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center ${collapsed ? "justify-center px-2" : "gap-3.5 px-3"} py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? (isDark ? "text-white" : "text-slate-900")
                    : (isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800")
                }`}
              >
                {/* Active pill background */}
                {isActive && (
                  <span
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, rgba(141,197,114,0.18) 0%, rgba(141,197,114,0.07) 100%)",
                      borderLeft: collapsed ? "none" : "3px solid #8dc572",
                      borderRadius: collapsed ? "12px" : "0 12px 12px 0",
                    }}
                  />
                )}
                {/* Hover background */}
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-xl transition-colors duration-200"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(141,197,114,0.12)" : "rgba(141,197,114,0.09)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  />
                )}
                <item.icon
                  className={`relative z-10 w-[22px] h-[22px] shrink-0 transition-colors ${
                    isActive ? "" : "text-slate-400 group-hover:text-[#8dc572]"
                  }`}
                  style={isActive ? { color: "#8dc572" } : {}}
                />
                {!collapsed && <span className="relative z-10">{item.name}</span>}
                {!collapsed && isActive && (
                  <span
                    className="relative z-10 ml-auto w-2 h-2 rounded-full shrink-0"
                    style={{ background: "#8dc572" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Card ── */}
        <div className={`relative z-10 p-3 pb-4 ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {collapsed ? (
            /* Collapsed: icon-only avatars */
            <>
              <Link
                href="/admin/profile"
                title={userName}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-md overflow-hidden relative shrink-0 transition-transform hover:scale-110"
                style={{ background: "linear-gradient(135deg, #8dc572, #6aad52)", borderColor: "#fff" }}
              >
                <span className="font-bold text-sm text-white select-none">{userInitials}</span>
                {userProfilePic && (
                  <img
                    src={userProfilePic}
                    alt={userName}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </Link>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                title="Sign Out"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-slate-400 hover:text-red-500" />
              </button>
            </>
          ) : (
            /* Expanded: full green card */
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #5e9045 0%, #4a7535 50%, #3d6229 100%)",
                boxShadow: isDark
                  ? "0 10px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)"
                  : "0 10px 32px rgba(61,98,41,0.45), 0 3px 10px rgba(61,98,41,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {/* Subtle top shine */}
              <div
                className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              {/* Top-right glow orb */}
              <div
                className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }}
              />
              {/* Bottom-left depth shadow */}
              <div
                className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(0,0,0,0.18) 0%, transparent 70%)" }}
              />

              {/* Profile link */}
              <Link
                href="/admin/profile"
                className="relative flex items-center gap-3 px-4 pt-4 pb-3 group"
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-2xl relative overflow-hidden flex items-center justify-center border-2 shadow-lg"
                  style={{ borderColor: "rgba(255,255,255,0.40)", background: "rgba(255,255,255,0.18)" }}
                >
                  <span className="font-bold text-sm text-white select-none">{userInitials}</span>
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
                  <p className="text-[14px] font-bold text-white truncate group-hover:text-white/90 transition-colors drop-shadow-sm">{userName}</p>
                  <p className="text-[11px] text-white/80 truncate">{userEmail}</p>
                </div>
                <UserCircleIcon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors shrink-0" />
              </Link>

              {/* Divider */}
              <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.18)" }} />

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="relative w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-white/85 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
                type="button"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <ArrowLeftOnRectangleIcon className="w-[18px] h-[18px] shrink-0 text-white/50 group-hover:text-white transition-colors" />
                {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="transition-all duration-300" style={{ paddingLeft: `${sidebarW}px` }}>
        <main className="py-4">{children}</main>
      </div>
    </div>
  );
}
