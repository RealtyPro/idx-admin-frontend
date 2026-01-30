'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        setHasToken(true);
        router.push('/admin');
      } else {
        setHasToken(false);
      }
    }
  }, [router]);

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (hasToken) {
      router.push('/admin');
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/realtipro-logo.png" 
            alt="RealtiPro Logo" 
            width={180} 
            height={60} 
            className="h-8 sm:h-10 md:h-12 w-auto" 
            priority
          />
        </Link>
        <div className="flex gap-2 sm:gap-4">
          <Link 
            href={hasToken ? "/admin" : "/login"} 
            onClick={handleLoginClick}
            className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-2 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm sm:text-base"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 flex flex-col gap-6 sm:gap-8">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-dark mb-3 sm:mb-4 leading-tight">
            Smart<br />Interaction Logger
          </h1>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-dark mb-6 sm:mb-8 leading-relaxed">
            Capture, Store, and Analyze WhatsApp & call interactions with ease.
          </h2>
          <div className="flex gap-4">
            <Link href="/login" className="flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm sm:text-base">
              Get Started
            </Link>
          </div>
        </div>
       
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-dark">Realtime Chat Logging</h2>
          <p className="text-sm sm:text-base md:text-lg text-dark leading-relaxed">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more
          </p>
          <Image src="/images/chat-logging.png" alt="Chat Logging" width={600} height={400} className="w-full h-auto rounded-lg" />
        </div>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-dark">Call Recording Playback</h2>
          <p className="text-sm sm:text-base md:text-lg text-dark leading-relaxed">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more
          </p>
          <Image src="/images/call-recording.png" alt="Call Recording" width={600} height={400} className="w-full h-auto rounded-lg" />
        </div>
      </section>

      {/* How it works Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-dark mb-2 sm:mb-4">How it works</h2>
        <p className="text-sm sm:text-base md:text-lg text-dark mb-8 sm:mb-12 md:mb-16">Seamless Communication Capture</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 relative">
          <div className="border-t border-dark-secondary pt-6 sm:pt-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <Image src="/images/microphone-icon.svg" alt="Record" width={32} height={32} className="sm:w-10 sm:h-10" />
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-dark">Record</h3>
            </div>
            <p className="text-sm sm:text-base text-dark-secondary leading-relaxed">
              Automatically capture and store all calls and chats securely.
            </p>
          </div>

          <div className="border-t border-dark-secondary pt-6 sm:pt-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <Image src="/images/electricity-icon.svg" alt="Connect" width={32} height={32} className="sm:w-10 sm:h-10" />
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-dark">Connect</h3>
            </div>
            <p className="text-sm sm:text-base text-dark-secondary leading-relaxed">
              Link your WhatsApp or phone system effortlessly to our platform.
            </p>
          </div>

          <div className="border-t border-dark-secondary pt-6 sm:pt-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <Image src="/images/analyze-icon.svg" alt="Analyze" width={32} height={32} className="sm:w-10 sm:h-10" />
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-dark">Replay & Analyze</h3>
            </div>
            <p className="text-sm sm:text-base text-dark-secondary leading-relaxed">
              Access, search, and analyze interactions anytime with advanced tools.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer-bg text-footer-text py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base">© 2026 IDX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 