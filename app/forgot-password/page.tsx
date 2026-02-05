"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword, RegisterPayload } from "@/services/auth/AuthServices";
import { useRegister } from '@/services/auth/AuthQueries';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const registerMutation = useRegister();

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

          <div className="text-center space-y-3">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary-light flex items-center justify-center gap-2"
            >
              <span>←</span>
              Back to login
            </Link>
            
            <p className="text-sm text-dark-secondary">
              Don't have an account?{' '}
              <button
                onClick={() => setShowRegisterModal(true)}
                className="text-primary hover:text-primary-light font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Create an account</DialogTitle>
          </DialogHeader>
          
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-dark">
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
                  registerErrors.name ? 'border-red-500' : 'border-border'
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.name && (
                <p className="mt-1 text-sm text-red-500">{registerErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-dark">
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
                  registerErrors.email ? 'border-red-500' : 'border-border'
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.email && (
                <p className="mt-1 text-sm text-red-500">{registerErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-dark">
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
                  registerErrors.phone ? 'border-red-500' : 'border-border'
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{registerErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-dark">
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
                  registerErrors.password ? 'border-red-500' : 'border-border'
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.password && (
                <p className="mt-1 text-sm text-red-500">{registerErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-dark">
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
                  registerErrors.confirmPassword ? 'border-red-500' : 'border-border'
                } px-4 py-3 text-dark shadow-sm focus:border-primary focus:outline-none`}
              />
              {registerErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{registerErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex justify-center py-3 px-4 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

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

