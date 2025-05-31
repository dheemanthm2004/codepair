"use client";

import React, { useEffect, useState } from 'react';
import { useRoomStore } from '@/store/room-store';
import { socketManager } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function Timer() {
  const { timerState, setTimerState, participants } = useRoomStore();
  const [localTime, setLocalTime] = useState(timerState.remaining);

  const currentUser = participants[0]; // TODO: Get actual current user
  const isInterviewer = currentUser?.role === 'interviewer';

  // Update local time every second when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning && timerState.remaining > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            // Timer finished
            setTimerState({ isRunning: false });
            socketManager.emit('timer-update', { ...timerState, remaining: 0, isRunning: false });
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, setTimerState]);

  // Sync local time with store
  useEffect(() => {
    setLocalTime(timerState.remaining);
  }, [timerState.remaining]);

  const handleStart = () => {
    const newState = { isRunning: true, startedAt: new Date() };
    setTimerState(newState);
    socketManager.emit('timer-start', { duration: timerState.duration });
  };

  const handlePause = () => {
    const newState = { isRunning: false };
    setTimerState(newState);
    socketManager.emit('timer-pause');
  };

  const handleReset = () => {
    const newState = { 
      isRunning: false, 
      remaining: timerState.duration,
      startedAt: undefined 
    };
    setTimerState(newState);
    setLocalTime(timerState.duration);
    socketManager.emit('timer-reset');
  };

  const getTimerColor = () => {
    const percentage = (localTime / timerState.duration) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressPercentage = () => {
    return ((timerState.duration - localTime) / timerState.duration) * 100;
  };

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-white/70" />
          <span className="text-white/70 font-medium">Interview Timer</span>
        </div>
        
        {isInterviewer && (
          <div className="flex items-center gap-2">
            {!timerState.isRunning ? (
              <Button
                variant="neon"
                size="sm"
                onClick={handleStart}
                disabled={localTime === 0}
              >
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="glass"
                size="sm"
                onClick={handlePause}
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white/70 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center space-y-4">
        <motion.div
          key={localTime}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-mono font-bold ${getTimerColor()} glow-text`}
        >
          {formatTime(localTime)}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-green to-neon-blue"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-sm text-white/60">
          {timerState.isRunning ? 'Running' : localTime === 0 ? 'Time\'s up!' : 'Paused'}
        </div>
      </div>
    </div>
  );
}
