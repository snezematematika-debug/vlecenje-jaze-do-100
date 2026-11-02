import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamId, TeamProgress } from '../types';
import { Trophy, Flame, Zap, Timer, CheckCircle2, RotateCw } from 'lucide-react';

interface TugOfWarArenaProps {
  ropePosition: number; // negative = blue lead, positive = red lead
  blueProgress: TeamProgress;
  redProgress: TeamProgress;
  totalTasks: number;
  elapsedMs: number;
  lastPullTeam: TeamId | null;
  lastPullType: 'correct' | 'wrong' | null;
  gameStatus: 'ready' | 'racing' | 'finished';
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${tenths}`;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  ropePosition,
  blueProgress,
  redProgress,
  totalTasks,
  elapsedMs,
  lastPullTeam,
  lastPullType,
  gameStatus,
}) => {
  // Clamp shift between -45% and +45% (max difference ~8-10 points)
  const maxRange = 10;
  const clampedPos = Math.max(-maxRange, Math.min(maxRange, ropePosition));
  const shiftPercent = (clampedPos / maxRange) * 44;

  const bluePercent = Math.min(100, Math.round((blueProgress.correctCount / totalTasks) * 100));
  const redPercent = Math.min(100, Math.round((redProgress.correctCount / totalTasks) * 100));

  const blueInCorrection = blueProgress.queue.length > 0 && blueProgress.queue[blueProgress.currentQueueIndex]?.isCorrection;
  const redInCorrection = redProgress.queue.length > 0 && redProgress.queue[redProgress.currentQueueIndex]?.isCorrection;

  return (
    <div className="flex flex-col h-full bg-slate-950/75 border border-slate-800/80 rounded-2xl p-3 md:p-5 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Dynamic ambient lighting based on leader */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div
          className={`absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${
            ropePosition < 0 ? 'bg-sky-500/30' : 'bg-slate-700/10'
          }`}
        />
        <div
          className={`absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${
            ropePosition > 0 ? 'bg-rose-500/30' : 'bg-slate-700/10'
          }`}
        />
      </div>

      {/* Arena Top Header: Live Stopwatch & Leading Team */}
      <div className="relative z-10 flex flex-col items-center mb-2">
        <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2 mb-2">
          {/* Blue progress pill */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 ring-4 ring-sky-500/20 animate-pulse" />
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                {blueProgress.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white font-mono tabular-nums">
                  {blueProgress.correctCount}/{totalTasks}
                </span>
                {blueInCorrection && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                    Поправка
                  </span>
                )}
                {blueProgress.isFinished && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                    Заврши! 🏁
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Central Live Clock */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 shadow-inner">
              <Timer className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-lg md:text-xl font-mono font-black text-amber-300 tabular-nums tracking-wider">
                {formatTime(elapsedMs)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
              Истовремена трка
            </span>
          </div>

          {/* Red progress pill */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                {redProgress.name}
              </span>
              <div className="flex items-center justify-end gap-1.5">
                {redProgress.isFinished && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                    Заврши! 🏁
                  </span>
                )}
                {redInCorrection && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                    Поправка
                  </span>
                )}
                <span className="text-base font-black text-white font-mono tabular-nums">
                  {redProgress.correctCount}/{totalTasks}
                </span>
              </div>
            </div>
            <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 animate-pulse" />
          </div>
        </div>

        {/* Live dual race progress bars */}
        <div className="w-full grid grid-cols-2 gap-2 mb-2">
          {/* Blue team bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-sky-400 font-bold">Сини: {bluePercent}%</span>
              <span className="text-slate-400">{totalTasks - blueProgress.correctCount} останати</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-300"
                style={{ width: `${bluePercent}%` }}
              />
            </div>
          </div>

          {/* Red team bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">{totalTasks - redProgress.correctCount} останати</span>
              <span className="text-rose-400 font-bold">Црвени: {redPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex justify-end">
              <div
                className="h-full bg-gradient-to-l from-rose-600 to-rose-400 rounded-full transition-all duration-300"
                style={{ width: `${redPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meter / Tug Scale */}
      <div className="relative z-10 w-full mb-2 px-1">
        <div className="relative h-6 bg-slate-900 border border-slate-700/80 rounded-full overflow-hidden flex items-center">
          {/* Blue pull field */}
          <div className="flex-1 h-full bg-gradient-to-r from-sky-600/30 to-transparent relative border-r border-slate-700 flex items-center justify-start pl-3">
            <span className="text-[10px] font-bold text-sky-400 uppercase">
              {ropePosition < 0 ? `Во водство: +${Math.abs(ropePosition)}` : 'Сини'}
            </span>
          </div>
          {/* Center line */}
          <div className="w-0.5 h-full bg-amber-400 z-10" />
          {/* Red pull field */}
          <div className="flex-1 h-full bg-gradient-to-l from-rose-600/30 to-transparent relative border-l border-slate-700 flex items-center justify-end pr-3">
            <span className="text-[10px] font-bold text-rose-400 uppercase">
              {ropePosition > 0 ? `Во водство: +${ropePosition}` : 'Црвени'}
            </span>
          </div>

