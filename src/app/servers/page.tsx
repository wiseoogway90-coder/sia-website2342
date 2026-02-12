'use client';

import Link from 'next/link';

const servers = [
  {
    id: 1,
    name: 'Main Server',
    ip: '192.168.1.100',
    status: 'Online',
    uptime: '45 days 3 hours',
    cpu: 45,
    memory: 62,
    network: 28,
    players: 254,
    maxPlayers: 500,
  },
  {
    id: 2,
    name: 'Backup Server',
    ip: '192.168.1.101',
    status: 'Online',
    uptime: '42 days 15 hours',
    cpu: 38,
    memory: 51,
    network: 22,
    players: 0,
    maxPlayers: 500,
  },
  {
    id: 3,
    name: 'Development Server',
    ip: '192.168.1.102',
    status: 'Online',
    uptime: '8 days 10 hours',
    cpu: 25,
    memory: 44,
    network: 15,
    players: 12,
    maxPlayers: 100,
  },
  {
    id: 4,
    name: 'Database Server',
    ip: '192.168.1.103',
    status: 'Online',
    uptime: '89 days 4 hours',
    cpu: 60,
    memory: 75,
    network: 35,
    players: 0,
    maxPlayers: 0,
  },
];

export default function ServersPage() {
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
          <NavLink href="/servers" label="Servers" active={true} />
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
          <h2 className="text-4xl font-bold text-brand-light mb-2">🖥️ Server Status</h2>
          <p className="text-brand-accent text-lg font-light">Monitor all Roblox servers and resources</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Servers" value="4" icon="🖥️" />
          <StatCard label="Online" value="4" icon="🟢" />
          <StatCard label="Active Players" value="266" icon="👥" />
          <StatCard label="Avg Uptime" value="46 days" icon="⏳" />
        </div>

        <div className="bg-brand-primary border border-brand-border rounded-2xl p-8">
          <div className="space-y-6">
            {servers.map((server) => (
              <ServerCard key={server.id} server={server} />
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

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-brand-primary border border-brand-border rounded p-6 hover:border-brand-gold/50 transition">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-brand-accent text-xs uppercase tracking-widest font-light mb-2">{label}</p>
      <p className="text-3xl font-bold text-brand-gold">{value}</p>
    </div>
  );
}

function ServerCard({ server }: { server: (typeof servers)[0] }) {
  return (
    <div className="bg-brand-dark/50 border border-brand-border/50 rounded-lg p-6 hover:border-brand-gold/30 transition">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-bold text-brand-light">{server.name}</h3>
          <p className="text-brand-accent text-sm mt-2">🌐 <span className="font-mono">{server.ip}</span></p>
        </div>
        <div>
          <span
            className={`px-4 py-2 rounded-full font-bold text-sm inline-block ${
              server.status === 'Online'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {server.status === 'Online' ? '🟢 ' : '⚫ '}{server.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-brand-accent text-xs uppercase tracking-widest mb-1">Uptime</p>
          <p className="text-brand-gold font-semibold">{server.uptime}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 pb-6 border-b border-brand-border/30">
        <MetricBar label="💻 CPU" value={server.cpu} />
        <MetricBar label="💾 Memory" value={server.memory} />
        <MetricBar label="📡 Network" value={server.network} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-accent font-light mb-2">👥 Players</p>
          <p className="text-lg font-bold text-brand-gold">{server.players}/{server.maxPlayers}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-accent font-light mb-2">⚡ Load</p>
          <p className="text-lg font-bold text-brand-gold">{Math.round((server.cpu + server.memory) / 2)}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-accent font-light mb-2">🔌 Health</p>
          <p className={`text-lg font-bold ${server.cpu > 80 || server.memory > 80 ? 'text-red-400' : server.cpu > 60 || server.memory > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
            {server.cpu > 80 || server.memory > 80 ? 'Warning' : server.cpu > 60 || server.memory > 60 ? 'Caution' : 'Good'}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color =
    value > 80
      ? 'bg-red-500'
      : value > 60
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-brand-light">{label}</span>
        <span className={`text-sm font-bold ${value > 80 ? 'text-red-400' : value > 60 ? 'text-yellow-400' : 'text-green-400'}`}>{value}%</span>
      </div>
      <div className="w-full bg-brand-dark/50 rounded-full h-2 overflow-hidden border border-brand-border/20">
        <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
