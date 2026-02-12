'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

type LeaveRequest = {
  id: number;
  staffName: string;
  leaveType: 'Annual' | 'Sick' | 'Emergency' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedDate: string;
  approvedBy?: string;
};

const defaultLeaves: LeaveRequest[] = [
  {
    id: 1,
    staffName: 'Sarah Chen',
    leaveType: 'Annual',
    startDate: '2026-02-15',
    endDate: '2026-02-19',
    daysRequested: 5,
    reason: 'Vacation',
    status: 'Approved',
    requestedDate: '2026-01-30',
    approvedBy: 'Michael Torres',
  },
  {
    id: 2,
    staffName: 'Emma Watson',
    leaveType: 'Sick',
    startDate: '2026-02-11',
    endDate: '2026-02-12',
    daysRequested: 2,
    reason: 'Medical appointment',
    status: 'Approved',
    requestedDate: '2026-02-10',
    approvedBy: 'Lisa Anderson',
  },
  {
    id: 3,
    staffName: 'David Kim',
    leaveType: 'Annual',
    startDate: '2026-03-01',
    endDate: '2026-03-10',
    daysRequested: 10,
    reason: 'Visit family',
    status: 'Pending',
    requestedDate: '2026-02-08',
  },
];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    if (typeof window === 'undefined') return defaultLeaves;
    try {
      const saved = localStorage.getItem('sqLeaves');
      return saved ? JSON.parse(saved) : defaultLeaves;
    } catch {
      return defaultLeaves;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newLeave, setNewLeave] = useState<Omit<LeaveRequest, 'id' | 'daysRequested' | 'requestedDate' | 'approvedBy'> & { daysRequested?: number }>({
    staffName: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    daysRequested: 0,
    reason: '',
    status: 'Pending',
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem('sqLeaves', JSON.stringify(leaves));
  }, [leaves]);

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLeave.staffName && newLeave.startDate && newLeave.endDate) {
      const start = new Date(newLeave.startDate);
      const end = new Date(newLeave.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const leaveRequest: LeaveRequest = {
        id: Date.now(),
        ...newLeave,
        daysRequested: days,
        requestedDate: new Date().toISOString().split('T')[0],
      };
      setLeaves([...leaves, leaveRequest]);
      setNewLeave({
        staffName: '',
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        daysRequested: 0,
        reason: '',
        status: 'Pending',
      });
      setShowForm(false);
    }
  };

  const handleDeleteLeave = (id: number) => {
    setLeaves(leaves.filter(l => l.id !== id));
  };

  const handleUpdateStatus = (id: number, newStatus: LeaveRequest['status'], approver: string = '') => {
    setLeaves(leaves.map(l => 
      l.id === id 
        ? {...l, status: newStatus, approvedBy: newStatus === 'Approved' ? approver : undefined} 
        : l
    ));
  };

  const filtered = leaves.filter((leave) => {
    const matchesSearch = 
      leave.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || leave.status === filterStatus;
    const matchesType = filterType === 'All' || leave.leaveType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const leaveStats = {
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Approved': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch(type) {
      case 'Annual': return 'bg-blue-500/20 text-blue-400';
      case 'Sick': return 'bg-red-500/20 text-red-400';
      case 'Emergency': return 'bg-orange-500/20 text-orange-400';
      case 'Maternity': return 'bg-pink-500/20 text-pink-400';
      case 'Unpaid': return 'bg-gray-500/20 text-gray-400';
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
          <NavLink href="/attendance" label="Attendance" />
          <NavLink href="/leaves" label="Leaves" active={true} />
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
          <h2 className="text-4xl font-bold text-brand-light mb-2">🏖️ Leave Management</h2>
          <p className="text-brand-accent text-lg font-light">Request and approve staff leave</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Pending" value={leaveStats.pending.toString()} icon="⏳" />
          <StatCard label="Approved" value={leaveStats.approved.toString()} icon="✅" />
          <StatCard label="Rejected" value={leaveStats.rejected.toString()} icon="❌" />
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Staff name or reason..."
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
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                📋 Leave Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition appearance-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Emergency">Emergency</option>
                <option value="Maternity">Maternity</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                {showForm ? '✕ Cancel' : '➕ New Request'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-brand-dark/50 rounded-lg border border-brand-border p-6 mb-6">
              <h3 className="text-xl font-bold text-brand-light mb-5">➕ Request Leave</h3>
              <form onSubmit={handleAddLeave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Staff Name</label>
                  <input
                    type="text"
                    value={newLeave.staffName}
                    onChange={(e) => setNewLeave({...newLeave, staffName: e.target.value})}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Leave Type</label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value as LeaveRequest['leaveType']})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">End Date</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Reason</label>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                    placeholder="Reason for leave request..."
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition resize-none h-16"
                  />
                </div>

                <button type="submit" className="md:col-span-2 bg-brand-gold text-brand-dark font-bold py-2 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  ➕ Submit Request
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((leave) => (
              <div key={leave.id} className="bg-brand-dark/50 border border-brand-border/50 rounded-lg p-6 hover:border-brand-gold/30 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-light">{leave.staffName}</h3>
                    <p className="text-brand-accent text-sm mt-1">📝 {leave.reason}</p>
                  </div>
                  {canUserDelete(userRole) && (
                    <button
                      onClick={() => handleDeleteLeave(leave.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">📅 From</span>
                    <p className="text-brand-light font-semibold mt-1">{new Date(leave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">📅 To</span>
                    <p className="text-brand-light font-semibold mt-1">{new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">📊 Days</span>
                    <p className="text-brand-light font-semibold mt-1">{leave.daysRequested} days</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">📋 Type</span>
                    <p className={`text-sm font-bold mt-1 px-3 py-1 rounded inline-block ${getLeaveTypeColor(leave.leaveType)}`}>
                      {leave.leaveType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
                      <button
                        key={status}
                        disabled={!canUserCreate(userRole)}
                        onClick={() => handleUpdateStatus(leave.id, status, 'Manager')}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                          leave.status === status
                            ? 'bg-brand-gold text-brand-dark'
                            : `bg-brand-dark/50 text-brand-accent border border-brand-border hover:border-brand-gold`
                        } ${!canUserCreate(userRole) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <span className={`px-3 py-2 rounded-full text-xs font-bold ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                {leave.approvedBy && (
                  <p className="text-brand-accent text-xs mt-3">✓ Approved by {leave.approvedBy}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-brand-accent mt-6">
            Showing {filtered.length} of {leaves.length} leave requests
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
