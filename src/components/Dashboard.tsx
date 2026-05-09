'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTimers } from '@/lib/TimerContext';
import TimerCard from './TimerCard';
import AddTimerModal from './AddTimerModal';
import { useTimerTick } from '@/hooks/useTimerTick';

export default function Dashboard() {
  const { state } = useTimers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);

  useTimerTick();

  useEffect(() => {
    if (!state.loading && state.timers.length > 0) {
      const hasSeenWarning = sessionStorage.getItem('timer-reload-warning');
      if (!hasSeenWarning) {
        setShowReloadWarning(true);
        sessionStorage.setItem('timer-reload-warning', 'true');
      }
    }
  }, [state.loading, state.timers.length]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Loading timers...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-gray-400 text-sm mb-8 tracking-widest uppercase">Google Timer</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.timers.map((timer) => (
          <TimerCard key={timer._id} timer={timer} />
        ))}
      </div>

      {state.timers.length === 0 && !state.loading && (
        <div className="text-gray-500 text-center mt-20">
          No timers yet. Click the + button to create one!
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus size={28} />
      </button>

      <AddTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {showReloadWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card rounded-3xl p-6 w-96">
            <h2 className="text-white text-xl font-medium mb-4">Timer Status</h2>
            <p className="text-gray-400 mb-6">
              Timers are managed locally. Reloading the page will reset all timer progress.
            </p>
            <button
              onClick={() => setShowReloadWarning(false)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
}