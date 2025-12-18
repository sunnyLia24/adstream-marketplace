/**
 * =============================================================================
 * ROOT LAYOUT COMPONENT
 * =============================================================================
 *
 * This is the root layout for the entire AdStream application. In Next.js 13+
 * App Router, the layout.tsx file wraps all pages and provides common structure.
 *
 * KEY RESPONSIBILITIES:
 * ---------------------
 * 1. Sets up the HTML document structure (<html>, <body>)
 * 2. Configures global metadata (title, description for SEO)
 * 3. Loads the Inter font from Google Fonts
 * 4. Imports global CSS styles
 * 5. Wraps all pages with the Providers component (for NextAuth sessions)
 *
 * HOW NEXT.JS LAYOUTS WORK:
 * -------------------------
 * - This layout is applied to ALL pages in the app
 * - The {children} prop contains the current page being rendered
 * - Nested layouts (e.g., app/creator/layout.tsx) can add additional structure
 * - Layout components don't re-render when navigating between pages they wrap
 *
 * PROVIDERS WRAPPER:
 * ------------------
 * The <Providers> component wraps children with NextAuth's SessionProvider,
 * which is required for authentication to work throughout the app.
 * See: app/providers.tsx for implementation details
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/**
 * Configure the Inter font from Google Fonts.
 *
 * Inter is a modern, highly readable sans-serif typeface designed specifically
 * for computer screens. It provides excellent readability at small sizes.
 *
 * Options:
 * - subsets: ['latin'] - Only load Latin character set (reduces bundle size)
 *
 * The font is automatically applied to the <body> via inter.className
 */
const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata configuration for the application.
 *
 * This object is exported and used by Next.js to generate:
 * - <title> tag in the document head
 * - <meta name="description"> tag for SEO
 * - Open Graph tags for social media sharing (when expanded)
 *
 * These values appear in browser tabs, search results, and social previews.
 */
export const metadata: Metadata = {
  title: 'AdStream - Creator Ad Marketplace',
  description: 'Connect brands with YouTube creators',
};

/**
 * RootLayout Component
 *
 * This is the root wrapper for all pages in the application.
 * Every page in the app is rendered inside this layout.
 *
 * @param children - The page content to be rendered inside the layout
 * @returns The complete HTML document structure with providers and styling
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the Inter font to the body and render children inside Providers */}
      <body className={inter.className}>
        {/* Providers component includes NextAuth SessionProvider for auth state */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
