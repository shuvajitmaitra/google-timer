'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { Timer, CreateTimerInput, UpdateTimerInput } from '@/types/timer';

interface TimerState {
  timers: Timer[];
  loading: boolean;
  error: string | null;
}

type TimerAction =
  | { type: 'SET_TIMERS'; payload: Timer[] }
  | { type: 'ADD_TIMER'; payload: Timer }
  | { type: 'UPDATE_TIMER'; payload: { id: string; updates: UpdateTimerInput } }
  | { type: 'DELETE_TIMER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TICK'; payload: { id: string; remainingTime: number } };

interface TimerContextType {
  state: TimerState;
  fetchTimers: () => Promise<void>;
  createTimer: (input: CreateTimerInput) => Promise<void>;
  updateTimer: (id: string, input: UpdateTimerInput) => Promise<void>;
  deleteTimer: (id: string) => Promise<void>;
  tick: (id: string, remainingTime: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_TIMERS':
      return { ...state, timers: action.payload };
    case 'ADD_TIMER':
      return { ...state, timers: [...state.timers, action.payload] };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map((t) =>
          t._id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'DELETE_TIMER':
      return { ...state, timers: state.timers.filter((t) => t._id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'TICK':
      return {
        ...state,
        timers: state.timers.map((t) =>
          t._id === action.payload.id ? { ...t, remainingTime: action.payload.remainingTime } : t
        ),
      };
    default:
      return state;
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, { timers: [], loading: true, error: null });

  const fetchTimers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await fetch('/api/timers');
      const data = await res.json();
      const timersWithLocalStatus = data.timers.map((t: Timer) => ({
        ...t,
        remainingTime: t.duration,
        status: 'paused' as const,
      }));
      dispatch({ type: 'SET_TIMERS', payload: timersWithLocalStatus });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch timers' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createTimer = useCallback(async (input: CreateTimerInput) => {
    try {
      const res = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      const newTimer = {
        ...data.timer,
        remainingTime: data.timer.duration,
        status: 'paused' as const,
      };
      dispatch({ type: 'ADD_TIMER', payload: newTimer });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create timer' });
    }
  }, []);

  const updateTimer = useCallback(async (id: string, input: UpdateTimerInput) => {
    dispatch({ type: 'UPDATE_TIMER', payload: { id, updates: input } });
  }, []);

  const deleteTimer = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TIMER', payload: id });
    try {
      await fetch(`/api/timers/${id}`, { method: 'DELETE' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete timer' });
    }
  }, []);

  const tick = useCallback((id: string, remainingTime: number) => {
    dispatch({ type: 'TICK', payload: { id, remainingTime } });
  }, []);

  useEffect(() => {
    fetchTimers();
  }, [fetchTimers]);

  return (
    <TimerContext.Provider
      value={{ state, fetchTimers, createTimer, updateTimer, deleteTimer, tick }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimers must be used within a TimerProvider');
  }
  return context;
}