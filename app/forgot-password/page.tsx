"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword, RegisterPayload } from "@/services/auth/AuthServices";
import { useRegister } from '@/services/auth/AuthQueries';
import {
  Mail,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
} from "lucide-react";

// ─── Steps data ─────────────────────────────────────────────────────────────
const steps = [
  {
    icon: Mail,
    title: "Enter your email",
    desc: "Provide the email address linked to your admin account.",
    color: "from-emerald-400 to-teal-500",
    step: "01",
  },
  {
    icon: ShieldCheck,
    title: "Check your inbox",
    desc: "We'll send a secure password reset link within seconds.",
    color: "from-cyan-400 to-blue-500",
    step: "02",
  },
  {
    icon: KeyRound,
    title: "Set a new password",
    desc: "Click the link and choose a strong new password.",
    color: "from-violet-400 to-purple-500",
    step: "03",
  },
  {
    icon: RefreshCw,
    title: "Back in control",
    desc: "Sign in with your new credentials and resume work.",
    color: "from-amber-400 to-orange-500",
    step: "04",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const registerMutation = useRegister();

  // Auto-advance step highlight
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Register form state
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [registerErrors, setRegisterErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Forgot password mutation using TanStack Query
  const forgotPasswordMutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      try {
        const response = await forgotPassword(payload);
        return response;
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error.message ||
          "Failed to send reset email";
        throw new Error(message);
      }
    },
  });

  const validateEmail = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (validateEmail()) {
      forgotPasswordMutation.mutate(
        { email },
        {
          onSuccess: (data) => {
            setSuccessMessage(
              data?.message ||
                "Password reset link has been sent to your email. Please check your inbox."
            );
            setEmail("");
            // Optional: Redirect to login after a few seconds
            setTimeout(() => {
              router.push("/login");
            }, 5000);
          },
          onError: (error: any) => {
            setError(error?.message || "Failed to send reset email");
          },
        }
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  // Register form handlers
  const validateRegisterForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    };

    if (!registerFormData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!registerFormData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerFormData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!registerFormData.phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!registerFormData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (registerFormData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!registerFormData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (registerFormData.password !== registerFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setRegisterErrors(newErrors);
    return isValid;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateRegisterForm()) {
      try {
        const uuid = process.env.NEXT_PUBLIC_REALTY_PRO_AGENT || '';
        
        const payload: RegisterPayload = {
          name: registerFormData.name,
          email: registerFormData.email,
          password: registerFormData.password,
          password_confirmation: registerFormData.confirmPassword,
          phone: registerFormData.phone,
          uuid: uuid,
        };

        const response = await registerMutation.mutateAsync(payload);
        console.log('Registration successful:', response);
        
        // Close modal and show success message
        setShowRegisterModal(false);
        alert('Registration successful! Please check your email or login.');
        
        // Clear form
        setRegisterFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
        });

        // Redirect to login
        router.push('/login');
      } catch (error: any) {
        console.error('Registration failed:', error);
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          setRegisterErrors(prev => ({
            ...prev,
            ...apiErrors,
          }));
        } else {
          alert(error.response?.data?.message || 'Registration failed. Please try again.');
        }
      }
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (registerErrors[name as keyof typeof registerErrors]) {
      setRegisterErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <>
      <style>{`
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right-fade {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
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
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
          70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(16,185,129,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes envelope-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          20%       { transform: rotate(-6deg) scale(1.05); }
          40%       { transform: rotate(6deg) scale(1.05); }
          60%       { transform: rotate(-3deg) scale(1.02); }
          80%       { transform: rotate(3deg) scale(1.02); }
        }
        @keyframes success-pop {
          0%   { opacity: 0; transform: scale(0.8) translateY(10px); }
          60%  { transform: scale(1.05) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-slide-up    { animation: slide-up-fade 0.7s ease forwards; }
        .animate-slide-right { animation: slide-right-fade 0.6s ease forwards; }
        .animate-pulse-ring  { animation: pulse-ring 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite; }
        .animate-envelope    { animation: envelope-shake 3s ease-in-out infinite; }
        .animate-success-pop { animation: success-pop 0.5s ease forwards; }
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
        .btn-shine:hover::after { left: 130%; }
      `}</style>

      <main className="min-h-screen flex overflow-hidden">
        {/* ── LEFT: How-it-works panel ──────────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between overflow-hidden"
          style={{ background: "linear-gradient(135deg, #071c1b 0%, #0a2a29 40%, #0d3530 70%, #0f3d38 100%)" }}
        >
          {/* Orbs */}
          <div className="absolute rounded-full opacity-20 pointer-events-none" style={{ width: 520, height: 520, background: "radial-gradient(circle, #10b981 0%, transparent 70%)", top: "-120px", left: "-100px", animation: "orb1 18s ease-in-out infinite" }} />
          <div className="absolute rounded-full opacity-15 pointer-events-none" style={{ width: 400, height: 400, background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", bottom: "60px", right: "-80px", animation: "orb2 22s ease-in-out infinite" }} />
          <div className="absolute rounded-full opacity-10 pointer-events-none" style={{ width: 280, height: 280, background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", top: "45%", left: "55%", animation: "orb1 14s ease-in-out infinite reverse" }} />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm40 0v1H0V0h40zM0 20h40v1H0v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

          {/* Logo */}
          <div className="relative z-10 p-10 pb-0">
            <div className="flex items-center gap-3 animate-slide-right">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-ring" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">RealtiPro</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>Admin</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 px-10 py-8">
            <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4 animate-slide-up opacity-0" style={{ animationDelay: "0.1s" }}>
              Account Recovery
            </p>
            <h1 className="text-white font-bold leading-tight mb-5" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
              <span className="block animate-slide-up opacity-0" style={{ animationDelay: "0.2s" }}>Locked out?</span>
              <span className="block animate-slide-up opacity-0" style={{ animationDelay: "0.35s", background: "linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                We've got you covered.
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md animate-slide-up opacity-0" style={{ animationDelay: "0.45s" }}>
              Regain access to your admin dashboard in under 2 minutes with our secure self-service password reset.
            </p>
          </div>

          {/* Steps */}
          <div className="relative z-10 px-10 flex-1 pb-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">How it works</p>
            <div className="space-y-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = activeStep === i;
                return (
                  <button
                    key={s.title}
                    onClick={() => setActiveStep(i)}
                    className={`glass w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-500 cursor-pointer group ${
                      isActive ? "border-emerald-500/40 bg-white/10 scale-[1.01]" : "hover:border-white/20 hover:bg-white/08"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${s.color} shrink-0 transition-all duration-300 ${isActive ? "scale-110 shadow-lg" : "group-hover:scale-105"}`}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold mb-0.5 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300 leading-snug">
                        {s.desc}
                      </p>
                    </div>
                    <span className={`text-2xl font-black transition-all duration-300 ${isActive ? "text-emerald-400" : "text-slate-700 group-hover:text-slate-500"}`}>
                      {s.step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT: Form panel ────────────────────────────────────────── */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center bg-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, #10b981, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", transform: "translate(-30%,30%)" }} />

          <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-12">
            {/* Logo */}
            <div className="mb-10 animate-slide-up opacity-0" style={{ animationDelay: "0.05s" }}>
              <Link href="/" className="inline-flex items-center gap-2">
                <Image src="/images/realtipro-logo.png" alt="RealtiPro Logo" width={160} height={54} className="h-9 w-auto" priority />
              </Link>
            </div>

            {/* Animated envelope icon */}
            <div className="mb-6 flex items-center justify-center animate-slide-up opacity-0" style={{ animationDelay: "0.1s" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center animate-envelope"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1 animate-slide-up opacity-0" style={{ animationDelay: "0.18s" }}>
                Forgot your password?
              </h2>
              <p className="text-sm text-gray-500 animate-slide-up opacity-0" style={{ animationDelay: "0.26s" }}>
                No worries — enter your email and we&apos;ll send a secure reset link.
              </p>
            </div>

            {/* Success state */}
            {successMessage ? (
              <div className="animate-success-pop">
                <div className="rounded-2xl p-6 text-center mb-6" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #a7f3d0" }}>
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-emerald-800 font-semibold text-base mb-1">Check your inbox!</h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">{successMessage}</p>
                  <p className="text-emerald-600 text-xs mt-3">Redirecting to login in 5 seconds…</p>
                </div>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email input */}
                <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.34s" }}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`input-focus-ring w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-dark transition-all duration-200 ${
                        error
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 focus:bg-white"
                      }`}
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span> {error}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.42s" }}>
                  <button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="btn-shine w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: forgotPasswordMutation.isPending
                        ? "#6b7280"
                        : "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                    }}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 0.8s linear infinite" }} />
                        Sending reset link…
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {forgotPasswordMutation.isError && !error && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 text-center">
                      {(forgotPasswordMutation.error as Error)?.message}
                    </div>
                  )}
                </div>

                {/* Back to login */}
                <div className="text-center animate-slide-up opacity-0" style={{ animationDelay: "0.5s" }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-gray-400 tracking-wide">SECURE RESET PROCESS</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-5">
              {[
                { icon: "🔒", text: "Encrypted" },
                { icon: "⏱️", text: "Expires 15 min" },
                { icon: "🛡️", text: "One-time use" },
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

      {/* ── Register Modal ─────────────────────────────────────────────── */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Create an account</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-dark">Full name</label>
              <input id="register-name" name="name" type="text" required value={registerFormData.name} onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${registerErrors.name ? 'border-red-500' : 'border-border'} px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`} />
              {registerErrors.name && <p className="mt-1 text-sm text-red-500">{registerErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-dark">Email address</label>
              <input id="register-email" name="email" type="email" required value={registerFormData.email} onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${registerErrors.email ? 'border-red-500' : 'border-border'} px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`} />
              {registerErrors.email && <p className="mt-1 text-sm text-red-500">{registerErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-dark">Phone number</label>
              <input id="register-phone" name="phone" type="tel" required value={registerFormData.phone} onChange={handleRegisterChange} placeholder="10-digit phone number"
                className={`mt-1 block w-full rounded-lg border ${registerErrors.phone ? 'border-red-500' : 'border-border'} px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`} />
              {registerErrors.phone && <p className="mt-1 text-sm text-red-500">{registerErrors.phone}</p>}
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-dark">Password</label>
              <input id="register-password" name="password" type="password" required value={registerFormData.password} onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${registerErrors.password ? 'border-red-500' : 'border-border'} px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`} />
              {registerErrors.password && <p className="mt-1 text-sm text-red-500">{registerErrors.password}</p>}
            </div>
            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-dark">Confirm password</label>
              <input id="register-confirmPassword" name="confirmPassword" type="password" required value={registerFormData.confirmPassword} onChange={handleRegisterChange}
                className={`mt-1 block w-full rounded-lg border ${registerErrors.confirmPassword ? 'border-red-500' : 'border-border'} px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`} />
              {registerErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{registerErrors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={registerMutation.isPending}
              className="w-full flex justify-center py-3 px-4 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

