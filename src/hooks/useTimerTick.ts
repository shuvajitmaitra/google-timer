'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimers } from '@/lib/TimerContext';

export function useTimerTick() {
  const { state, updateTimer, tick } = useTimers();
  const stateRef = useRef(state);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  stateRef.current = state;

  const playAlarm = useCallback((timerId: string) => {
    let audio = audioRefs.current.get(timerId);
    if (!audio) {
      audio = new Audio('/alarm.mp3');
      audioRefs.current.set(timerId, audio);
    }
    audio.play().catch(() => {});
  }, []);

  const stopAlarm = useCallback((timerId: string) => {
    const audio = audioRefs.current.get(timerId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    const runningTimers = state.timers.filter((t) => t.status === 'running');

    if (runningTimers.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const timers = stateRef.current.timers;
      timers.forEach((timer) => {
        if (timer.status === 'running' && timer.remainingTime > 0) {
          tick(timer._id, timer.remainingTime - 1);
          if (timer.remainingTime === 1) {
            updateTimer(timer._id, { remainingTime: 0, status: 'completed' });
            playAlarm(timer._id);
          }
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.timers, tick, updateTimer, playAlarm]);

  return { stopAlarm };
}