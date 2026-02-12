import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findStaffByUsername } from '@/lib/staffDatabase';
import { setCustomPassword, getCustomPassword } from '@/lib/customPasswordsDatabase';

interface ChangePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChangePasswordRequest = await request.json();
    const { username, oldPassword, newPassword } = body;

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedUsername = username.trim();
    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    // Find staff member
    const staff = await findStaffByUsername(trimmedUsername);
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // First check if user has a custom password set
    const customPassword = await getCustomPassword(staff.id);
    let passwordMatch = false;

    if (customPassword) {
      // If custom password exists, verify against that
      passwordMatch = await bcrypt.compare(trimmedOldPassword, customPassword.passwordHash);
    } else {
      // Otherwise verify against the database password (category password)
      passwordMatch = await bcrypt.compare(trimmedOldPassword, staff.password);
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Old password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password
    if (trimmedNewPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await bcrypt.hash(trimmedNewPassword, 10);
    
    // Store custom password for this user
    console.log(`[CHANGE_PASSWORD] Storing custom password for user ${username} (ID: ${staff.id})`);
    await setCustomPassword(staff.id, staff.username, newHash);
    console.log(`[CHANGE_PASSWORD] Custom password stored successfully`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password changed successfully',
        user: {
          username: staff.username,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          department: staff.department,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
