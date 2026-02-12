'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

interface MaintenanceRecord {
  id: string;
  date: string;
  equipment: string;
  type: 'scheduled' | 'unplanned';
  description: string;
  technician: string;
  status: 'completed' | 'pending' | 'in-progress';
  nextDue?: string;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    equipment: '',
    type: 'scheduled' as 'scheduled' | 'unplanned',
    description: '',
    technician: '',
    status: 'pending' as 'completed' | 'pending' | 'in-progress',
    nextDue: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
    
    try {
      const raw = localStorage.getItem('sqMaintenance');
      const maintenanceRecords = raw ? JSON.parse(raw) : [];
      setRecords(maintenanceRecords);
    } catch (e) {
      console.error('Error loading maintenance records:', e);
    }
  }, []);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      equipment: formData.equipment,
      type: formData.type,
      description: formData.description,
      technician: formData.technician,
      status: formData.status,
      nextDue: formData.nextDue,
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('sqMaintenance', JSON.stringify(updatedRecords));

    setFormData({
      equipment: '',
      type: 'scheduled',
      description: '',
      technician: '',
      status: 'pending',
      nextDue: '',
    });
    setShowForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem('sqMaintenance', JSON.stringify(updatedRecords));
  };

  const handleStatusChange = (id: string, newStatus: MaintenanceRecord['status']) => {
    const updatedRecords = records.map(r =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setRecords(updatedRecords);
    localStorage.setItem('sqMaintenance', JSON.stringify(updatedRecords));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-400 border-green-600';
      case 'in-progress':
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      default:
        return 'bg-brand-dark/50 text-brand-accent border-brand-border';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'scheduled'
      ? 'bg-blue-900/20 text-blue-300'
      : 'bg-red-900/20 text-red-300';
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
          <Link href="/shifts" className="text-sm text-brand-accent">Shifts</Link>
          <Link href="/maintenance" className="text-sm text-brand-gold font-semibold">Maintenance</Link>
          <Link href="/notifications" className="text-sm text-brand-accent">Notifications</Link>
          <Link href="/docs" className="text-sm text-brand-accent">Docs</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-brand-light">Maintenance Logs</h2>
            <p className="text-brand-accent mt-2">Track and manage equipment maintenance records.</p>
            {userRole === 'staff' && (
              <p className="text-yellow-400 text-sm mt-2">📖 View-only mode (Staff cannot edit)</p>
            )}
          </div>
          {canUserCreate(userRole) && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-yellow-400 transition"
            >
              {showForm ? 'Cancel' : '+ New Record'}
            </button>
          )}
        </div>

        {/* Add Record Form */}
        {showForm && canUserCreate(userRole) && (
          <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
            <h3 className="text-xl font-bold text-brand-light mb-6">Add Maintenance Record</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Equipment Name</label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="e.g., Aircraft Engine #5"
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Technician</label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    placeholder="Name of technician"
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'scheduled' | 'unplanned' })}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light focus:outline-none focus:border-brand-gold"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="unplanned">Unplanned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'completed' | 'pending' | 'in-progress' })}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light focus:outline-none focus:border-brand-gold"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-brand-gold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Maintenance details..."
                  rows={3}
                  className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-gold mb-2">Next Due Date (Optional)</label>
                <input
                  type="date"
                  value={formData.nextDue}
                  onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                  className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light focus:outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-yellow-400 transition"
              >
                Save Record
              </button>
            </form>
          </div>
        )}

        {/* Records List */}
        <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
          <h3 className="text-xl font-bold text-brand-light mb-6">
            All Records ({records.length})
          </h3>

          {records.length === 0 ? (
            <p className="text-brand-accent">No maintenance records yet.</p>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-brand-dark/50 border border-brand-border rounded p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-brand-light">{record.equipment}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(record.type)}`}>
                          {record.type === 'scheduled' ? 'Scheduled' : 'Unplanned'}
                        </span>
                      </div>
                      <p className="text-sm text-brand-accent mb-2">{record.description}</p>
                      <div className="text-xs text-brand-accent space-y-1">
                        <p>📅 Date: {record.date}</p>
                        <p>👤 Technician: {record.technician}</p>
                        {record.nextDue && <p>⏰ Next Due: {record.nextDue}</p>}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record.id, e.target.value as MaintenanceRecord['status'])}
                        disabled={!canUserCreate(userRole)}
                        className={`px-3 py-1 rounded text-sm border ${getStatusColor(record.status)} bg-opacity-20 focus:outline-none ${!canUserCreate(userRole) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      {canUserDelete(userRole) && (
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="block w-full px-3 py-1 text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
