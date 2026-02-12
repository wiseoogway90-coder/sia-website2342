'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

type DocItem = { title: string; content: string };
type DocCategory = { title: string; items: DocItem[] };

const defaultDocCategories: DocCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Welcome to SQ Roblox',
        content: 'Learn about the Singapore Airlines Roblox staff portal and how to make the most of it.',
      },
      {
        title: 'Account Setup',
        content: 'Follow this guide to set up your staff account and configure your preferences.',
      },
    ],
  },
  {
    title: 'Flight Operations',
    items: [
      {
        title: 'Pre-Flight Checklist',
        content: 'Complete checklist for all flight operations before departure.',
      },
      {
        title: 'Emergency Procedures',
        content: 'Critical procedures for handling emergency situations during flight.',
      },
      {
        title: 'Navigation Guidelines',
        content: 'Standard navigation procedures and route guidelines for all pilots.',
      },
    ],
  },
  {
    title: 'Cabin Crew',
    items: [
      {
        title: 'Safety Briefing',
        content: 'Complete safety briefing requirements and procedures for cabin crew.',
      },
      {
        title: 'Service Standards',
        content: 'Service quality standards and best practices for passenger interactions.',
      },
      {
        title: 'Equipment Maintenance',
        content: 'Proper care and maintenance of cabin equipment and supplies.',
      },
    ],
  },
  {
    title: 'System Administration',
    items: [
      {
        title: 'Server Management',
        content: 'Guidelines for managing and monitoring server performance.',
      },
      {
        title: 'Database Management',
        content: 'Best practices for database maintenance and data integrity.',
      },
      {
        title: 'Security Protocols',
        content: 'Important security measures and authentication protocols to follow.',
      },
    ],
  },
];

