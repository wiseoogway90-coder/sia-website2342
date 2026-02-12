'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

type Announcement = {
  id: number;
  title: string;
  category: string;
  date: string;
  content: string;
  author: string;
};

const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'New Flight Route Opened',
    category: 'Operations',
    date: '2024-02-11',
    content: 'We are excited to announce the opening of a new roblox airline route. All crew members should review the new procedures.',
    author: 'Admin',
  },
  {
    id: 2,
    title: 'Maintenance Scheduled',
    category: 'Maintenance',
    date: '2024-02-09',
    content: 'Server maintenance will be performed on February 15th from 2AM to 4AM UTC. Please plan accordingly.',
    author: 'Tech Team',
  },
  {
    id: 3,
    title: 'Staff Training Program',
    category: 'Training',
    date: '2024-02-08',
    content: 'New staff training program is now available. All new hires must complete within 7 days of joining.',
    author: 'HR Department',
  },
  {
    id: 4,
    title: 'Performance Rewards',
    category: 'Rewards',
    date: '2024-02-05',
    content: 'Top performers for January have been selected for special rewards and recognition. Congratulations!',
    author: 'Management',
  },
  {
    id: 5,
    title: 'Emergency Procedures Update',
    category: 'Safety',
    date: '2024-02-01',
    content: 'Emergency procedures have been updated. All staff must review and confirm understanding by February 10th.',
    author: 'Safety Officer',
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    if (typeof window === 'undefined') return defaultAnnouncements;
    try {
      const saved = localStorage.getItem('sqAnnouncements');
      return saved ? JSON.parse(saved) : defaultAnnouncements;
    } catch {
      return defaultAnnouncements;
    }
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    category: 'Operations',
    content: '',
    author: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
    localStorage.setItem('sqAnnouncements', JSON.stringify(announcements));
  }, [announcements]);

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.title && newAnnouncement.content && newAnnouncement.author) {
      const announcement: Announcement = {
        id: Date.now(),
        ...newAnnouncement,
        date: new Date().toISOString().split('T')[0],
      };
      setAnnouncements([announcement, ...announcements]);
      setNewAnnouncement({ title: '', category: 'Operations', content: '', author: '' });
      setShowForm(false);
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const categories = ['All', ...new Set(announcements.map((a) => a.category))];

  const filtered =
    selectedCategory === 'All'
      ? announcements
      : announcements.filter((a) => a.category === selectedCategory);

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
          <NavLink href="/leaves" label="Leaves" />
          <NavLink href="/announcements" label="Announcements" active={true} />
          <NavLink href="/shifts" label="Shifts" />
          <NavLink href="/maintenance" label="Maintenance" />
          <NavLink href="/notifications" label="Notifications" />
          <NavLink href="/docs" label="Documentation" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 space-y-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-brand-light mb-2">📢 Announcements</h2>
          <p className="text-brand-accent text-lg font-light">Latest news and updates</p>
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm uppercase tracking-wider transition ${
                    selectedCategory === category
                      ? 'bg-brand-gold text-brand-dark'
                      : 'bg-brand-dark/50 text-brand-accent border border-brand-border hover:border-brand-gold hover:text-brand-gold'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {canUserCreate(userRole) && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider text-sm whitespace-nowrap"
              >
                {showForm ? '✕ Cancel' : '➕ New'}
              </button>
            )}
          </div>

          {showForm && canUserCreate(userRole) && (
            <div className="bg-brand-dark/50 rounded-lg border border-brand-border p-6 mb-6">
              <h3 className="text-xl font-bold text-brand-light mb-5">📝 Create New Announcement</h3>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Title</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      placeholder="Announcement title"
                      className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Category</label>
                    <select
                      value={newAnnouncement.category}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                      className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition appearance-none cursor-pointer"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Training">Training</option>
                      <option value="Rewards">Rewards</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Author</label>
                  <input
                    type="text"
                    value={newAnnouncement.author}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Content</label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Write your announcement here..."
                    rows={4}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  ✅ Post Announcement
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((announcement) => (
              <AnnouncementCard key={announcement.id} item={announcement} onDelete={handleDeleteAnnouncement} canDelete={canUserDelete(userRole)} />
            ))}
          </div>
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

function AnnouncementCard({
  item,
  onDelete,
  canDelete,
}: {
  item: Announcement;
  onDelete: (id: number) => void;
  canDelete: boolean;
}) {
  const categoryEmoji: { [key: string]: string } = {
    Operations: '⚙️',
    Maintenance: '🔧',
    Training: '📚',
    Rewards: '🏆',
    Safety: '⚠️',
  };

  return (
    <div className="bg-brand-dark/50 border border-brand-border/50 rounded-lg p-6 hover:border-brand-gold/30 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-light">{item.title}</h3>
          <span className="text-xs uppercase tracking-widest text-brand-accent mt-1 inline-block">
            {categoryEmoji[item.category] || '📌'} {item.category}
          </span>
        </div>
      </div>

      <p className="text-brand-light/80 mb-6 leading-relaxed">{item.content}</p>

      <div className="flex justify-between items-center text-sm border-t border-brand-border/30 pt-4">
        <div className="flex gap-6">
          <span className="text-brand-accent">👤 {item.author}</span>
          <span className="text-brand-accent">📅 {new Date(item.date).toLocaleDateString()}</span>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(item.id)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded text-xs transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
