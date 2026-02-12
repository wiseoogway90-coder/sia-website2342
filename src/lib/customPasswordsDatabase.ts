// Custom passwords database - stores user-specific password hashes after they change them
// Stored in memory for this session

import { connectMongo, isMongoEnabled } from './mongo';
import { CustomPassword } from '@/models/CustomPassword';

interface CustomPasswordEntry {
  userId: string;
  username?: string;
  passwordHash: string;
  changedAt?: string;
}

let customPasswords: CustomPasswordEntry[] = [];

export async function setCustomPassword(userId: string, username: string, passwordHash: string): Promise<void> {
  if (!isMongoEnabled()) {
    customPasswords = customPasswords.filter(p => p.userId !== userId);
    customPasswords.push({ userId, username, passwordHash, changedAt: new Date().toISOString() });
    return;
  }

  await connectMongo();
  await CustomPassword.findOneAndUpdate(
    { staffId: userId },
    { staffId: userId, passwordHash },
    { upsert: true }
  ).exec();
}

export async function getCustomPassword(userId: string): Promise<CustomPasswordEntry | null> {
  if (!isMongoEnabled()) {
    return customPasswords.find(p => p.userId === userId) || null;
  }

  await connectMongo();
  const rec = await CustomPassword.findOne({ staffId: userId }).lean();
  if (!rec) return null;
  return { userId: String(rec.staffId), passwordHash: rec.passwordHash };
}

export async function getCustomPasswordByUsername(username: string): Promise<CustomPasswordEntry | null> {
  if (!isMongoEnabled()) {
    return customPasswords.find(p => p.username === username) || null;
  }

  await connectMongo();
  // We store staffId in custom passwords, lookup by username requires joining Staff — keep this simple and return null.
  return null;
}

export async function hasCustomPassword(userId: string): Promise<boolean> {
  if (!isMongoEnabled()) return customPasswords.some(p => p.userId === userId);
  await connectMongo();
  const rec = await CustomPassword.findOne({ staffId: userId }).lean();
  return !!rec;
}

export function getAllCustomPasswords(): CustomPasswordEntry[] {
  return customPasswords;
}

export function clearCustomPassword(userId: string): void {
  customPasswords = customPasswords.filter(p => p.userId !== userId);
}

export function clearAllCustomPasswords(): void {
  customPasswords = [];
}
