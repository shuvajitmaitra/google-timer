'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface TimerData {
  _id: string;
  name: string;
  duration: number;
  remainingTime: number;
  isRunning: boolean;
  expectedEndTime: number | null;
}

interface State {
  timers: TimerData[];
}

type Action =
  | { type: 'SET_TIMERS'; payload: TimerData[] }
  | { type: 'ADD_TIMER'; payload: TimerData }
  | { type: 'UPDATE_TIMER'; payload: TimerData }
  | { type: 'DELETE_TIMER'; payload: string }
  | { type: 'TICK' };

const initialState: State = {
  timers: [],
};

function timerReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TIMERS':
      // Overwrite timers, but keep the current expectedEndTime if they're running
      // actually just replace state sync.
      return { ...state, timers: action.payload };
    case 'ADD_TIMER':
      return { ...state, timers: [action.payload, ...state.timers] };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map((t) => (t._id === action.payload._id ? action.payload : t)),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter((t) => t._id !== action.payload),
      };
    case 'TICK': {
      const now = Date.now();
      let hasChanges = false;
      const newTimers = state.timers.map((timer) => {
        if (!timer.isRunning || !timer.expectedEndTime) return timer;
        
        const calculatedRemaining = Math.max(0, Math.ceil((timer.expectedEndTime - now) / 1000));
        if (calculatedRemaining !== timer.remainingTime) {
          hasChanges = true;
          return { ...timer, remainingTime: calculatedRemaining };
        }
        return timer;
      });
      return hasChanges ? { ...state, timers: newTimers } : state;
    }
    default:
      return state;
  }
}

interface TimerContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Fetch initial timers
  useEffect(() => {
    fetch('/api/timers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          dispatch({ type: 'SET_TIMERS', payload: data });
        }
      })
      .catch((err) => console.error('Failed to fetch timers', err));
  }, []);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
