"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React,{ ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}