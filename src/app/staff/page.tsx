'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

type Staff = {
  id: number;
  username: string;
  name: string;
  role: string;
  department: string;
  status: 'Online' | 'Offline';
  joinDate: string;
};

const defaultStaff: Staff[] = [
  {
    id: 1,
    username: 'admin',
    name: 'Admin User',
    role: 'Admin',
    department: 'Management',
    status: 'Online',
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    username: 'supervisor',
    name: 'Supervisor User',
    role: 'Supervisor',
    department: 'Operations',
    status: 'Online',
    joinDate: '2023-06-20',
  },
  {
    id: 3,
    username: 'jane.smith',
    name: 'Jane Smith',
    role: 'Supervisor',
    department: 'Catering',
    status: 'Offline',
    joinDate: '2022-11-10',
  },
  {
    id: 4,
    username: 'staff',
    name: 'Staff User',
    role: 'Staff',
    department: 'Crew',
    status: 'Online',
    joinDate: '2023-03-05',
  },
  {
    id: 5,
    username: 'john.doe',
    name: 'John Doe',
    role: 'Staff',
    department: 'Maintenance',
    status: 'Online',
    joinDate: '2023-02-12',
  },
  {
    id: 6,
    username: 'sarah.chen',
    name: 'Sarah Chen',
    role: 'Head Captain',
    department: 'Flight Operations',
    status: 'Online',
    joinDate: '2023-04-18',
  },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(() => {
    if (typeof window === 'undefined') return defaultStaff;
    try {
      const saved = localStorage.getItem('sqStaff');
      return saved ? JSON.parse(saved) : defaultStaff;
    } catch {
      return defaultStaff;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [newStaff, setNewStaff] = useState<{ name: string; role: string; department: string; status: 'Online' | 'Offline' }>({ 
    name: '', 
    role: '', 
    department: 'Flight Operations', 
    status: 'Online' 
  });
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem('sqStaff', JSON.stringify(staff));
  }, [staff]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaff.name && newStaff.role) {
      const staffMember: Staff = {
        id: Date.now(),
        ...newStaff,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setStaff([...staff, staffMember]);
      setNewStaff({ name: '', role: '', department: 'Flight Operations', status: 'Online' });
      setShowForm(false);
    }
  };

  const handleDeleteStaff = (id: number) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const filtered = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      filterDept === 'All' || member.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', ...new Set(staff.map((s) => s.department))];

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
          <NavLink href="/staff" label="Staff" active={true} />
          <NavLink href="/servers" label="Servers" />
          <NavLink href="/tasks" label="Tasks" />
          <NavLink href="/attendance" label="Attendance" />
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
          <h2 className="text-4xl font-bold text-brand-light mb-2">Staff Directory</h2>
          <p className="text-brand-accent text-lg font-light">Manage and view all staff members</p>
          
          <div className="mt-6 p-6 bg-brand-dark/50 border border-brand-border rounded-lg">
            <p className="text-sm text-brand-accent uppercase tracking-widest font-light mb-3">📋 Test Login Usernames Available:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="text-sm"><span className="text-red-400 font-semibold">admin</span> <span className="text-brand-accent">(Admin)</span></div>
              <div className="text-sm"><span className="text-blue-400 font-semibold">supervisor</span> <span className="text-brand-accent">(Supervisor)</span></div>
              <div className="text-sm"><span className="text-blue-400 font-semibold">jane.smith</span> <span className="text-brand-accent">(Supervisor)</span></div>
              <div className="text-sm"><span className="text-green-400 font-semibold">staff</span> <span className="text-brand-accent">(Staff)</span></div>
              <div className="text-sm"><span className="text-green-400 font-semibold">john.doe</span> <span className="text-brand-accent">(Staff)</span></div>
              <div className="text-xs text-brand-accent">All use password: <span className="font-mono">password123</span></div>
            </div>
          </div>
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                🔍 Search Staff
              </label>
              <input
                type="text"
                placeholder="Name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                🏢 Department
              </label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition appearance-none cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              {canUserCreate(userRole) && (
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  {showForm ? '✕ Cancel' : '➕ Add Staff'}
                </button>
              )}
            </div>
          </div>

          {showForm && canUserCreate(userRole) && (
            <div className="bg-brand-dark/50 rounded-lg border border-brand-border p-6 mb-6">
              <h3 className="text-xl font-bold text-brand-light mb-5">➕ Add New Staff Member</h3>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Name</label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Role</label>
                  <input
                    type="text"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    placeholder="Job title"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Department</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  >
                    <option value="Flight Operations">Flight Operations</option>
                    <option value="Cabin Crew">Cabin Crew</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Ground Operations">Ground Operations</option>
                    <option value="Air Traffic">Air Traffic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Status</label>
                  <select
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({...newStaff, status: e.target.value as 'Online' | 'Offline'})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  >
                    <option value="Online">🟢 Online</option>
                    <option value="Offline">⚫ Offline</option>
                  </select>
                </div>
                <button type="submit" className="md:col-span-2 bg-brand-gold text-brand-dark font-bold py-2 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  ➕ Add Staff Member
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">👤 Name</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">� Username</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">�💼 Role</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">🏢 Department</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">🟢 Status</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">📅 Join Date</th>
                  <th className="text-left py-4 px-4 font-bold text-brand-gold uppercase tracking-widest">🎯 Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((staff) => (
                  <tr
                    key={staff.id}
                    className="border-b border-brand-border/30 hover:bg-brand-dark/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold text-brand-light">{staff.name}</td>
                    <td className="py-4 px-4 font-mono text-brand-gold">{staff.username}</td>
                    <td className="py-4 px-4 text-brand-accent">{staff.role}</td>
                    <td className="py-4 px-4 text-brand-accent">{staff.department}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          staff.status === 'Online'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {staff.status === 'Online' ? '🟢 ' : '⚫ '}{staff.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-brand-accent">
                      {new Date(staff.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {canUserDelete(userRole) && (
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
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
            Showing {filtered.length} of {staff.length} staff members
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
