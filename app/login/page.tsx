"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/services/Api";
import { fetchProfile } from "@/services/profile/ProfileServices";
import { useRegister } from "@/services/auth/AuthQueries";
import { RegisterPayload } from "@/services/auth/AuthServices";
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  Mail,
  MessageSquare,
  Home,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ─── Feature data ───────────────────────────────────────────────────────────
const features = [
  {
    icon: Building2,
    title: "Property Management",
    desc: "Manage MLS listings, photos & property details in one place.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Users,
    title: "Agent Management",
    desc: "Onboard agents, assign leads, and track performance easily.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Real-time dashboards for traffic, leads, and conversions.",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: FileText,
    title: "Blog & Content",
    desc: "Publish market updates and real estate guides seamlessly.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Mail,
    title: "Newsletter Engine",
    desc: "Automate subscriber campaigns and track open rates.",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: MessageSquare,
    title: "Lead & Inquiries",
    desc: "Centralise all buyer inquiries and contact requests.",
    color: "from-lime-400 to-green-500",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Login() {
  const router = useRouter();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mounted, setMounted] = useState(false);
  const registerMutation = useRegister();

  // Redirect to dashboard if token already exists
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("access_token");
      if (token) {
        router.push("/admin");
      }
    }
  }, [router]);

  // Auto-advance feature carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Login mutation using TanStack Query
  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      try {
        const response = await axiosInstance.post("user/login", payload);
        return response.data;
      } catch (error: any) {
        // Axios error handling
        const message =
          error?.response?.data?.message || error.message || "Login failed";
        throw new Error(message);
      }
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate(formData, {
        onSuccess: async (data) => {
          if (data?.access_token) {
            sessionStorage.setItem("access_token_type", data.token_type);
            sessionStorage.setItem("access_token", data.access_token);
            try {
              const profileData = await fetchProfile();
              const profile = profileData?.data || profileData;

              if (profile?.name) {
                sessionStorage.setItem("user_name", profile.name);
              }
              if (profile?.email) {
                sessionStorage.setItem("user_email", profile.email);
              }
              const profilePic =
                profile?.profile_pic ||
                profile?.profile_picture ||
                profile?.avatar ||
                profile?.image ||
                profile?.photo ||
                profile?.picture;
              if (profilePic) {
                sessionStorage.setItem("user_profile_pic", profilePic);
              }

              if(profile?.uuid) {
                sessionStorage.setItem("user_uuid", profile.uuid);
              }
            } catch (profileError) {
              console.error("Failed to fetch profile:", profileError);
            }

            router.push("/admin");
          } else {
            setErrors((prev) => ({
              ...prev,
              password: "Login failed: No access token received",
            }));
          }
        },
        onError: (error: any) => {
          setErrors((prev) => ({
            ...prev,
            password: error?.message || "Login failed",
          }));
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Register form handlers
  const validateRegisterForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    };

    if (!registerFormData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!registerFormData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerFormData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!registerFormData.phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!registerFormData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (registerFormData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!registerFormData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (registerFormData.password !== registerFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setRegisterErrors(newErrors);
    return isValid;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegisterForm()) {
      try {
        const uuid = process.env.NEXT_PUBLIC_REALTY_PRO_AGENT || "";

        const payload: RegisterPayload = {
          name: registerFormData.name,
          email: registerFormData.email,
          password: registerFormData.password,
          password_confirmation: registerFormData.confirmPassword,
          phone: registerFormData.phone,
          uuid: uuid,
        };

        const response = await registerMutation.mutateAsync(payload);
        console.log("Registration successful:", response);

        // Close modal and show success message
        setShowRegisterModal(false);
        alert("Registration successful! Please login with your credentials.");

        // Clear form
        setRegisterFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        });
      } catch (error: any) {
        console.error("Registration failed:", error);
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          setRegisterErrors((prev) => ({
            ...prev,
            ...apiErrors,
          }));
        } else {
          alert(
            error.response?.data?.message ||
              "Registration failed. Please try again.",
          );
        }
      }
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (registerErrors[name as keyof typeof registerErrors]) {
      setRegisterErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-4deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(16,185,129,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right-fade {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -60px) scale(1.1); }
          66%       { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-50px, 40px) scale(1.15); }
          66%       { transform: translate(35px, -25px) scale(0.85); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
        .animate-float-slow  { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-med   { animation: float-med 4.5s ease-in-out infinite; }
        .animate-pulse-ring  { animation: pulse-ring 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite; }
        .animate-slide-up    { animation: slide-up-fade 0.7s ease forwards; }
        .animate-slide-right { animation: slide-right-fade 0.6s ease forwards; }
        .gradient-animate    {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .feature-card-enter {
          animation: slide-up-fade 0.5s ease forwards;
        }
        .glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .input-focus-ring:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255,255,255,0.2);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .btn-shine:hover::after {
          left: 130%;
        }
      `}</style>

      <main className="min-h-screen flex overflow-hidden">
        {/* ── LEFT: Feature Showcase ──────────────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between overflow-hidden"
          style={{ background: "linear-gradient(135deg, #071c1b 0%, #0a2a29 40%, #0d3530 70%, #0f3d38 100%)" }}
        >
          {/* Animated background orbs */}
          <div
            className="absolute rounded-full opacity-20 pointer-events-none"
            style={{
              width: 520,
              height: 520,
              background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
              top: "-120px",
              left: "-100px",
              animation: "orb1 18s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-15 pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
              bottom: "60px",
              right: "-80px",
              animation: "orb2 22s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-10 pointer-events-none"
            style={{
              width: 280,
              height: 280,
              background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
              top: "45%",
              left: "55%",
              animation: "orb1 14s ease-in-out infinite reverse",
            }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm40 0v1H0V0h40zM0 20h40v1H0v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Top logo area */}
          <div className="relative z-10 p-10 pb-0">
            <div className="flex items-center gap-3 animate-slide-right">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-ring"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
              >
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">RealtiPro</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}
              >
                Admin
              </span>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 px-10 py-8">
            <div style={{ animationDelay: "0.1s" }} className="animate-slide-up opacity-0" >
              <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Real Estate Command Center
              </p>
            </div>
            <h1
              className="text-white font-bold leading-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                animationDelay: "0.2s",
              }}
            >
              <span
                className="animate-slide-up opacity-0 block"
                style={{ animationDelay: "0.2s" }}
              >
                Everything you need
              </span>
              <span
                className="block animate-slide-up opacity-0"
                style={{
                  animationDelay: "0.35s",
                  background: "linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                to close more deals.
              </span>
            </h1>
            <p
              className="text-slate-400 text-base leading-relaxed max-w-md animate-slide-up opacity-0"
              style={{ animationDelay: "0.45s" }}
            >
              The all-in-one admin dashboard built for modern real estate teams — listings, leads, analytics, and more.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="relative z-10 px-10 flex-1 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                const isActive = activeFeature === i;
                return (
                  <button
                    key={f.title}
                    onClick={() => setActiveFeature(i)}
                    className={`glass rounded-2xl p-4 text-left transition-all duration-500 cursor-pointer group ${
                      isActive
                        ? "border-emerald-500/40 bg-white/10 scale-[1.02]"
                        : "hover:border-white/20 hover:bg-white/08"
                    }`}
                    style={{
                      animationDelay: `${0.5 + i * 0.08}s`,
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${f.color} transition-all duration-300 ${
                        isActive ? "scale-110 shadow-lg" : "group-hover:scale-105"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <p className={`text-sm font-semibold mb-1 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                      {f.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-snug group-hover:text-slate-400 transition-colors duration-300">
                      {f.desc}
                    </p>
                    {isActive && (
                      <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT: Login Form ────────────────────────────────────────────── */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center bg-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle, #10b981, transparent 70%)", transform: "translate(30%,-30%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", transform: "translate(-30%,30%)" }}
          />

          <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-12">
            {/* Logo */}
            <div className="mb-10 animate-slide-up opacity-0" style={{ animationDelay: "0.05s" }}>
              <Link href="/" className="inline-flex items-center gap-2 group">
                <Image
                  src="/images/realtipro-logo.png"
                  alt="RealtiPro Logo"
                  width={160}
                  height={54}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2
                className="text-2xl font-bold text-gray-900 mb-1 animate-slide-up opacity-0"
                style={{ animationDelay: "0.12s" }}
              >
                Welcome back 👋
              </h2>
              <p
                className="text-sm text-gray-500 animate-slide-up opacity-0"
                style={{ animationDelay: "0.2s" }}
              >
                Sign in to your admin dashboard
              </p>
            </div>

            {/* Login form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div
                className="animate-slide-up opacity-0"
                style={{ animationDelay: "0.28s" }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input-focus-ring w-full rounded-xl border px-4 py-3 text-sm text-dark transition-all duration-200 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 focus:bg-white"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div
                className="animate-slide-up opacity-0"
                style={{ animationDelay: "0.35s" }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-focus-ring w-full rounded-xl border px-4 py-3 pr-11 text-sm text-dark transition-all duration-200 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 focus:bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me / Forgot */}
              <div
                className="flex items-center justify-between animate-slide-up opacity-0"
                style={{ animationDelay: "0.42s" }}
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-emerald-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <div
                className="animate-slide-up opacity-0"
                style={{ animationDelay: "0.5s" }}
              >
                <button
                  type="submit"
                  disabled={loginMutation.status === "pending"}
                  className="btn-shine w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    background: loginMutation.isPending
                      ? "#6b7280"
                      : "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                  }}
                >
                  {loginMutation.isPending ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {loginMutation.isError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 text-center">
                    {(loginMutation.error as Error)?.message}
                  </div>
                )}
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8 relative animate-slide-up opacity-0" style={{ animationDelay: "0.58s" }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 tracking-wide">
                  SECURED ADMIN ACCESS
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div
              className="mt-6 flex items-center justify-center gap-6 animate-slide-up opacity-0"
              style={{ animationDelay: "0.65s" }}
            >
              {[
                { icon: "🔒", text: "SSL Encrypted" },
                { icon: "🛡️", text: "2FA Ready" },
                { icon: "⚡", text: "99.9% Uptime" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Register Modal ─────────────────────────────────────────────────── */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Create an account
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-dark"
              >
                Full name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                required
                value={registerFormData.name}
                onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${
                  registerErrors.name ? "border-red-500" : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {registerErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-dark"
              >
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                value={registerFormData.email}
                onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${
                  registerErrors.email ? "border-red-500" : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {registerErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-phone"
                className="block text-sm font-medium text-dark"
              >
                Phone number
              </label>
              <input
                id="register-phone"
                name="phone"
                type="tel"
                required
                value={registerFormData.phone}
                onChange={handleRegisterChange}
                placeholder="10-digit phone number"
                className={`mt-1 block w-full rounded-lg border ${
                  registerErrors.phone ? "border-red-500" : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {registerErrors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-dark"
              >
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                required
                value={registerFormData.password}
                onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${
                  registerErrors.password ? "border-red-500" : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {registerErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-confirmPassword"
                className="block text-sm font-medium text-dark"
              >
                Confirm password
              </label>
              <input
                id="register-confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={registerFormData.confirmPassword}
                onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${
                  registerErrors.confirmPassword
                    ? "border-red-500"
                    : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {registerErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex justify-center py-3 px-4 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {registerMutation.isPending
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
