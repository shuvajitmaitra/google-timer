'use client';

import React from 'react';
import { TimerData, useTimerContext } from '@/lib/TimerContext';
import { CircularProgress } from './CircularProgress';
import { Play, Pause, Plus, Square, Trash2 } from 'lucide-react';

interface TimerCardProps {
  timer: TimerData;
  isAlarmRinging?: boolean;
  onStopAlarm?: (timerId?: string) => void;
}

export function TimerCard({ timer, isAlarmRinging = false, onStopAlarm }: TimerCardProps) {
  const { dispatch } = useTimerContext();

  const handleAction = async (action: string, payload?: any) => {
    try {
      // Optimistic updates for local UI responsiveness
      if (action === 'delete') {
         dispatch({ type: 'DELETE_TIMER', payload: timer._id });
         await fetch(`/api/timers/${timer._id}`, { method: 'DELETE' });
         return;
      }

      if ((action === 'reset' || action === 'stop') && onStopAlarm) {
        onStopAlarm(timer._id);
      }

      // API Call for other updates
      const res = await fetch(`/api/timers/${timer._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (data._id) {
        dispatch({ type: 'UPDATE_TIMER', payload: data });
      }
    } catch (e) {
      console.error('Failed to update timer', e);
    }
  };

  const percentage = timer.duration > 0 ? (timer.remainingTime / timer.duration) * 100 : 0;
  const isCompleted = timer.remainingTime === 0;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0f0f12] border border-white/10 rounded-[32px] p-8 flex flex-col items-center shadow-2xl relative group transition-all min-h-[360px] h-full">
      <div className="absolute top-4 right-8 text-[10px] text-gray-600 font-mono">#{timer._id.slice(-4)}</div>

      <div className="w-full flex justify-between items-start">
        <h2 className="text-lg font-medium text-white/90 line-clamp-1 pr-6">{timer.name}</h2>
        <button 
          onClick={() => handleAction('delete')}
          className="text-gray-500 hover:text-red-400 transition-colors absolute right-8"
          aria-label="Delete timer"
        >
          ✕
        </button>
      </div>

      <div className={`relative flex flex-1 items-center justify-center my-4 ${!timer.isRunning && !isCompleted ? 'opacity-50' : ''}`}>
        <CircularProgress 
          percentage={percentage} 
          label={formatTime(timer.remainingTime)} 
          subLabel={isAlarmRinging ? 'Alarm Ringing' : (isCompleted ? 'Done' : (timer.isRunning ? 'Running' : 'Paused'))} 
          isRunning={timer.isRunning}
        />
      </div>

      <div className="w-full flex flex-col gap-4 mt-auto">
        {isAlarmRinging && (
          <button
            onClick={() => onStopAlarm?.(timer._id)}
            className="w-full rounded-full bg-red-500 hover:bg-red-400 text-white px-4 py-3 text-sm font-semibold tracking-wide transition-colors cursor-pointer"
            aria-label="Stop alarm"
          >
            STOP ALARM
          </button>
        )}
        <div className="flex justify-center gap-4 items-center">
          {!isCompleted && (
            <button
              onClick={() => handleAction('addTime', { seconds: 60 })}
              className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 text-white font-mono text-sm transition-colors cursor-pointer"
              aria-label="Add 1 minute"
            >
              +1m
            </button>
          )}
          {!isCompleted && (
            <button
              onClick={() => handleAction(timer.isRunning ? 'pause' : 'play')}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                timer.isRunning 
                  ? 'bg-white hover:bg-gray-200 text-black' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
              aria-label={timer.isRunning ? 'Pause' : 'Play'}
            >
              {timer.isRunning ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
          )}
          <button
            onClick={() => handleAction('reset')}
            className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer ${isCompleted ? 'w-16 h-16' : ''}`}
            aria-label="Reset / Stop"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
