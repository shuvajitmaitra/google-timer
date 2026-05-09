import { useEffect, useRef, useState } from 'react';
import { useTimerContext } from '@/lib/TimerContext';

export function useTimerTick() {
  const { state, dispatch } = useTimerContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completedTimers = useRef<Set<string>>(new Set());
  const [ringingTimerIds, setRingingTimerIds] = useState<Set<string>>(new Set());

  const stopAlarm = (timerId?: string) => {
    setRingingTimerIds((current) => {
      const next = new Set(current);

      if (timerId) {
        if (!next.has(timerId)) {
          return current;
        }
        next.delete(timerId);
      } else {
        if (next.size === 0) {
          return current;
        }
        next.clear();
      }

      if (next.size === 0 && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/alarm.mp3');
      audio.preload = 'auto';
      audio.loop = true;
      audioRef.current = audio;

      const unlockAudio = () => {
        if (!audioRef.current) return;

        audioRef.current.muted = true;
        audioRef.current
          .play()
          .then(() => {
            if (!audioRef.current) return;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.muted = false;
          })
          .catch(() => {
            if (audioRef.current) {
              audioRef.current.muted = false;
            }
          });
      };

      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });

      return () => {
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        audio.pause();
      };
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    let activeTimeStr = '';

    state.timers.forEach((timer) => {
      if (timer.isRunning && timer.remainingTime === 0 && !completedTimers.current.has(timer._id)) {
        completedTimers.current.add(timer._id);
        setRingingTimerIds((current) => {
          if (current.has(timer._id)) {
            return current;
          }

          const next = new Set(current);
          next.add(timer._id);
          return next;
        });

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e) => console.log('Audio play failed: ', e));
        }

        fetch(`/api/timers/${timer._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete' }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data._id) {
              dispatch({ type: 'UPDATE_TIMER', payload: data });
            }
          });
      } else if (timer.remainingTime > 0) {
        completedTimers.current.delete(timer._id);
        stopAlarm(timer._id);
      }

      if (!activeTimeStr && timer.isRunning && timer.remainingTime > 0) {
        const mins = Math.floor(timer.remainingTime / 60);
        const secs = timer.remainingTime % 60;
        activeTimeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    });

    document.title = activeTimeStr ? `${activeTimeStr} - Remainder Clock` : 'Remainder Clock';
  }, [state.timers, dispatch]);

  useEffect(() => {
    const timerIds = new Set(state.timers.map((timer) => timer._id));

    setRingingTimerIds((current) => {
      const next = new Set([...current].filter((timerId) => timerIds.has(timerId)));

      if (next.size === current.size) {
        return current;
      }

      if (next.size === 0 && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      return next;
    });
  }, [state.timers]);

  return { ringingTimerIds, stopAlarm };
}
