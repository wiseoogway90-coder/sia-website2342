'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canCheckInOut, canUserDelete, UserRole } from '@/lib/roleCheck';

type AttendanceRecord = {
  id: number;
  staffName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  hoursWorked: number | null;
  status: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
};

const defaultAttendance: AttendanceRecord[] = [
  {
    id: 1,
    staffName: 'Sarah Chen',
    date: '2026-02-11',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    hoursWorked: 9,
    status: 'Present',
  },
  {
    id: 2,
    staffName: 'Michael Torres',
    date: '2026-02-11',
    checkInTime: '08:30',
    checkOutTime: '17:30',
    hoursWorked: 9,
    status: 'Present',
  },
  {
    id: 3,
    staffName: 'Emma Watson',
    date: '2026-02-11',
    checkInTime: null,
    checkOutTime: null,
    hoursWorked: null,
    status: 'Absent',
  },
  {
    id: 4,
    staffName: 'David Kim',
    date: '2026-02-11',
    checkInTime: '08:00',
    checkOutTime: '12:00',
    hoursWorked: 4,
    status: 'Half Day',
  },
];

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    if (typeof window === 'undefined') return defaultAttendance;
    try {
      const saved = localStorage.getItem('sqAttendance');
      return saved ? JSON.parse(saved) : defaultAttendance;
    } catch {
      return defaultAttendance;
    }
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<AttendanceRecord, 'id' | 'hoursWorked'> & { hoursWorked?: number | null }>({
    staffName: '',
    date: selectedDate,
    checkInTime: '',
    checkOutTime: '',
    hoursWorked: null,
    status: 'Present',
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem('sqAttendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecord.staffName) {
      let hours = newRecord.hoursWorked || null;
      if (newRecord.checkInTime && newRecord.checkOutTime) {
        const [inHour, inMin] = newRecord.checkInTime.split(':').map(Number);
        const [outHour, outMin] = newRecord.checkOutTime.split(':').map(Number);
        hours = (outHour - inHour) + (outMin - inMin) / 60;
      }

      const record: AttendanceRecord = {
        id: Date.now(),
        ...newRecord,
        hoursWorked: hours,
        date: selectedDate,
      };
      setAttendance([...attendance, record]);
      setNewRecord({
        staffName: '',
        date: selectedDate,
        checkInTime: '',
        checkOutTime: '',
        hoursWorked: null,
        status: 'Present',
      });
      setShowForm(false);
    }
  };

  const handleDeleteRecord = (id: number) => {
    setAttendance(attendance.filter(a => a.id !== id));
  };

  const todayRecords = attendance.filter(a => a.date === selectedDate);

  const filtered = todayRecords.filter((record) => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const attendanceStats = {
    present: todayRecords.filter(a => a.status === 'Present').length,
    absent: todayRecords.filter(a => a.status === 'Absent').length,
    onLeave: todayRecords.filter(a => a.status === 'On Leave').length,
    halfDay: todayRecords.filter(a => a.status === 'Half Day').length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Absent': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'On Leave': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Half Day': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-primary/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-brand-gold tracking-wider">SQ</h1>
            <p className="text-brand-accent text-xs uppercase tracking-widest font-light">Singapore Airlines Roblox</p>
          </div>
          <Link
            href="/"
            className="px-6 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold/10 rounded transition uppercase tracking-wide text-sm font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-brand-border bg-brand-primary/30 backdrop-blur overflow-x-auto">
        <div className="max-w-7xl mx-auto px-8 py-4 flex gap-12 whitespace-nowrap flex-wrap">
          <NavLink href="/" label="Dashboard" />
          <NavLink href="/staff" label="Staff" />
          <NavLink href="/servers" label="Servers" />
          <NavLink href="/tasks" label="Tasks" />
          <NavLink href="/attendance" label="Attendance" active={true} />
          <NavLink href="/leaves" label="Leaves" />
          <NavLink href="/announcements" label="Announcements" />
          <NavLink href="/shifts" label="Shifts" />
          <NavLink href="/maintenance" label="Maintenance" />
          <NavLink href="/notifications" label="Notifications" />
          <NavLink href="/docs" label="Documentation" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-brand-light mb-2">📍 Attendance Tracking</h2>
          <p className="text-brand-accent text-lg font-light">Track staff check-in, check-out, and working hours</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Present" value={attendanceStats.present.toString()} icon="✅" />
          <StatCard label="Absent" value={attendanceStats.absent.toString()} icon="❌" />
          <StatCard label="On Leave" value={attendanceStats.onLeave.toString()} icon="🏖️" />
          <StatCard label="Half Day" value={attendanceStats.halfDay.toString()} icon="⏰" />
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                📅 Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                🔍 Search Staff
              </label>
              <input
                type="text"
                placeholder="Staff name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                📊 Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            {canCheckInOut(userRole) && (
            <div className="flex items-end">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                {showForm ? '✕ Cancel' : '➕ Add Record'}
              </button>
            </div>
            )}
          </div>

          {canCheckInOut(userRole) && showForm && (
            <div className="bg-brand-dark/50 rounded-lg border border-brand-border p-6 mb-6">
              <h3 className="text-xl font-bold text-brand-light mb-5">➕ Add Attendance Record</h3>
              <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Staff Name</label>
                  <input
                    type="text"
                    value={newRecord.staffName}
                    onChange={(e) => setNewRecord({...newRecord, staffName: e.target.value})}
                    placeholder="Enter staff name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Status</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({...newRecord, status: e.target.value as AttendanceRecord['status']})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Check In Time</label>
                  <input
                    type="time"
                    value={newRecord.checkInTime || ''}
                    onChange={(e) => setNewRecord({...newRecord, checkInTime: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Check Out Time</label>
                  <input
                    type="time"
                    value={newRecord.checkOutTime || ''}
                    onChange={(e) => setNewRecord({...newRecord, checkOutTime: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  />
                </div>

                <button type="submit" className="md:col-span-2 bg-brand-gold text-brand-dark font-bold py-2 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  ➕ Add Record
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">👤 Staff Name</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">📍 Check In</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">📍 Check Out</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">⏱️ Hours</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">📊 Status</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">🎯 Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-brand-border/30 hover:bg-brand-dark/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold text-brand-light">{record.staffName}</td>
                    <td className="py-4 px-4 text-brand-accent font-mono">{record.checkInTime || '-'}</td>
                    <td className="py-4 px-4 text-brand-accent font-mono">{record.checkOutTime || '-'}</td>
                    <td className="py-4 px-4 text-brand-accent">{record.hoursWorked ? `${record.hoursWorked.toFixed(1)} hrs` : '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {canUserDelete(userRole) && (
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-brand-accent mt-6">
            Showing {filtered.length} of {todayRecords.length} records for {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm uppercase tracking-widest font-semibold transition border-b-2 pb-2 ${
        active
          ? 'text-brand-gold border-brand-gold'
          : 'text-brand-accent border-transparent hover:text-brand-gold hover:border-brand-gold'
      }`}
    >
      {label}
    </Link>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-brand-primary border border-brand-border rounded p-6 hover:border-brand-gold/50 transition">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-brand-accent text-xs uppercase tracking-widest font-light mb-2">{label}</p>
      <p className="text-3xl font-bold text-brand-gold">{value}</p>
    </div>
  );
}
