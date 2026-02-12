import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findStaffByUsername, findStaffByDiscordUsername } from '@/lib/staffDatabase';
import { addLoginLog } from '@/lib/loginLogsDatabase';
import { getCustomPassword } from '@/lib/customPasswordsDatabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-12345';

interface LoginRequest {
  username: string;
  discordUsername: string;
  password: string;
  category?: 'admin' | 'supervisor' | 'staff';
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { username, discordUsername, password, category = 'admin' } = body;

    console.log(`[LOGIN] Attempting login - Username: "${username}", Discord: "${discordUsername}", Category: "${category}"`);

    // Validate input and trim whitespace
    if (!username || !discordUsername || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, Discord username, and password are required' },
        { status: 400 }
      );
    }

    // Trim all inputs to remove accidental spaces
    const trimmedUsername = username.trim();
    const trimmedDiscordUsername = discordUsername.trim();
    const trimmedPassword = password.trim();

    // Find staff: prefer username lookup so the UI can accept any Discord input
    // (some users enter a free-form Discord handle in the form). If username
    // lookup fails, fall back to Discord lookup to remain backwards-compatible.
    let staff = await findStaffByUsername(trimmedUsername);
    let loginFoundBy = 'username';
    if (!staff) {
      staff = await findStaffByDiscordUsername(trimmedDiscordUsername);
      loginFoundBy = 'discord';
    }

    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or Discord username or password' },
        { status: 401 }
      );
    }

    // Verify the selected category matches the staff member's role
    if (staff.role !== category) {
      return NextResponse.json(
        { success: false, message: `This user is not in the ${category.toUpperCase()} category` },
        { status: 401 }
      );
    }

    // Check if active
    if (staff.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Verify password - check custom password first, then fall back to category password
    let passwordMatch = false;
    const customPassword = await getCustomPassword(staff.id);

    console.log(`[LOGIN] User: ${trimmedUsername}, ID: ${staff.id}, Has custom password: ${!!customPassword}`);

    if (customPassword) {
      // If user has set a custom password, verify against that
      console.log(`[LOGIN] Checking custom password for user ${trimmedUsername}`);
      passwordMatch = await bcrypt.compare(trimmedPassword, customPassword.passwordHash);
    } else {
      // Otherwise verify against the database password (category password)
      console.log(`[LOGIN] Checking category password for user ${trimmedUsername}`);
      passwordMatch = await bcrypt.compare(trimmedPassword, staff.password);
    }
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Log the successful login. Record both the stored username and the
    // provided Discord input so admins can see the submitted handle.
    await addLoginLog({
      userId: staff.id,
      username: staff.username,
      name: staff.name,
      role: staff.role,
      loginType: loginFoundBy === 'discord' ? 'discord' : 'username',
      discordInput: trimmedDiscordUsername,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: staff.id,
        username: staff.username,
        role: staff.role,
        email: staff.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: staff.id,
          username: staff.username,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          department: staff.department,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
