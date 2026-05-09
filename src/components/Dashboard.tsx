"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTimers } from "@/lib/TimerContext";
import TimerCard from "./TimerCard";
import AddTimerModal from "./AddTimerModal";
import { useTimerTick } from "@/hooks/useTimerTick";

export default function Dashboard() {
  const { state } = useTimers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useTimerTick();


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

      <div className="flex flex-wrap gap-3 justify-center">
        {state.timers.map((timer) => (
          <TimerCard key={timer._id} timer={timer} />
        ))}
      </div>

      {state.timers.length === 0 && !state.loading && (
        <div className="text-gray-500 text-center mt-20">No timers yet. Click the + button to create one!</div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus size={28} />
      </button>

      <AddTimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </main>
  );
}
