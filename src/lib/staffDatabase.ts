// Mock staff database
// In production, this would be a real database like MongoDB, PostgreSQL, etc.

export interface Staff {
  id: string;
  username: string;
  discordUsername: string;
  email: string;
  password: string; // hashed in production
  name: string;
  role: 'admin' | 'supervisor' | 'staff';
  department: string;
  status: 'active' | 'inactive';
}

// Demo staff - passwords are hashed with bcryptjs
// Admin password: admin0786
// Supervisor password: supervisor8654
// Staff password: staff1921

import { connectMongo, isMongoEnabled } from './mongo';
import { Staff as StaffModel } from '@/models/Staff';

export const staffDatabase: Staff[] = [
  {
    id: '1',
    username: 'admin',
    discordUsername: 'AdminUser#0001',
    email: 'admin@singaporeairlines.com',
    password: '$2b$10$EWJ6VprdVEXkuCLWzHGwUuyL0MKgyg/Eu8c3R2wi/8wmPzgPILeIK', // admin0786
    name: 'Admin User',
    role: 'admin',
    department: 'Management',
    status: 'active',
  },
  {
    id: '2',
    username: 'supervisor',
    discordUsername: 'SupervisorSQ#0002',
    email: 'supervisor@singaporeairlines.com',
    password: '$2b$10$RAwfmUBu2k41oeBhmdsH/.6y5btSMK6tLVUH6rM7kTOu01AmQRPZ6', // supervisor8654
    name: 'Supervisor User',
    role: 'supervisor',
    department: 'Operations',
    status: 'active',
  },
  {
    id: '3',
    username: 'staff',
    discordUsername: 'StaffCrew#0003',
    email: 'staff@singaporeairlines.com',
    password: '$2b$10$dPqlG6LBRu3NuQ5Xz8yJV.SS0B91iTvsC55o7uIGajzmqC5lYXxx.', // staff1921
    name: 'Staff User',
    role: 'staff',
    department: 'Crew',
    status: 'active',
  },
  {
    id: '4',
    username: 'john.doe',
    discordUsername: 'JohnDoe#0456',
    email: 'john.doe@singaporeairlines.com',
    password: '$2b$10$dPqlG6LBRu3NuQ5Xz8yJV.SS0B91iTvsC55o7uIGajzmqC5lYXxx.', // staff1921
    name: 'John Doe',
    role: 'staff',
    department: 'Maintenance',
    status: 'active',
  },
  {
    id: '5',
    username: 'jane.smith',
    discordUsername: 'JaneSmith#0789',
    email: 'jane.smith@singaporeairlines.com',
    password: '$2b$10$RAwfmUBu2k41oeBhmdsH/.6y5btSMK6tLVUH6rM7kTOu01AmQRPZ6', // supervisor8654
    name: 'Jane Smith',
    role: 'supervisor',
    department: 'Catering',
    status: 'active',
  },
  {
    id: '6',
    username: 'aizen',
    discordUsername: 'aizen123',
    email: 'aizen@singaporeairlines.com',
    password: '$2b$10$dPqlG6LBRu3NuQ5Xz8yJV.SS0B91iTvsC55o7uIGajzmqC5lYXxx.', // staff1921
    name: 'Aizen',
    role: 'staff',
    department: 'Operations',
    status: 'active',
  },
];

export async function findStaffByUsername(username: string): Promise<Staff | null> {
  if (!isMongoEnabled()) {
    return staffDatabase.find(s => s.username.toLowerCase() === username.toLowerCase()) || null;
  }

  await connectMongo();
  const user = await StaffModel.findOne({ username: username.toLowerCase() }).lean();
  if (!user) return null;
  return {
    id: String(user._id),
    username: user.username,
    discordUsername: user.discordUsername || '',
    email: user.email || '',
    password: user.password,
    name: user.name || '',
    role: (user.role as any) || 'staff',
    department: user.department || '',
    status: (user.status as any) || 'active',
  };
}

export async function findStaffByDiscordUsername(discordUsername: string): Promise<Staff | null> {
  if (!isMongoEnabled()) {
    return staffDatabase.find(s => s.discordUsername.toLowerCase() === discordUsername.toLowerCase()) || null;
  }

  await connectMongo();
  const user = await StaffModel.findOne({ discordUsername: discordUsername.toLowerCase() }).lean();
  if (!user) return null;
  return {
    id: String(user._id),
    username: user.username,
    discordUsername: user.discordUsername || '',
    email: user.email || '',
    password: user.password,
    name: user.name || '',
    role: (user.role as any) || 'staff',
    department: user.department || '',
    status: (user.status as any) || 'active',
  };
}

export async function findStaffById(id: string): Promise<Staff | null> {
  if (!isMongoEnabled()) {
    return staffDatabase.find(s => s.id === id) || null;
  }

  await connectMongo();
  const user = await StaffModel.findById(id).lean();
  if (!user) return null;
  return {
    id: String(user._id),
    username: user.username,
    discordUsername: user.discordUsername || '',
    email: user.email || '',
    password: user.password,
    name: user.name || '',
    role: (user.role as any) || 'staff',
    department: user.department || '',
    status: (user.status as any) || 'active',
  };
}