export default function DocsPage() {
  const [categories, setCategories] = useState<DocCategory[]>(() => {
    if (typeof window === 'undefined') return defaultDocCategories;
    try {
      const saved = localStorage.getItem('sqDocs');
      return saved ? JSON.parse(saved) : defaultDocCategories;
    } catch {
      return defaultDocCategories;
    }
  });

  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
  }, []);

  useEffect(() => {
    localStorage.setItem('sqDocs', JSON.stringify(categories));
  }, [categories]);

  // sync edit buffers when selection changes
  useEffect(() => {
    if (selectedDoc) {
      setEditTitle(selectedDoc.title);
      setEditContent(selectedDoc.content);
    } else {
      setEditTitle('');
      setEditContent('');
    }
  }, [selectedDoc]);

  // Category operations
  const addCategory = () => {
    const title = `New Category ${categories.length + 1}`;
    setCategories([...categories, { title, items: [] }]);
  };

  const editCategoryTitle = (index: number, title: string) => {
    const next = [...categories];
    next[index] = { ...next[index], title };
    setCategories(next);
  };

  const deleteCategory = (index: number) => {
    const next = categories.filter((_, i) => i !== index);
    setCategories(next);
    setSelectedDoc(null);
    setSelectedCategoryIndex(null);
  };

  // Item operations
  const addItem = (catIndex: number) => {
    const next = [...categories];
    next[catIndex].items.unshift({ title: 'New Article', content: '' });
    setCategories(next);
    setSelectedCategoryIndex(catIndex);
    setSelectedDoc(next[catIndex].items[0]);
    setIsEditing(true);
  };

  const editItem = (catIndex: number, itemIndex: number, item: DocItem) => {
    const next = [...categories];
    next[catIndex].items[itemIndex] = item;
    setCategories(next);
    setSelectedDoc(item);
  };

  const deleteItem = (catIndex: number, itemIndex: number) => {
    const next = [...categories];
    next[catIndex].items = next[catIndex].items.filter((_, i) => i !== itemIndex);
    setCategories(next);
    setSelectedDoc(null);
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
          <NavLink href="/leaves" label="Leaves" />
          <NavLink href="/announcements" label="Announcements" />
          <NavLink href="/shifts" label="Shifts" />
          <NavLink href="/maintenance" label="Maintenance" />
          <NavLink href="/notifications" label="Notifications" />
          <NavLink href="/docs" label="Documentation" active={true} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-brand-light mb-2">📚 Documentation</h2>
          <p className="text-brand-accent text-lg font-light">Help, guides, and resources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-primary border border-brand-border rounded-lg p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-gold text-lg uppercase tracking-widest">📑 Categories</h2>
                <div className="flex items-center gap-2">
                  {canUserCreate(userRole) && <button onClick={addCategory} className="text-sm bg-brand-gold text-brand-dark px-3 py-1 rounded">Add</button>}
                </div>
              </div>
              {categories.map((category, ci) => (
                <div key={ci} className="mb-4 pb-3 border-b border-brand-border last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      value={category.title}
                      onChange={(e) => editCategoryTitle(ci, e.target.value)}
                      disabled={!canUserCreate(userRole)}
                      className={`w-full bg-transparent text-sm font-semibold text-brand-gold placeholder-brand-accent/50 focus:outline-none ${!canUserCreate(userRole) ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    <div className="ml-2 flex items-center gap-2">
                      {canUserCreate(userRole) && <button onClick={() => addItem(ci)} className="text-xs bg-brand-gold text-brand-dark px-2 py-1 rounded">+ Item</button>}
                      {canUserDelete(userRole) && <button onClick={() => deleteCategory(ci)} className="text-xs text-red-500 px-2 py-1 rounded">Delete</button>}
                    </div>
                  </div>
                  {category.items.map((item, ii) => (
                    <div key={ii} className="flex items-center justify-between mb-1">
                      <button
                        onClick={() => { setSelectedDoc(item); setSelectedCategoryIndex(ci); setIsEditing(false); }}
                        className="block w-full text-left text-sm px-3 py-1 rounded hover:bg-brand-gold/10 hover:text-brand-gold text-brand-accent transition duration-200 font-medium"
                      >
                        {item.title}
                      </button>
                      <div className="ml-2 flex gap-1">
                        {canUserCreate(userRole) && <button onClick={() => { setSelectedDoc(item); setSelectedCategoryIndex(ci); setIsEditing(true); }} className="text-xs px-2 py-1 bg-brand-dark/30 rounded">Edit</button>}
                        {canUserDelete(userRole) && <button onClick={() => deleteItem(ci, ii)} className="text-xs px-2 py-1 text-red-500 rounded">Del</button>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedDoc ? (
              <div className="bg-brand-primary border border-brand-border rounded-lg p-8">
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (selectedCategoryIndex === null) return;
                      const catIdx = selectedCategoryIndex;
                      const cat = categories[catIdx];
                      const itemIndex = cat.items.findIndex((it) => it.title === selectedDoc.title && it.content === selectedDoc.content);
                      const idx = itemIndex >= 0 ? itemIndex : 0;
                      editItem(catIdx, idx, { title: editTitle, content: editContent });
                      setIsEditing(false);
                    }}
                  >
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={!canUserCreate(userRole)}
                      className={`w-full text-2xl font-bold text-brand-gold mb-4 bg-transparent focus:outline-none ${!canUserCreate(userRole) ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={!canUserCreate(userRole)}
                      className={`w-full min-h-[200px] bg-transparent text-brand-light/80 focus:outline-none ${!canUserCreate(userRole) ? 'cursor-not-allowed opacity-50' : ''}`}
                    />
                    <div className="mt-6 flex gap-3">
                      {canUserCreate(userRole) && <button type="submit" className="bg-brand-gold text-brand-dark px-4 py-2 rounded font-semibold">Save</button>}
                      <button type="button" onClick={() => { setIsEditing(false); setEditTitle(selectedDoc.title); setEditContent(selectedDoc.content); }} className="px-4 py-2 border border-brand-border rounded">Cancel</button>
                      {canUserDelete(userRole) && <button type="button" onClick={() => { if (selectedCategoryIndex !== null) { const cat = categories[selectedCategoryIndex]; const idx = cat.items.findIndex((it) => it.title === selectedDoc.title && it.content === selectedDoc.content); if (idx >= 0) deleteItem(selectedCategoryIndex, idx); } }} className="ml-auto text-red-500 px-3 py-2 rounded">Delete</button>}
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-brand-gold mb-2">📖 {selectedDoc.title}</h2>
                    <div className="h-1 w-12 bg-brand-gold rounded-full mb-6"></div>
                    <p className="text-brand-light/80 leading-relaxed text-lg">
                      {selectedDoc.content}
                    </p>
                    <div className="mt-8 pt-6 border-t border-brand-border flex items-center gap-3">
                      <p className="text-xs text-brand-accent uppercase tracking-widest">📅 Last updated: February 2024</p>
                      <div className="ml-auto flex gap-2">
                        {canUserCreate(userRole) && <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-brand-gold text-brand-dark rounded">Edit</button>}
                        {canUserDelete(userRole) && <button onClick={() => { if (selectedCategoryIndex !== null) { const cat = categories[selectedCategoryIndex]; const idx = cat.items.findIndex((it) => it.title === selectedDoc.title && it.content === selectedDoc.content); if (idx >= 0) deleteItem(selectedCategoryIndex, idx); } }} className="px-3 py-1 text-red-500 rounded">Delete</button>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-brand-primary border border-brand-border rounded-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold/10 rounded-lg mb-6 border border-brand-gold/30">
                  <span className="text-4xl">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-light mb-3">
                  Welcome to Documentation
                </h2>
                <p className="text-brand-accent mb-8">
                  Select a topic from the sidebar to view detailed documentation.
                </p>
                <div className="bg-brand-dark/50 rounded-lg p-6 border border-brand-border text-left">
                  <p className="font-bold text-brand-gold mb-4 uppercase tracking-widest">💡 Quick Start Tips:</p>
                  <ul className="text-brand-light/80 space-y-2">
                    <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Review the Getting Started section</li>
                    <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Check Flight Operations for operational procedures</li>
                    <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> See Cabin Crew for service standards</li>
                    <li className="flex items-center gap-2"><span className="text-brand-gold">✓</span> Visit System Administration for tech resources</li>
                  </ul>
                </div>
              </div>
            )}
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
