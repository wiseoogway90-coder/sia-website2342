// Login logs database - stored in memory/localStorage
// In production, this would be a real database like MongoDB, PostgreSQL, etc.

import { connectMongo, isMongoEnabled } from './mongo';
import { LoginLog as LoginLogModel } from '@/models/LoginLog';

export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  name: string;
  role: string;
  loginType: 'username' | 'discord';
  discordInput?: string;
  timestamp: string;
  ipAddress?: string;
}

let loginLogs: LoginLog[] = [];

export async function getAllLoginLogs(): Promise<LoginLog[]> {
  if (!isMongoEnabled()) return [...loginLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  await connectMongo();
  const recs = await LoginLogModel.find().sort({ timestamp: -1 }).lean();
  return recs.map((r: any) => ({ id: String(r._id), userId: String(r.userId), username: r.username, name: r.name || '', role: r.role || '', loginType: (r.loginType as any) || 'username', discordInput: r.discordInput, timestamp: (r.timestamp || new Date()).toISOString(), ipAddress: r.ipAddress || '' }));
}

export async function getTodayLoginLogs(): Promise<LoginLog[]> {
  if (!isMongoEnabled()) {
    const today = new Date().toDateString();
    return loginLogs.filter(log => new Date(log.timestamp).toDateString() === today)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  await connectMongo();
  const start = new Date();
  start.setHours(0,0,0,0);
  const recs = await LoginLogModel.find({ timestamp: { $gte: start } }).sort({ timestamp: -1 }).lean();
  return recs.map((r: any) => ({ id: String(r._id), userId: String(r.userId), username: r.username, name: r.name || '', role: r.role || '', loginType: (r.loginType as any) || 'username', discordInput: r.discordInput, timestamp: (r.timestamp || new Date()).toISOString(), ipAddress: r.ipAddress || '' }));
}

export async function addLoginLog(log: Omit<LoginLog, 'id'>): Promise<LoginLog> {
  if (!isMongoEnabled()) {
    const newLog: LoginLog = { id: `log_${Date.now()}_${Math.random().toString(36).substr(2,9)}`, ...log };
    loginLogs.push(newLog);
    if (loginLogs.length > 1000) loginLogs = loginLogs.slice(-1000);
    return newLog;
  }
  await connectMongo();
  const created = await LoginLogModel.create({ userId: log.userId, username: log.username, name: log.name, role: log.role, loginType: log.loginType, discordInput: log.discordInput, timestamp: log.timestamp ? new Date(log.timestamp) : new Date(), ipAddress: log.ipAddress });
  return { id: String(created._id), userId: String(created.userId), username: created.username, name: created.name || '', role: created.role || '', loginType: (created.loginType as any) || 'username', discordInput: created.discordInput, timestamp: (created.timestamp || new Date()).toISOString(), ipAddress: created.ipAddress || '' };
}

export async function clearAllLoginLogs(): Promise<void> {
  if (!isMongoEnabled()) {
    loginLogs = [];
    return;
  }
  await connectMongo();
  await LoginLogModel.deleteMany({});
}

export async function getLogsForUser(userId: string): Promise<LoginLog[]> {
  if (!isMongoEnabled()) return loginLogs.filter(log => log.userId === userId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  await connectMongo();
  const recs = await LoginLogModel.find({ userId }).sort({ timestamp: -1 }).lean();
  return recs.map((r: any) => ({ id: String(r._id), userId: String(r.userId), username: r.username, name: r.name || '', role: r.role || '', loginType: (r.loginType as any) || 'username', discordInput: r.discordInput, timestamp: (r.timestamp || new Date()).toISOString(), ipAddress: r.ipAddress || '' }));
}

export async function getTodayLoginCount(): Promise<number> {
  if (!isMongoEnabled()) return loginLogs.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length;
  await connectMongo();
  const start = new Date(); start.setHours(0,0,0,0);
  return await LoginLogModel.countDocuments({ timestamp: { $gte: start } });
}
