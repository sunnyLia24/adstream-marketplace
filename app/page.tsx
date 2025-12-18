/**
 * =============================================================================
 * LANDING PAGE COMPONENT
 * =============================================================================
 *
 * This is the main marketing/landing page for AdStream, displayed when users
 * visit the root URL (/). It serves as the entry point for new visitors and
 * provides an overview of the platform's value proposition.
 *
 * PAGE STRUCTURE:
 * ---------------
 * 1. NAVIGATION BAR (Fixed)
 *    - AdStream logo/branding
 *    - Sign In button for existing users
 *
 * 2. HERO SECTION
 *    - Main headline explaining the platform
 *    - Subheadline with value proposition
 *    - CTA buttons for Creator and Brand signup
 *
 * 3. STATS SECTION
 *    - Social proof with platform metrics
 *    - Total deal volume, active creators, brand partners
 *
 * 4. CREATOR FEATURES SECTION
 *    - Three feature cards explaining creator benefits
 *    - Schedule Content, Receive Bids, Get Paid workflow
 *
 * 5. BRAND FEATURES SECTION
 *    - Three feature cards explaining brand benefits
 *    - Discover Creators, Place Bids, Track Results workflow
 *
 * 6. CALL-TO-ACTION SECTION
 *    - Final conversion prompt
 *    - Create Account and Sign In buttons
 *
 * 7. FOOTER
 *    - Product, Company, Legal links
 *    - Copyright notice
 *
 * DESIGN NOTES:
 * -------------
 * - Uses dark theme with purple/pink gradient accents
 * - Glass morphism effect (backdrop-blur-sm) for depth
 * - Responsive grid layouts (grid-cols-1 md:grid-cols-3)
 * - Lucide React icons for visual consistency
 *
 * NEXT.JS NOTES:
 * --------------
 * - This is a Server Component (no 'use client' directive)
 * - Uses Next.js Link component for client-side navigation
 * - Static page with no dynamic data fetching
 */

import Link from 'next/link';
import { ArrowRight, TrendingUp, DollarSign, Calendar, BarChart3, Shield, Zap } from 'lucide-react';

/**
 * LandingPage Component
 *
 * The main marketing page that introduces AdStream to new visitors.
 * This page is statically generated at build time for optimal performance.
 *
 * @returns The complete landing page with all sections
 */
export default function LandingPage() {
  return (
    // Main container with full viewport height and gradient background
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* =========================================================================
          NAVIGATION BAR
          =========================================================================
          Fixed position nav that stays visible while scrolling.
          Uses backdrop-blur for a glass effect over content below.
      */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo and brand name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-2xl font-bold text-white">AdStream</span>
          </div>
          {/* Sign in button for existing users */}
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION
          =========================================================================
          The main attention-grabbing section with headline, subheadline,
          and primary call-to-action buttons.

          Layout: Centered text with responsive font sizes
          - pt-32: Accounts for fixed navbar height
          - Gradient text effect on "YouTube Creators"
      */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Tagline badge */}
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <span className="text-purple-300 text-sm font-medium">Programmatic Creator Advertising</span>
          </div>
          {/* Main headline with gradient text effect */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connect Brands with<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              YouTube Creators
            </span>
          </h1>
          {/* Value proposition subheadline */}
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The first marketplace where creators schedule content and brands bid on ad placements.
            Transparent, efficient, and built for the creator economy.
          </p>
          {/* Primary CTA buttons - Creator vs Brand paths */}
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Primary CTA for creators with arrow icon */}
            <Link href="/auth/signup" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition shadow-lg shadow-purple-500/50">
              I am a Creator
              <ArrowRight className="w-5 h-5" />
            </Link>
            {/* Secondary CTA for brands */}
            <Link href="/auth/signup" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border border-purple-500/30 transition">
              I am a Brand
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STATS/SOCIAL PROOF SECTION
          =========================================================================
          Displays platform metrics to build trust and credibility.

          Layout: 3-column grid that stacks on mobile
          Stats shown: Deal volume, Active creators, Brand partners
      */}
      <section className="py-16 px-6 bg-slate-800/50 backdrop-blur-sm border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Total Deal Volume stat */}
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              $2.5M+
            </div>
            <div className="text-gray-300">Total Deal Volume</div>
          </div>
          {/* Active Creators stat */}
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              1,200+
            </div>
            <div className="text-gray-300">Active Creators</div>
          </div>
          {/* Brand Partners stat */}
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              450+
            </div>
            <div className="text-gray-300">Brand Partners</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CREATOR FEATURES SECTION
          =========================================================================
          Explains the three-step workflow for creators:
          1. Schedule Content - List upcoming videos
          2. Receive Bids - Get offers from brands
          3. Get Paid - Deliver content and receive payment

          Uses purple accent colors to match creator theme
      */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Creators
            </h2>
            <p className="text-xl text-gray-300">
              Monetize your content calendar like never before
            </p>
          </div>
          {/* Feature cards grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Schedule Content */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Schedule Content</h3>
              <p className="text-gray-300">
                List your upcoming videos with topics, expected reach, and available ad slots
              </p>
            </div>
            {/* Feature 2: Receive Bids */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Receive Bids</h3>
              <p className="text-gray-300">
                Brands bid on your ad slots. Review offers and accept the ones that fit your brand
              </p>
            </div>
            {/* Feature 3: Get Paid */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Paid</h3>
              <p className="text-gray-300">
                Create the content, verify delivery, and receive payment directly to your account
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BRAND FEATURES SECTION
          =========================================================================
          Explains the three-step workflow for brands:
          1. Discover Creators - Search and filter creators
          2. Place Bids - Bid on ad slots
          3. Track Results - Monitor campaign performance

          Uses pink accent colors to differentiate from creator section
      */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Brands
            </h2>
            <p className="text-xl text-gray-300">
              Find the perfect creators and place winning bids
            </p>
          </div>
          {/* Feature cards grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Discover Creators */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Discover Creators</h3>
              <p className="text-gray-300">
                Search by niche, audience size, demographics, and engagement metrics
              </p>
            </div>
            {/* Feature 2: Place Bids */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Place Bids</h3>
              <p className="text-gray-300">
                Bid on ad slots that match your campaign goals and budget
              </p>
            </div>
            {/* Feature 3: Track Results */}
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Results</h3>
              <p className="text-gray-300">
                Monitor content delivery and campaign performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA SECTION
          =========================================================================
          A prominent call-to-action section with gradient background
          to encourage visitors to sign up.
      */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and brands building better partnerships
          </p>
          {/* CTA buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup" className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition">
              Create Account
            </Link>
            <Link href="/auth/signin" className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition border border-white/20">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          =========================================================================
          Site footer with navigation links and copyright.
          4-column grid layout with logo, Product, Company, and Legal sections.
      */}
      <footer className="py-12 px-6 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {/* Brand column with logo */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">AdStream</span>
            </div>
            <p className="text-gray-400">
              The future of creator advertising
            </p>
          </div>
          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition">Case Studies</Link></li>
            </ul>
          </div>
          {/* Company links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition">About</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
            </ul>
          </div>
          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
        </div>
        {/* Copyright notice */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-purple-500/20 text-center text-gray-400">
          <p>&copy; 2024 AdStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
