'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { canUserCreate, canUserDelete, UserRole } from '@/lib/roleCheck';

type Task = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
  createdDate: string;
};

const defaultTasks: Task[] = [
  {
    id: 1,
    title: 'Flight Crew Training',
    description: 'Complete annual safety training certification',
    assignedTo: 'Sarah Chen',
    assignedBy: 'Michael Torres',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-02-28',
    createdDate: '2026-02-01',
  },
  {
    id: 2,
    title: 'Maintenance Report',
    description: 'Submit monthly aircraft maintenance report',
    assignedTo: 'David Kim',
    assignedBy: 'Lisa Anderson',
    priority: 'High',
    status: 'Not Started',
    dueDate: '2026-02-15',
    createdDate: '2026-02-05',
  },
  {
    id: 3,
    title: 'Ground Services Audit',
    description: 'Audit ground service procedures compliance',
    assignedTo: 'Lisa Anderson',
    assignedBy: 'Sarah Chen',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2026-02-20',
    createdDate: '2026-02-08',
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return defaultTasks;
    try {
      const saved = localStorage.getItem('sqTasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdDate'>>({
    title: '',
    description: '',
    assignedTo: '',
    assignedBy: 'Current Staff',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: '',
  });

  useEffect(() => {
    localStorage.setItem('sqTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const role = localStorage.getItem('sqRole') as UserRole | null;
    setUserRole(role);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.assignedTo && newTask.dueDate) {
      const task: Task = {
        id: Date.now(),
        ...newTask,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        assignedBy: 'Current Staff',
        priority: 'Medium',
        status: 'Not Started',
        dueDate: '',
      });
      setShowForm(false);
    }
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleUpdateStatus = (id: number, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? {...t, status: newStatus} : t));
  };

  const filtered = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Not Started': return 'bg-gray-500/20 text-gray-400';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400';
      case 'Completed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'Not Started').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
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
          <NavLink href="/tasks" label="Tasks" active={true} />
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
          <h2 className="text-4xl font-bold text-brand-light mb-2">📋 Task Management</h2>
          <p className="text-brand-accent text-lg font-light">Assign and track staff tasks and projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Tasks" value={taskStats.total.toString()} icon="📋" />
          <StatCard label="Not Started" value={taskStats.notStarted.toString()} icon="⏳" />
          <StatCard label="In Progress" value={taskStats.inProgress.toString()} icon="⚙️" />
          <StatCard label="Completed" value={taskStats.completed.toString()} icon="✅" />
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                🔍 Search Tasks
              </label>
              <input
                type="text"
                placeholder="Task title or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-gold mb-3 uppercase tracking-widest">
                ⚡ Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-3 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition appearance-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
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
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-end">
              {canUserCreate(userRole) && (
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  {showForm ? '✕ Cancel' : '➕ New Task'}
                </button>
              )}
            </div>
          </div>

          {showForm && canUserCreate(userRole) && (
            <div className="bg-brand-dark/50 rounded-lg border border-brand-border p-6 mb-6">
              <h3 className="text-xl font-bold text-brand-light mb-5">➕ Create New Task</h3>
              <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g., Training Program Update"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Task details and requirements..."
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition resize-none h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Assign To</label>
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    placeholder="Staff name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Assigned By</label>
                  <input
                    type="text"
                    value={newTask.assignedBy}
                    onChange={(e) => setNewTask({...newTask, assignedBy: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-brand-border bg-brand-dark/50 rounded-lg text-brand-light focus:outline-none focus:border-brand-gold transition"
                    required
                  />
                </div>
                <button type="submit" className="md:col-span-2 bg-brand-gold text-brand-dark font-bold py-2 rounded-lg hover:bg-yellow-400 transition duration-300 uppercase tracking-wider">
                  ➕ Create Task
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((task) => (
              <div key={task.id} className="bg-brand-dark/50 border border-brand-border/50 rounded-lg p-6 hover:border-brand-gold/30 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-light">{task.title}</h3>
                    <p className="text-brand-accent text-sm mt-2">{task.description}</p>
                  </div>
                  {canUserDelete(userRole) && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">👤 Assigned To</span>
                    <p className="text-brand-light font-semibold mt-1">{task.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">👨‍💼 Assigned By</span>
                    <p className="text-brand-light font-semibold mt-1">{task.assignedBy}</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">📅 Due Date</span>
                    <p className="text-brand-light font-semibold mt-1">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-brand-accent text-xs uppercase tracking-widest">⚡ Priority</span>
                    <p className={`text-sm font-bold mt-1 px-3 py-1 rounded-full inline-block ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => (
                      <button
                        key={status}
                        disabled={!canUserCreate(userRole)}
                        onClick={() => handleUpdateStatus(task.id, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                          task.status === status
                            ? 'bg-brand-gold text-brand-dark'
                            : `bg-brand-dark/50 text-brand-accent border border-brand-border hover:border-brand-gold`
                        } ${!canUserCreate(userRole) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <span className={`px-3 py-2 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-brand-accent mt-6">
            Showing {filtered.length} of {tasks.length} tasks
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
