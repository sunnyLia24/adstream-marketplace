import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password, userType, companyName } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate brand-specific fields
    if (userType === 'brand' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for brand accounts' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with related profile
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        userType: userType.toUpperCase(),
        ...(userType === 'creator' && {
          creator: {
            create: {
              niche: [], // Initialize with empty array
            },
          },
        }),
        ...(userType === 'brand' && {
          brand: {
            create: {
              companyName,
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Database relationship error. Please contact support.' },
        { status: 500 }
      );
    }

    // Database connection errors
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
