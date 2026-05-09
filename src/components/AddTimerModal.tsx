'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTimers } from '@/lib/TimerContext';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getDefaultName(hours: number, minutes: number, seconds: number) {
  if (hours > 0) return `${hours}h Timer`;
  if (minutes > 0) return `${minutes}m Timer`;
  if (seconds > 0) return `${seconds}s Timer`;
  return '';
}

export default function AddTimerModal({ isOpen, onClose }: AddTimerModalProps) {
  const { createTimer } = useTimers();
  const [name, setName] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const duration = h * 3600 + m * 60 + s;
    if (duration > 0) {
      const timerName = name || getDefaultName(h, m, s);
      await createTimer({ name: timerName, duration });
      setName('');
      setHours('');
      setMinutes('');
      setSeconds('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card rounded-3xl p-6 w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-medium">Add Timer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Timer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional (auto-generated)"
              className="w-full bg-[#2a2b2d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Hours</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-[#2a2b2d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Min</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="5"
                min="0"
                className="w-full bg-[#2a2b2d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Sec</label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-[#2a2b2d] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
          >
            Create Timer
          </button>
        </form>
      </div>
    </div>
  );
}