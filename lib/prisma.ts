/**
 * =============================================================================
 * PRISMA CLIENT SINGLETON
 * =============================================================================
 *
 * This file creates and exports a singleton instance of the Prisma Client.
 * Using a singleton prevents multiple database connections from being created
 * during development (when Next.js hot-reloads the application frequently).
 *
 * WHY A SINGLETON?
 * ----------------
 * In development mode, Next.js clears the Node.js cache on every edit.
 * Without a singleton pattern, this would create a new PrismaClient instance
 * on each reload, quickly exhausting the database connection pool limit.
 *
 * HOW IT WORKS:
 * -------------
 * 1. We store the PrismaClient instance on the global object (globalThis)
 * 2. On subsequent imports, we reuse the existing instance
 * 3. In production, we always create a fresh instance (no caching needed)
 *
 * USAGE:
 * ------
 * Import the prisma client in any file:
 *   import { prisma } from '@/lib/prisma';
 *
 * Then use it for database operations:
 *   const users = await prisma.user.findMany();
 *   const newUser = await prisma.user.create({ data: {...} });
 */

import { PrismaClient } from '@prisma/client';

/**
 * Extend the global object's type definition to include our Prisma instance.
 * This is a TypeScript pattern for safely storing globals.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * The Prisma Client instance used throughout the application.
 *
 * Configuration:
 * - log: ['query'] - Logs all database queries in development for debugging
 *
 * The nullish coalescing operator (??) ensures we only create a new client
 * if one doesn't already exist on the global object.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Enable query logging for debugging
  });

/**
 * In development mode, store the Prisma instance on the global object.
 * This prevents new connections from being created on every hot reload.
 *
 * In production (NODE_ENV === 'production'), we skip this step because:
 * 1. There's no hot reloading in production
 * 2. We want clean instances for each serverless function invocation
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