          {/* Position Marker indicating who is leading */}
          <motion.div
            className="absolute top-0 bottom-0 w-5 -ml-2.5 z-20 flex items-center justify-center pointer-events-none"
            animate={{ left: `${50 + (shiftPercent / 44) * 44}%` }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 ring-4 ring-amber-400/40 shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Tug Arena: Characters & Moving Rope */}
      <div className="relative flex-1 min-h-[200px] md:min-h-[250px] w-full bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-end p-2 select-none">
        {/* Subtle floor markings */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-amber-300/40" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px)] bg-[size:24px_100%]" />
        </div>

        {/* Dynamic Rope & Characters Group */}
        <motion.div
          className="relative w-full h-40 md:h-48 z-10 flex items-center justify-center"
          animate={{ x: `${shiftPercent}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          {/* THE ROPE */}
          <div className="absolute top-1/2 left-0 right-0 h-4 md:h-5 -translate-y-1/2 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 rounded-full shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.3)_6px,rgba(0,0,0,0.3)_12px)] opacity-60" />
            </div>

            {/* Center Red Ribbon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="w-4 h-6 bg-red-600 rounded-sm shadow-lg ring-2 ring-red-400 animate-pulse relative">
                <div className="absolute -bottom-4 -left-1 w-2.5 h-5 bg-red-600 transform -rotate-12 shadow" />
                <div className="absolute -bottom-4 -right-1 w-2.5 h-5 bg-red-700 transform rotate-12 shadow" />
              </div>
            </div>
          </div>

          {/* BLUE TEAM CHARACTERS (Left side) */}
          <div className="absolute right-1/2 mr-8 md:mr-14 bottom-2 flex items-end gap-2 md:gap-4 pointer-events-none">
            {/* Blue Kid 1 */}
            <motion.div
              animate={{
                rotate: [-16, -21, -16],
                y: [0, -3, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              className="origin-bottom-right flex flex-col items-center"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-200 border-2 border-amber-300 relative shadow-sm flex items-center justify-center">
                <div className="absolute -top-1 left-0 right-0 h-3 bg-amber-900 rounded-t-full" />
                <div className="flex gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                </div>
                <div className="w-2.5 h-1 border-b-2 border-slate-800 rounded-full mt-1.5" />
              </div>
              <div className="w-10 h-14 md:w-12 md:h-16 bg-sky-600 rounded-t-lg rounded-b-sm relative flex flex-col items-center justify-center text-white font-bold text-[10px] shadow-md border-t border-sky-400">
                <span>1</span>
                <div className="absolute -right-2 top-6 w-5 h-3 bg-amber-200 rounded-full border border-amber-300 rotate-12" />
                <div className="absolute -right-3 top-8 w-5 h-3 bg-amber-200 rounded-full border border-amber-300 -rotate-12" />
              </div>
              <div className="flex gap-1.5 -mt-1">
                <div className="w-3.5 h-9 bg-slate-800 rounded-b-md transform -rotate-12 origin-top" />
                <div className="w-3.5 h-10 bg-slate-900 rounded-b-md transform -rotate-24 origin-top" />
              </div>
            </motion.div>

            {/* Blue Kid 2 */}
            <motion.div
              animate={{
                rotate: [-18, -23, -18],
                y: [0, -2, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.9, delay: 0.15, ease: 'easeInOut' }}
              className="origin-bottom-right hidden sm:flex flex-col items-center"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-200 border-2 border-amber-300 relative shadow-sm flex items-center justify-center">
                <div className="absolute -top-1 left-0 right-0 h-3 bg-slate-900 rounded-t-full" />
                <div className="flex gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                </div>
                <div className="w-2 h-1 border-b-2 border-slate-800 rounded-full mt-1.5" />
              </div>
              <div className="w-9 h-13 md:w-11 md:h-15 bg-sky-700 rounded-t-lg rounded-b-sm relative flex flex-col items-center justify-center text-white font-bold text-[10px] shadow-md border-t border-sky-400">
                <span>2</span>
                <div className="absolute -right-2 top-5 w-4 h-3 bg-amber-200 rounded-full border border-amber-300 rotate-12" />
              </div>
              <div className="flex gap-1 -mt-1">
                <div className="w-3 h-8 bg-slate-800 rounded-b-md transform -rotate-12" />
                <div className="w-3 h-9 bg-slate-900 rounded-b-md transform -rotate-20" />
              </div>
            </motion.div>
          </div>

          {/* RED TEAM CHARACTERS (Right side) */}
          <div className="absolute left-1/2 ml-8 md:ml-14 bottom-2 flex items-end gap-2 md:gap-4 pointer-events-none">
            {/* Red Kid 1 */}
            <motion.div
              animate={{
                rotate: [16, 21, 16],
                y: [0, -3, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              className="origin-bottom-left flex flex-col items-center"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-200 border-2 border-amber-300 relative shadow-sm flex items-center justify-center">
                <div className="absolute -top-1 left-0 right-0 h-3 bg-amber-800 rounded-t-full" />
                <div className="flex gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                </div>
                <div className="w-2.5 h-1 border-b-2 border-slate-800 rounded-full mt-1.5" />
              </div>
              <div className="w-10 h-14 md:w-12 md:h-16 bg-rose-600 rounded-t-lg rounded-b-sm relative flex flex-col items-center justify-center text-white font-bold text-[10px] shadow-md border-t border-rose-400">
                <span>1</span>
                <div className="absolute -left-2 top-6 w-5 h-3 bg-amber-200 rounded-full border border-amber-300 -rotate-12" />
                <div className="absolute -left-3 top-8 w-5 h-3 bg-amber-200 rounded-full border border-amber-300 rotate-12" />
              </div>
              <div className="flex gap-1.5 -mt-1">
                <div className="w-3.5 h-9 bg-slate-800 rounded-b-md transform rotate-12 origin-top" />
                <div className="w-3.5 h-10 bg-slate-900 rounded-b-md transform rotate-24 origin-top" />
              </div>
            </motion.div>

            {/* Red Kid 2 */}
            <motion.div
              animate={{
                rotate: [18, 23, 18],
                y: [0, -2, 0],
              }}
              transition={{ repeat: Infinity, duration: 0.9, delay: 0.15, ease: 'easeInOut' }}
              className="origin-bottom-left hidden sm:flex flex-col items-center"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-200 border-2 border-amber-300 relative shadow-sm flex items-center justify-center">
                <div className="absolute -top-1 left-0 right-0 h-3 bg-stone-900 rounded-t-full" />
                <div className="flex gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                  <div className="w-1 h-1 bg-slate-900 rounded-full" />
                </div>
                <div className="w-2 h-1 border-b-2 border-slate-800 rounded-full mt-1.5" />
              </div>
              <div className="w-9 h-13 md:w-11 md:h-15 bg-rose-700 rounded-t-lg rounded-b-sm relative flex flex-col items-center justify-center text-white font-bold text-[10px] shadow-md border-t border-rose-400">
                <span>2</span>
                <div className="absolute -left-2 top-5 w-4 h-3 bg-amber-200 rounded-full border border-amber-300 -rotate-12" />
              </div>
              <div className="flex gap-1 -mt-1">
                <div className="w-3 h-8 bg-slate-800 rounded-b-md transform rotate-12" />
                <div className="w-3 h-9 bg-slate-900 rounded-b-md transform rotate-20" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stadium Floor line */}
        <div className="h-6 w-full bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-700/60 flex items-center justify-center relative">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            Трка: кој прв ќе ги реши точно сите 20 задачи!
          </span>
        </div>
      </div>
    </div>
  );
};
