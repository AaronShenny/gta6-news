"use client";

import { useState, useEffect } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: November 19, 2026 (based on the latest delay rumors)
    const targetDate = new Date('2026-11-19T00:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex space-x-4 bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-vice-pink">{timeLeft.days}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Days</span>
      </div>
      <div className="text-xl font-bold text-gray-600 self-start mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-vice-blue">{timeLeft.hours}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Hours</span>
      </div>
      <div className="text-xl font-bold text-gray-600 self-start mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-vice-purple">{timeLeft.minutes}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Mins</span>
      </div>
      <div className="text-xl font-bold text-gray-600 self-start mt-1">:</div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-white">{timeLeft.seconds}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400">Secs</span>
      </div>
    </div>
  );
}
