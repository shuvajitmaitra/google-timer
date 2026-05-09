'use client';

import React, { useState } from 'react';
import { useTimerContext } from '@/lib/TimerContext';
import { X } from 'lucide-react';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTimerModal({ isOpen, onClose }: AddTimerModalProps) {
  const { dispatch } = useTimerContext();
  const [name, setName] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Calculate total duration roughly to check if > 0
    const hrs = parseInt(hours) || 0;
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;

    if (hrs === 0 && mins === 0 && secs === 0) {
      alert("Please set a duration greater than 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Timer', hours: hrs, minutes: mins, seconds: secs }),
      });
      const data = await res.json();
      if (data._id) {
        dispatch({ type: 'ADD_TIMER', payload: data });
        onClose();
        // Reset form
        setName('');
        setHours('0');
        setMinutes('0');
        setSeconds('0');
      } else {
        alert(data.error || 'Failed to create timer');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f0f12] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <h2 className="text-xl font-medium text-white/90">Create New Timer</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-500 uppercase mb-3">Timer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Work"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-500 uppercase mb-3">Duration</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-3 text-center rounded-xl border border-white/10 bg-white/5 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
                />
                <span className="block text-center text-[10px] text-gray-500 mt-2 uppercase tracking-wide font-mono">Hours</span>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-4 py-3 text-center rounded-xl border border-white/10 bg-white/5 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
                />
                <span className="block text-center text-[10px] text-gray-500 mt-2 uppercase tracking-wide font-mono">Mins</span>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full px-4 py-3 text-center rounded-xl border border-white/10 bg-white/5 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-lg"
                />
                <span className="block text-center text-[10px] text-gray-500 mt-2 uppercase tracking-wide font-mono">Secs</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 tracking-tight cursor-pointer"
            >
              {loading ? 'INITIALIZING...' : 'START TIMER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
