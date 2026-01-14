'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Listings', href: '/admin/listings', icon: DocumentTextIcon },
  { name: 'Agents', href: '/admin/agents', icon: UsersIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Enquiries', href: '/admin/inquiries', icon: EnvelopeIcon },
  { name: 'Blog', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'Testimonials', href: '/admin/testimonials', icon: ChatBubbleLeftRightIcon },
   { name: 'NewsLetter', href: '/admin/newsletter', icon: DocumentTextIcon },

  { name: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Invoices', href: '/admin/invoices', icon: CreditCardIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function adminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transition-all duration-300 bg-white border-r border-gray-200 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Button */}
          <div className={`flex items-center gap-2 p-6 ${collapsed ? 'justify-center' : ''}`}>
            {collapsed ? (
              <span className="font-serif text-2xl font-bold text-primary">IDX</span>
            ) : (
              <>
                <Image src="/images/logo.svg" alt="IDX Logo" width={32} height={32} />
                <span className="font-serif text-xl text-dark">IDX Dashboard</span>
              </>
            )}
            <button
              className={`ml-auto p-1 rounded-lg hover:bg-gray-100 transition ${collapsed ? '' : 'ml-4'}`}
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
                      ? 'bg-primary/10 text-primary'
                      : 'text-dark-secondary hover:bg-gray-50'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className={`p-4 border-t border-gray-200 ${collapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">JD</span>
                </div>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">John Doe</p>
                  <p className="text-xs text-dark-secondary truncate">john@example.com</p>
                </div>
              )}
              <button
                className="p-1 rounded-lg text-dark-secondary hover:bg-gray-50"
                onClick={() => {
                  // Handle logout
                  console.log('Logout clicked');
                }}
                aria-label="Logout"
                type="button"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={collapsed ? 'pl-20' : 'pl-64'}>
        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
} 