import ClientDashboard from '../components/ClientDashboard';

export default function Page() {
  return (
    <main className="min-h-screen bg-brand-dark text-brand-light">
      {/* ClientDashboard is loaded client-side only to avoid SSR chunk mismatches */}
      <ClientDashboard />
    </main>
  );
}

