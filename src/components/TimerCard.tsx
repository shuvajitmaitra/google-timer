"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X, Play, Plus, Square, RotateCcw } from "lucide-react";
import CircularProgress from "./CircularProgress";
import { Timer } from "@/types/timer";
import { useTimers } from "@/lib/TimerContext";

interface TimerCardProps {
  timer: Timer;
}

export default function TimerCard({ timer }: TimerCardProps) {
  const { updateTimer, deleteTimer } = useTimers();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [extraTime, setExtraTime] = useState(0);
  const originalDurationRef = useRef(timer.duration);
  const isCompleted = timer.status === "completed" && timer.remainingTime === 0;

  useEffect(() => {
    if (timer.status === 'paused') {
      originalDurationRef.current = timer.duration;
      setExtraTime(0);
    }
  }, [timer.status, timer.duration]);

  const currentTotalDuration = timer.duration + extraTime;

  useEffect(() => {
    audioRef.current = new Audio("/alarm.mp3");
  }, []);

  useEffect(() => {
    if (isCompleted && !isAlarmPlaying) {
      setIsAlarmPlaying(true);
      audioRef.current?.play().catch(() => {});
    } else if (!isCompleted && isAlarmPlaying) {
      setIsAlarmPlaying(false);
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
    }
  }, [isCompleted, isAlarmPlaying]);

  const handleStopAlarm = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current!.currentTime = 0;
    setIsAlarmPlaying(false);
    updateTimer(timer._id, { remainingTime: originalDurationRef.current, status: "paused" });
  }, [timer, updateTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = currentTotalDuration > 0 ? (timer.remainingTime / currentTotalDuration) * 100 : 0;

  const handlePlayPause = useCallback(() => {
    if (timer.status === "completed") {
      updateTimer(timer._id, { remainingTime: originalDurationRef.current, status: "paused" });
    } else if (timer.status === "running") {
      updateTimer(timer._id, { remainingTime: originalDurationRef.current, status: "paused" });
    } else {
      updateTimer(timer._id, { status: "running" });
    }
  }, [timer, updateTimer]);

  const handleAddTime = useCallback(() => {
    const newRemaining = timer.remainingTime + 60;
    setExtraTime((prev) => prev + 60);
    updateTimer(timer._id, { remainingTime: newRemaining });
  }, [timer, updateTimer]);

  return (
    <div
      className={`bg-card rounded-3xl p-6 w-72 flex flex-col items-center ${
        isCompleted ? "animate-pulse" : ""
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
          <span className="text-gray-200 text-4xl font-light tabular-nums">{formatTime(timer.remainingTime)}</span>
        </CircularProgress>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddTime();
          }}
          className="flex-1 py-3 px-4 bg-[#3a3b3d] hover:bg-[#4a4b4d] text-gray-300 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>1:00</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAlarmPlaying) {
              handleStopAlarm();
            } else {
              handlePlayPause();
            }
          }}
          className="flex-1 py-3 px-4 bg-lavender hover:bg-[#c4bbdf] text-gray-800 rounded-full transition-colors flex items-center justify-center"
        >
          {isAlarmPlaying ? (
            <Square size={20} fill="currentColor" />
          ) : timer.status === "running" ? (
            <Square size={20} fill="currentColor" />
          ) : timer.status === "completed" ? (
            <RotateCcw size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
      </div>

      <audio ref={audioRef} src="/alarm.mp3" />
    </div>
  );
}
