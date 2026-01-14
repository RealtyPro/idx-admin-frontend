'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="RealtiPro Logo" width={40} height={40} />
          <span className="font-serif text-heading text-dark">RealtiPro</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="flex items-center justify-center px-8 py-2 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-button">
            Login
          </Link>
          <Link href="/register" className="flex items-center justify-center px-8 py-2 rounded-[37.5px] border border-border text-border text-button">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex flex-col gap-8">
        <div className="max-w-3xl">
          <h1 className="font-serif text-display text-dark mb-4">
            Smart<br />Interaction Logger
          </h1>
          <p className="text-body text-dark mb-8">
            Capture, Store, and Analyze WhatsApp & call interactions with ease.
          </p>
          <div className="flex gap-4">
            <Link href="/get-started" className="flex items-center justify-center px-8 py-2 rounded-[37.5px] bg-gradient-to-br from-primary to-primary-light text-white font-bold text-button">
              Get Started
            </Link>
            <button className="flex items-center justify-center px-8 py-2 rounded-[37.5px] border border-border gap-2">
              <span className="text-border text-button">Watch Demo</span>
              <Image src="/images/play-icon.svg" alt="Play" width={24} height={24} />
            </button>
          </div>
        </div>
        <Image src="/images/hero-image.png" alt="Hero" width={1200} height={600} className="w-full" />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-8">
          <h2 className="font-serif text-heading text-dark">Realtime Chat Logging</h2>
          <p className="text-body text-dark">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more
          </p>
          <Image src="/images/chat-logging.png" alt="Chat Logging" width={600} height={400} className="w-full" />
        </div>
        <div className="space-y-8">
          <h2 className="font-serif text-heading text-dark">Call Recording Playback</h2>
          <p className="text-body text-dark">
            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more
          </p>
          <Image src="/images/call-recording.png" alt="Call Recording" width={600} height={400} className="w-full" />
        </div>
      </section>

      {/* How it works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-display text-dark mb-4">How it's work</h2>
        <p className="text-body text-dark mb-16">Seamless Communication Capture</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="border-t border-dark-secondary pt-8">
            <div className="flex items-center gap-4 mb-4">
              <Image src="/images/microphone-icon.svg" alt="Record" width={40} height={40} />
              <h3 className="font-serif text-heading text-dark">Record</h3>
            </div>
            <p className="text-body text-dark-secondary">
              Automatically capture and store all calls and chats securely.
            </p>
          </div>

          <div className="border-t border-dark-secondary pt-8">
            <div className="flex items-center gap-4 mb-4">
              <Image src="/images/electricity-icon.svg" alt="Connect" width={40} height={40} />
              <h3 className="font-serif text-heading text-dark">Connect</h3>
            </div>
            <p className="text-body text-dark-secondary">
              Link your WhatsApp or phone system effortlessly to our platform.
            </p>
          </div>

          <div className="border-t border-dark-secondary pt-8">
            <div className="flex items-center gap-4 mb-4">
              <Image src="/images/analyze-icon.svg" alt="Analyze" width={40} height={40} />
              <h3 className="font-serif text-heading text-dark">Replay & Analyze</h3>
            </div>
            <p className="text-body text-dark-secondary">
              Access, search, and analyze interactions anytime with advanced tools.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer-bg text-footer-text py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-body">© 2024 Smart Interaction Logger. All rights reserved.</p>
            <p className="text-body">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <span className="mx-4">|</span>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <span className="mx-4">|</span>
              <Link href="/contact" className="hover:text-white">Contact Us</Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 