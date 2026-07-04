import { useState } from 'react';
import { AttendancePage } from './pages/AttendancePage';
import { PeoplePage } from './pages/PeoplePage';
import { Button } from './components/Button';
import { LayoutDashboard, Users } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'attendance' | 'people'>('attendance');

  return (
    <div className="min-h-screen bg-grid-fade">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 text-text">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-sidebar p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary/80">Face logging system</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-text">Attendance and dataset control</h1>
          </div>
          <div className="flex gap-2">
            <Button
              className={view === 'attendance' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-card text-text hover:bg-border'}
              onClick={() => setView('attendance')}
              type="button"
            >
              <LayoutDashboard size={16} />
              Attendance
            </Button>
            <Button
              className={view === 'people' ? 'bg-success text-white hover:bg-success/90' : 'bg-card text-text hover:bg-border'}
              onClick={() => setView('people')}
              type="button"
            >
              <Users size={16} />
              People
            </Button>
          </div>
        </header>

        {view === 'attendance' ? <AttendancePage /> : <PeoplePage />}
      </main>
    </div>
  );
}