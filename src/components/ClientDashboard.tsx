'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Captured error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-light p-6">
          <div className="bg-brand-primary border border-brand-border rounded-lg p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-brand-gold mb-4">Internal error</h2>
            <p className="text-sm text-brand-accent mb-4">An unexpected error occurred. Details (copy for debugging):</p>
            <pre className="text-xs bg-black/20 p-3 rounded text-brand-accent overflow-auto max-h-48">{String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}</pre>
            <div className="mt-4 flex gap-3">
              <button onClick={() => location.reload()} className="px-4 py-2 bg-brand-gold text-brand-dark rounded">Reload</button>
              <button onClick={() => { localStorage.clear(); location.reload(); }} className="px-4 py-2 border border-brand-gold text-brand-gold rounded">Clear Storage</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default function ClientDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'staff'>('staff');
  const [userDepartment, setUserDepartment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'admin' | 'supervisor' | 'staff'>('admin');
  
  // Password change modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Login logs state
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [showLoginLogs, setShowLoginLogs] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sqToken');
    const savedUsername = localStorage.getItem('sqUsername');
    const savedRole = localStorage.getItem('sqRole');
    const savedDepartment = localStorage.getItem('sqDepartment');
    
    if (token && savedUsername) {
      setUsername(savedUsername);
      setUserRole((savedRole as 'admin' | 'supervisor' | 'staff') || 'staff');
      setUserDepartment(savedDepartment || '');
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      if (!username || !discordUsername || !password) {
        setLoginError('Username, Discord username, and password are required');
        setIsLoginLoading(false);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username,
          discordUsername,
          password,
          category: selectedCategory
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setLoginError(data.message);
        setIsLoginLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('sqToken', data.token);
      localStorage.setItem('sqUsername', data.user.username);
      localStorage.setItem('sqUserName', data.user.name);
      localStorage.setItem('sqEmail', data.user.email);
      localStorage.setItem('sqRole', data.user.role);
      localStorage.setItem('sqDepartment', data.user.department);

      setUsername(data.user.username);
      setUserRole(data.user.role);
      setUserDepartment(data.user.department);
      setIsLoggedIn(true);
      setPassword('');
    } catch (error) {
      setLoginError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sqToken');
    localStorage.removeItem('sqUsername');
    localStorage.removeItem('sqUserName');
    localStorage.removeItem('sqEmail');
    localStorage.removeItem('sqRole');
    localStorage.removeItem('sqDepartment');
    setIsLoggedIn(false);
    setPassword('');
    setUsername('');
    setDiscordUsername('');
    setUserRole('staff');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword === oldPassword) {
      setChangePasswordError('New password must be different from old password');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setChangePasswordError(data.message);
        setIsChangingPassword(false);
        return;
      }

      setChangePasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePasswordSuccess('');
      }, 2000);
    } catch (error) {
      setChangePasswordError('Network error. Please try again.');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      const token = localStorage.getItem('sqToken');
      const response = await fetch('/api/auth/login-logs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setLoginLogs(data.logs || []);
        setShowLoginLogs(true);
      }
    } catch (error) {
      console.error('Error fetching login logs:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-brand-light text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md px-4 z-10">
          <div className="bg-brand-primary border border-brand-border rounded-lg p-12 backdrop-blur-lg animate-fade-in">
            <div className="text-center mb-12">
              <img src="/logos/singapore-airlines-logo-960.png" alt="Singapore Airlines" className="mx-auto mb-4 h-12 object-contain" />
              <h2 className="text-2xl font-light text-brand-light mb-4">Singapore Airlines</h2>
              <p className="text-brand-accent font-light text-sm uppercase tracking-widest">Roblox Operations</p>
              <div className="h-px bg-brand-gold/30 my-8"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded text-sm">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-brand-gold mb-3 uppercase tracking-widest">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as 'admin' | 'supervisor' | 'staff');
                    setUsername('');
                    setDiscordUsername('');
                    setPassword('');
                  }}
                  disabled={isLoginLoading}
                  className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border rounded text-brand-light focus:outline-none focus:border-brand-gold transition disabled:opacity-50 cursor-pointer"
                >
                  <option value="admin" className="bg-brand-dark text-brand-light">
                    👤 ADMIN
                  </option>
                  <option value="supervisor" className="bg-brand-dark text-brand-light">
                    👥 SUPERVISOR
                  </option>
                  <option value="staff" className="bg-brand-dark text-brand-light">
                    🔐 STAFF
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gold mb-3 uppercase tracking-widest">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedCategory === 'admin' ? 'e.g., admin' :
                    selectedCategory === 'supervisor' ? 'e.g., supervisor or jane.smith' :
                    'e.g., staff, john.doe, or aizen'
                  }
                  disabled={isLoginLoading}
                  className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gold mb-3 uppercase tracking-widest">Discord Username</label>
                <input
                  type="text"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="Enter any Discord username"
                  disabled={isLoginLoading}
                  className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-gold mb-3 uppercase tracking-widest">
                  Password
                  <span className="ml-2 text-brand-accent text-xs font-normal">
                    {selectedCategory === 'admin' && '(admin0786)'}
                    {selectedCategory === 'supervisor' && '(supervisor8654)'}
                    {selectedCategory === 'staff' && '(staff1921)'}
                  </span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={isLoginLoading}
                  className="w-full px-4 py-3 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoginLoading}
                className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded hover:bg-yellow-400 transition duration-300 uppercase tracking-wider mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-brand-border">
              <p className="text-center text-brand-accent text-xs uppercase tracking-widest font-light mb-4">📋 Test Credentials by Category:</p>
              <div className="space-y-3 text-xs text-brand-accent">
                <div className="text-center bg-red-900/20 border border-red-600/30 rounded p-3">
                  <p className="text-red-400 font-semibold mb-2">👤 ADMIN Category</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Username:</strong> <span className="text-brand-gold font-mono">admin</span></p>
                    <p><strong>Discord Username:</strong> <span className="text-brand-gold font-mono">adminuser</span> (any format)</p>
                    <p className="mt-2"><strong>Password:</strong> <span className="text-brand-gold font-mono">admin0786</span></p>
                  </div>
                </div>
                <div className="text-center bg-blue-900/20 border border-blue-600/30 rounded p-3">
                  <p className="text-blue-400 font-semibold mb-2">👥 SUPERVISOR Category</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Username:</strong> <span className="text-brand-gold font-mono">supervisor</span> or <span className="text-brand-gold font-mono">jane.smith</span></p>
                    <p><strong>Discord Username:</strong> Any format (any text)</p>
                    <p className="mt-2"><strong>Password:</strong> <span className="text-brand-gold font-mono">supervisor8654</span></p>
                  </div>
                </div>
                <div className="text-center bg-green-900/20 border border-green-600/30 rounded p-3">
                  <p className="text-green-400 font-semibold mb-2">🔐 STAFF Category</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Username:</strong> <span className="text-brand-gold font-mono">staff</span>, <span className="text-brand-gold font-mono">john.doe</span>, or <span className="text-brand-gold font-mono">aizen</span></p>
                    <p><strong>Discord Username:</strong> Any format (any text)</p>
                    <p className="mt-2"><strong>Password:</strong> <span className="text-brand-gold font-mono">staff1921</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div data-client-dashboard className="min-h-screen bg-brand-dark text-brand-light">
        <header className="border-b border-brand-border bg-brand-primary/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/logos/singapore-airlines-logo-960.png" alt="Logo" className="h-8 object-contain" />
              <div>
                <h1 className="text-3xl font-bold text-brand-gold tracking-wider">SQ</h1>
                <p className="text-brand-accent text-xs uppercase tracking-widest font-light">Staff Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-brand-accent">
                Signed in as <span className="text-brand-light font-semibold">{username}</span>
                {userRole && (
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                    userRole === 'admin' ? 'bg-red-900/30 text-red-400' :
                    userRole === 'supervisor' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {userRole.toUpperCase()}
                  </span>
                )}
              </div>
              <button onClick={() => setShowChangePassword(true)} className="px-3 py-2 border border-brand-border rounded text-sm text-brand-accent hover:border-brand-gold">Change Password</button>
              {userRole === 'admin' && (
                <button onClick={fetchLoginLogs} className="px-3 py-2 border border-brand-border rounded text-sm text-brand-accent hover:border-brand-gold">📊 Login Logs</button>
              )}
              <button onClick={handleLogout} className="px-3 py-2 border border-brand-border rounded text-sm text-brand-accent hover:border-brand-gold">Sign out</button>
            </div>
          </div>
        </header>

        <nav className="border-b border-brand-border bg-brand-primary/30 overflow-x-auto">
          <div className="min-w-max mx-auto px-8 py-4 flex gap-6 flex-wrap">
            <Link href="/" className="text-sm text-brand-gold font-semibold whitespace-nowrap">Dashboard</Link>
            <Link href="/staff" className="text-sm text-brand-accent whitespace-nowrap">Staff</Link>
            <Link href="/servers" className="text-sm text-brand-accent whitespace-nowrap">Servers</Link>
            <Link href="/tasks" className="text-sm text-brand-accent whitespace-nowrap">Tasks</Link>
            <Link href="/attendance" className="text-sm text-brand-accent whitespace-nowrap">Attendance</Link>
            <Link href="/leaves" className="text-sm text-brand-accent whitespace-nowrap">Leaves</Link>
            <Link href="/announcements" className="text-sm text-brand-accent whitespace-nowrap">Announcements</Link>
            <Link href="/shifts" className="text-sm text-brand-accent whitespace-nowrap">Shifts</Link>
            <Link href="/maintenance" className="text-sm text-brand-accent whitespace-nowrap">Maintenance</Link>
            <Link href="/notifications" className="text-sm text-brand-accent whitespace-nowrap">Notifications</Link>
            <Link href="/docs" className="text-sm text-brand-accent whitespace-nowrap">Docs</Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-8 py-16 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-brand-light">Welcome back, {username} 👋</h2>
            <p className="text-brand-accent mt-2">Quick overview and links to manage staff, attendance, tasks and more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-brand-primary border border-brand-border rounded p-6">
              <p className="text-sm text-brand-accent uppercase tracking-widest">Staff</p>
              <p className="text-3xl font-bold text-brand-gold">—</p>
              <Link href="/staff" className="text-xs text-brand-accent mt-2 inline-block">Manage staff →</Link>
            </div>
            <div className="bg-brand-primary border border-brand-border rounded p-6">
              <p className="text-sm text-brand-accent uppercase tracking-widest">Attendance (today)</p>
              <AttendanceSummary />
              <Link href="/attendance" className="text-xs text-brand-accent mt-2 inline-block">Open attendance →</Link>
            </div>
            <div className="bg-brand-primary border border-brand-border rounded p-6">
              <p className="text-sm text-brand-accent uppercase tracking-widest">Tasks</p>
              <p className="text-3xl font-bold text-brand-gold">—</p>
              <Link href="/tasks" className="text-xs text-brand-accent mt-2 inline-block">View tasks →</Link>
            </div>
            <ShiftStatusCard />
            <div className="bg-brand-primary border border-brand-border rounded p-6">
              <p className="text-sm text-brand-accent uppercase tracking-widest">Maintenance</p>
              <p className="text-3xl font-bold text-brand-gold">🛠️</p>
              <Link href="/maintenance" className="text-xs text-brand-accent mt-2 inline-block">View logs →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-brand-primary border border-brand-border rounded p-6">
              <p className="text-sm text-brand-accent uppercase tracking-widest">Alerts</p>
              <p className="text-lg font-semibold text-brand-gold mt-2">Check for urgent notifications</p>
              <Link href="/notifications" className="text-xs text-brand-accent mt-2 inline-block">View notifications →</Link>
            </div>
          </div>

          <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-brand-light mb-4">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/staff" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Staff</Link>
              <Link href="/attendance" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Attendance</Link>
              <Link href="/tasks" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Tasks</Link>
              <Link href="/leaves" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Leaves</Link>
              <Link href="/announcements" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Announcements</Link>
              <Link href="/shifts" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Shifts</Link>
              <Link href="/maintenance" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Maintenance</Link>
              <Link href="/notifications" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Notifications</Link>
              <Link href="/docs" className="px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-sm">Docs</Link>
            </div>
          </div>
        </main>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-brand-primary border border-brand-border rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-brand-gold mb-6">Change Password</h2>
              
              {changePasswordSuccess && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-400 rounded text-green-400 text-sm">
                  {changePasswordSuccess}
                </div>
              )}

              {changePasswordError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-400 rounded text-red-400 text-sm">
                  {changePasswordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-gold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2 bg-brand-dark/50 border border-brand-border rounded text-brand-light placeholder-brand-accent/50 focus:outline-none focus:border-brand-gold transition disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 bg-brand-gold text-brand-dark font-bold py-2 rounded hover:bg-yellow-400 transition disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setChangePasswordError('');
                      setChangePasswordSuccess('');
                    }}
                    disabled={isChangingPassword}
                    className="flex-1 border border-brand-border text-brand-accent px-4 py-2 rounded hover:border-brand-gold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Login Logs Modal - Admin Only */}
        {showLoginLogs && userRole === 'admin' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-primary border border-brand-border rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto backdrop-blur-lg">
              <div className="sticky top-0 bg-brand-primary border-b border-brand-border p-6 flex justify-between items-center">
                <h3 className="text-lg font-bold text-brand-gold">📊 Login Activity Log</h3>
                <button
                  onClick={() => setShowLoginLogs(false)}
                  className="text-brand-accent hover:text-brand-gold text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {loginLogs.length === 0 ? (
                  <p className="text-brand-accent text-center py-8">No login activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {loginLogs.map((log) => (
                      <div key={log.id} className="bg-brand-dark/30 border border-brand-border rounded p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-brand-light font-semibold">{log.name}</p>
                          <p className="text-xs text-brand-accent mt-1">
                            Username: <span className="text-brand-gold">{log.username}</span> | Role: <span className={
                              log.role === 'admin' ? 'text-red-400' :
                              log.role === 'supervisor' ? 'text-blue-400' :
                              'text-green-400'
                            }>{log.role.toUpperCase()}</span>
                          </p>
                          <p className="text-xs text-brand-accent mt-1">
                            Login Method: <span className="text-brand-gold">{log.loginType === 'discord' ? '🎮 Discord' : '👤 Username'}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-brand-accent">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-brand-accent">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-brand-border p-6 bg-brand-dark/20 sticky bottom-0">
                <button
                  onClick={() => setShowLoginLogs(false)}
                  className="w-full border border-brand-border text-brand-accent px-4 py-2 rounded hover:border-brand-gold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function AttendanceSummary() {
  const [counts, setCounts] = useState({ present: 0, absent: 0, onLeave: 0, halfDay: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sqAttendance');
      const records = raw ? JSON.parse(raw) : [];
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = records.filter((r: any) => r.date === today);
      setCounts({
        present: todayRecords.filter((r: any) => r.status === 'Present').length,
        absent: todayRecords.filter((r: any) => r.status === 'Absent').length,
        onLeave: todayRecords.filter((r: any) => r.status === 'On Leave').length,
        halfDay: todayRecords.filter((r: any) => r.status === 'Half Day').length,
      });
    } catch (e) {
      setCounts({ present: 0, absent: 0, onLeave: 0, halfDay: 0 });
    }
  }, []);

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <div className="text-brand-accent text-xs">Present</div>
      <div className="text-brand-gold font-bold">{counts.present}</div>
      <div className="text-brand-accent text-xs">Absent</div>
      <div className="text-brand-gold font-bold">{counts.absent}</div>
      <div className="text-brand-accent text-xs">On Leave</div>
      <div className="text-brand-gold font-bold">{counts.onLeave}</div>
      <div className="text-brand-accent text-xs">Half Day</div>
      <div className="text-brand-gold font-bold">{counts.halfDay}</div>
    </div>
  );
}

function ShiftStatusCard() {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(null);

  useEffect(() => {
    try {
      const activeShift = localStorage.getItem('sqActiveShift');
      if (activeShift) {
        setIsShiftActive(true);
        setCurrentStartTime(activeShift);
      }
    } catch (e) {
      console.error('Error loading shift:', e);
    }
  }, []);

  const handleStartShift = () => {
    const now = new Date();
    const startTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    localStorage.setItem('sqActiveShift', startTime);
    setIsShiftActive(true);
    setCurrentStartTime(startTime);
  };

  return (
    <div className="bg-brand-primary border border-brand-border rounded p-6">
      <p className="text-sm text-brand-accent uppercase tracking-widest">Shift Status</p>
      {isShiftActive ? (
        <>
          <p className="text-2xl font-bold text-green-400 mt-2">Active</p>
          <p className="text-xs text-brand-accent mt-2">Since {currentStartTime}</p>
          <Link href="/shifts" className="text-xs text-brand-accent mt-2 inline-block">Manage shift →</Link>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-brand-gold mt-2">Idle</p>
          <button 
            onClick={handleStartShift}
            className="mt-4 w-full px-3 py-2 bg-brand-gold text-brand-dark rounded font-semibold text-xs hover:bg-yellow-400 transition"
          >
            Start Shift
          </button>
        </>
      )}
    </div>
  );
}
