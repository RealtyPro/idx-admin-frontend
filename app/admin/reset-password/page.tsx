"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/services/Api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResetPasswordFormData {
  email: string;
  password: string;
  password_confirmation: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: initialEmail,
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<ResetPasswordFormData> & { token?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Get token from sessionStorage (logged-in user)
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = sessionStorage.getItem("access_token");
    }

    if (!token) {
      setSubmitError("Session token is missing or expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const payload = {
        ...formData,
        token,
      };
      await axiosInstance.post("user/reset-password", payload);
      setSubmitSuccess("Password has been reset successfully.");
      // Optionally log the user out or keep them; for now go back to profile
      setTimeout(() => {
        router.push("/admin/profile");
      }, 1500);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error.message || "Password reset failed";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Set a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password_confirmation">Confirm new password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password_confirmation}
                onChange={handleChange}
                className={
                  errors.password_confirmation ? "border-red-500" : ""
                }
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-sm text-green-600">{submitSuccess}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/admin/profile")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-2 sm:px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}


