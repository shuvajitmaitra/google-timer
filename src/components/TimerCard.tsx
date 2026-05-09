'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Play, Pause, Plus } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { Timer } from '@/types/timer';
import { useTimers } from '@/lib/TimerContext';

interface TimerCardProps {
  timer: Timer;
}

export default function TimerCard({ timer }: TimerCardProps) {
  const { updateTimer, deleteTimer } = useTimers();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCompleted = timer.status === 'completed' && timer.remainingTime === 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: timer._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timer.duration > 0 ? (timer.remainingTime / timer.duration) * 100 : 0;

  const handlePlayPause = useCallback(() => {
    if (timer.status === 'completed') {
      updateTimer(timer._id, { remainingTime: timer.duration, status: 'paused' });
    } else {
      const newStatus = timer.status === 'running' ? 'paused' : 'running';
      updateTimer(timer._id, { status: newStatus });
    }
  }, [timer, updateTimer]);

  const handleAddTime = useCallback(() => {
    const newRemaining = timer.remainingTime + 60;
    const newDuration = timer.duration + 60;
    updateTimer(timer._id, { remainingTime: newRemaining, duration: newDuration });
  }, [timer, updateTimer]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card rounded-3xl p-6 w-72 flex flex-col items-center cursor-grab active:cursor-grabbing ${
        isCompleted ? 'animate-pulse' : ''
      }`}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-gray-300 text-lg font-medium truncate">{timer.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTimer(timer._id);
          }}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-6">
        <CircularProgress progress={progress} size={180} strokeWidth={6}>
          <span className="text-gray-200 text-4xl font-light tabular-nums">
            {formatTime(timer.remainingTime)}
          </span>
        </CircularProgress>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={handleAddTime}
          className="flex-1 py-3 px-4 bg-[#3a3b3d] hover:bg-[#4a4b4d] text-gray-300 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>1:00</span>
        </button>
        <button
          onClick={handlePlayPause}
          className="flex-1 py-3 px-4 bg-lavender hover:bg-[#c4bbdf] text-gray-800 rounded-full transition-colors flex items-center justify-center"
        >
          {timer.status === 'running' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
      </div>

      <audio ref={audioRef} src="/alarm.mp3" />
    </div>
  );
}