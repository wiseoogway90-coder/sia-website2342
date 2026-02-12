'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

interface Notification {
  id: string;
  timestamp: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  sender: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    level: 'info' as 'critical' | 'warning' | 'info',
    title: '',
    message: '',
    sender: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
    
    try {
      const raw = localStorage.getItem('sqNotifications');
      const notifs = raw ? JSON.parse(raw) : [];
      setNotifications(notifs);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }, []);

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();

    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('en-US', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      level: formData.level,
      title: formData.title,
      message: formData.message,
      sender: formData.sender,
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('sqNotifications', JSON.stringify(updatedNotifications));

    setFormData({
      level: 'info',
      title: '',
      message: '',
      sender: '',
    });
    setShowForm(false);
  };

  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('sqNotifications', JSON.stringify(updatedNotifications));
  };

  const handleDeleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('sqNotifications', JSON.stringify(updatedNotifications));
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('sqNotifications', JSON.stringify(updatedNotifications));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/30 text-red-400 border-red-600';
      case 'warning':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      case 'info':
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
      default:
        return 'bg-brand-dark/50 text-brand-accent border-brand-border';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <Link href="/maintenance" className="text-sm text-brand-accent">Maintenance</Link>
          <Link href="/notifications" className="text-sm text-brand-gold font-semibold">Notifications</Link>
          <Link href="/docs" className="text-sm text-brand-accent">Docs</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-16 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-brand-light">Alerts & Notifications</h2>
            <p className="text-brand-accent mt-2">Send and view urgent updates and notifications.</p>
            {userRole === 'staff' && (
              <p className="text-yellow-400 text-sm mt-2">📖 View-only mode (Staff cannot send alerts)</p>
            )}
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm hover:border-brand-gold transition"
              >
                Mark all as read
              </button>
            )}
            {canUserCreate(userRole) && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-yellow-400 transition"
              >
                {showForm ? 'Cancel' : '+ Send Alert'}
              </button>
            )}
          </div>
        </div>

        {/* Send Alert Form */}
        {showForm && canUserCreate(userRole) && (
          <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
            <h3 className="text-xl font-bold text-brand-light mb-6">Send Urgent Alert</h3>
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Alert Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as 'critical' | 'warning' | 'info' })}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light focus:outline-none focus:border-brand-gold"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-brand-gold mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.sender}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-brand-gold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Alert title"
                  className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-brand-gold mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Alert message..."
                  rows={4}
                  className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-brand-gold text-brand-dark font-semibold rounded hover:bg-yellow-400 transition"
              >
                Send Alert
              </button>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
          <h3 className="text-xl font-bold text-brand-light mb-6">
            Notifications ({notifications.length}){unreadCount > 0 && ` - ${unreadCount} unread`}
          </h3>

          {notifications.length === 0 ? (
            <p className="text-brand-accent">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded p-4 transition ${
                    notification.read
                      ? 'bg-brand-dark/30 border-brand-border'
                      : `${getLevelColor(notification.level)} border-opacity-50`
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getLevelIcon(notification.level)}</span>
                        <h4 className="text-lg font-semibold text-brand-light">{notification.title}</h4>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-brand-gold text-brand-dark text-xs rounded font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-brand-accent text-sm mb-2">{notification.message}</p>
                      <div className="text-xs text-brand-accent space-y-1">
                        <p>From: {notification.sender}</p>
                        <p>Time: {notification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 rounded transition"
                        >
                          Mark Read
                        </button>
                      )}
                      {canUserDelete(userRole) && (
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="px-3 py-1 text-xs text-red-400 hover:text-red-300 transition"
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
