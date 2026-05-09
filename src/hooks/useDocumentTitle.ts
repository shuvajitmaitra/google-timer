'use client';

import { useEffect } from 'react';
import { useTimers } from '@/lib/TimerContext';

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function useDocumentTitle() {
  const { state } = useTimers();

  useEffect(() => {
    const runningTimer = state.timers.find((t) => t.status === 'running');
    if (runningTimer && runningTimer.remainingTime > 0) {
      document.title = `${formatTime(runningTimer.remainingTime)} - Remainder Clock`;
    } else {
      document.title = 'Remainder Clock';
    }
  }, [state.timers]);

  return {};
}