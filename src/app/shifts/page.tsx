'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ShiftRecord {
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sqShifts');
      const shiftRecords = raw ? JSON.parse(raw) : [];
      setShifts(shiftRecords);

      const activeShift = localStorage.getItem('sqActiveShift');
      if (activeShift) {
        setIsShiftActive(true);
        setCurrentStartTime(activeShift);
      }
    } catch (e) {
      console.error('Error loading shifts:', e);
    }
  }, []);

  const handleStartShift = () => {
    const now = new Date();
    const startTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    localStorage.setItem('sqActiveShift', startTime);
    setIsShiftActive(true);
    setCurrentStartTime(startTime);
  };

  const handleEndShift = () => {
    if (!currentStartTime) return;

    const now = new Date();
    const endTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const today = new Date().toISOString().split('T')[0];

    try {
      const raw = localStorage.getItem('sqShifts');
      const shiftRecords: ShiftRecord[] = raw ? JSON.parse(raw) : [];

      const startDate = new Date(`${today}T${currentStartTime}`);
      const endDate = new Date(`${today}T${endTime}`);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

      shiftRecords.push({
        date: today,
        startTime: currentStartTime,
        endTime: endTime,
        duration: duration,
      });

      localStorage.setItem('sqShifts', JSON.stringify(shiftRecords));
      setShifts(shiftRecords);
    } catch (e) {
      console.error('Error saving shift:', e);
    }

    localStorage.removeItem('sqActiveShift');
    setIsShiftActive(false);
    setCurrentStartTime(null);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light">
      <header className="border-b border-brand-border bg-brand-primary/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logos/singapore-airlines-logo-960.png" alt="Logo" className="h-8 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-brand-gold tracking-wider">SQ</h1>
              <p className="text-brand-accent text-xs uppercase tracking-widest font-light">Staff Portal</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-brand-border bg-brand-primary/30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex gap-6 flex-wrap">
          <Link href="/" className="text-sm text-brand-accent">Dashboard</Link>
          <Link href="/staff" className="text-sm text-brand-accent">Staff</Link>
          <Link href="/servers" className="text-sm text-brand-accent">Servers</Link>
          <Link href="/tasks" className="text-sm text-brand-accent">Tasks</Link>
          <Link href="/attendance" className="text-sm text-brand-accent">Attendance</Link>
          <Link href="/leaves" className="text-sm text-brand-accent">Leaves</Link>
          <Link href="/announcements" className="text-sm text-brand-accent">Announcements</Link>
          <Link href="/shifts" className="text-sm text-brand-gold font-semibold">Shifts</Link>
          <Link href="/maintenance" className="text-sm text-brand-accent">Maintenance</Link>
          <Link href="/notifications" className="text-sm text-brand-accent">Notifications</Link>
          <Link href="/docs" className="text-sm text-brand-accent">Docs</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-brand-light">Shift Management</h2>
          <p className="text-brand-accent mt-2">Track your work shifts and view shift history.</p>
        </div>

        {/* Active Shift Status */}
        <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
          <h3 className="text-xl font-bold text-brand-light mb-6">Current Shift</h3>
          
          {isShiftActive ? (
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-600 rounded p-4">
                <p className="text-green-400 font-semibold">Shift in progress</p>
                <p className="text-brand-accent text-sm mt-2">Started at: <span className="text-brand-gold">{currentStartTime}</span></p>
              </div>
              <button
                onClick={handleEndShift}
                className="px-6 py-3 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
              >
                End Shift
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-brand-dark/50 border border-brand-border rounded p-4">
                <p className="text-brand-accent">No active shift</p>
              </div>
              <button
                onClick={handleStartShift}
                className="px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-yellow-400 transition"
              >
                Start Shift
              </button>
            </div>
          )}
        </div>

        {/* Shift History */}
        <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
          <h3 className="text-xl font-bold text-brand-light mb-6">Shift History</h3>
          
          {shifts.length === 0 ? (
            <p className="text-brand-accent">No shifts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold">Start Time</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold">End Time</th>
                    <th className="text-left py-3 px-4 text-brand-gold font-semibold">Duration (minutes)</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift, idx) => (
                    <tr key={idx} className="border-b border-brand-border/50 hover:bg-brand-dark/50">
                      <td className="py-3 px-4 text-brand-light">{shift.date}</td>
                      <td className="py-3 px-4 text-brand-accent">{shift.startTime}</td>
                      <td className="py-3 px-4 text-brand-accent">{shift.endTime || '—'}</td>
                      <td className="py-3 px-4 text-brand-gold font-semibold">{shift.duration || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
