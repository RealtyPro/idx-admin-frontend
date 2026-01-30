"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/auth/AuthServices";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  return (
    <main className="min-h-screen bg-white flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <Link href="/" className="flex items-center mb-8">
              <Image
                src="/images/realtipro-logo.png"
                alt="RealtiPro Logo"
                width={180}
                height={60}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-dark">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-dark-secondary">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {successMessage && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${
                  error ? "border-red-500" : "border-border"
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
                placeholder="Enter your email address"
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm sm:text-base hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </button>

            {forgotPasswordMutation.isError && !error && (
              <p className="mt-2 text-sm text-red-500 text-center">
                {(forgotPasswordMutation.error as Error)?.message}
              </p>
            )}
          </form>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary-light flex items-center justify-center gap-2"
            >
              <span>←</span>
              Back to login
            </Link>
          </div>

          <p className="text-center text-sm text-dark-secondary">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary-light"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-90"></div>
        <Image
          src="/images/hero-image.png"
          alt="Forgot Password"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}

