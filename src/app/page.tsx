import { TimerProvider } from '@/lib/TimerContext';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <TimerProvider>
      <Dashboard />
    </TimerProvider>
  );
}