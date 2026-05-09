'use client';

import React, { useState } from 'react';
import { useTimerContext } from '@/lib/TimerContext';
import { useTimerTick } from '@/hooks/useTimerTick';
import { TimerCard } from '@/components/TimerCard';
import { AddTimerModal } from '@/components/AddTimerModal';
import { Plus } from 'lucide-react';

export default function Home() {
  const { state } = useTimerContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize the global countdown engine
  const { ringingTimerIds, stopAlarm } = useTimerTick();

  return (
    <main className="relative z-10 flex-grow px-6 md:px-12 pb-12 flex flex-col">
      <header className="flex items-center justify-between py-10 mb-8 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-4xl font-light tracking-tighter text-white">CHRONOS<span className="text-blue-500 font-bold ml-1">.</span></h1>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mt-1 font-semibold">Remainder Clock</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex bg-white/5 border border-white/10 px-6 py-3 rounded-full items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono tracking-widest text-white/80">SYNCED TO DB</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full text-sm font-bold tracking-tight shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            + NEW TIMER
          </button>
        </div>
      </header>

      {state.timers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div 
             onClick={() => setIsModalOpen(true)}
             className="bg-white/5 border border-dashed border-white/20 rounded-[32px] p-16 flex flex-col items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-white/[0.07] cursor-pointer transition-all max-w-md w-full">
            <div className="w-20 h-20 rounded-full border border-current flex items-center justify-center mb-6">
              <span className="text-4xl font-light">+</span>
            </div>
            <span className="text-sm tracking-widest font-semibold">CREATE NEW TIMER</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
          {state.timers.map((timer) => (
            <TimerCard
              key={timer._id}
              timer={timer}
              isAlarmRinging={ringingTimerIds.has(timer._id)}
              onStopAlarm={stopAlarm}
            />
          ))}
          <div 
             onClick={() => setIsModalOpen(true)}
             className="bg-white/5 border border-dashed border-white/20 rounded-[32px] p-8 flex flex-col items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-white/[0.07] cursor-pointer transition-all min-h-[360px]">
            <div className="w-20 h-20 rounded-full border border-current flex items-center justify-center mb-4">
              <span className="text-4xl font-light">+</span>
            </div>
            <span className="text-sm tracking-widest font-semibold">CREATE NEW TASK</span>
          </div>
        </div>
      )}

      <AddTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
