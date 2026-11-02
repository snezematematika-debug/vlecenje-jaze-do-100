import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { TeamId, TeamProgress } from '../types';
import { Trophy, RotateCcw, Check, Sparkles, Timer, Zap, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface GameOverModalProps {
  winner: TeamId | 'tie';
  blueProgress: TeamProgress;
  redProgress: TeamProgress;
  totalTasks: number;
  onRestartGame: () => void;
}

function formatTime(ms: number | null): string {
  if (ms === null) return '--:--.-';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${tenths}`;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  blueProgress,
  redProgress,
  totalTasks,
  onRestartGame,
}) => {
  useEffect(() => {
    sounds.playVictory();

    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#0284c7', '#38bdf8', '#fbbf24', '#f43f5e'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#e11d48', '#fb7185', '#fbbf24', '#38bdf8'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center my-8"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center shadow-xl shadow-amber-500/30 ring-8 ring-amber-400/20">
            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-slate-950" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-amber-300 animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
          {winner === 'blue' && '🎉 Победник е ТИМ СИН!'}
          {winner === 'red' && '🎉 Победник е ТИМ ЦРВЕН!'}
          {winner === 'tie' && '🤝 Нерешено! Неверојатна брзина на двата тима!'}
        </h2>
        <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto mb-6">
          Победник во трката со сите <span className="text-amber-400 font-bold">{totalTasks} точно решени задачи</span> (вклучително и поправените грешки)!
        </p>

        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Blue Team Card */}
          <div
            className={`p-4 rounded-2xl border text-left transition-all ${
              winner === 'blue'
                ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-500/40 shadow-lg'
                : 'bg-slate-850/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                {blueProgress.name}
              </span>
              {winner === 'blue' && (
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  Шампион 👑
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Timer className="w-3.5 h-3.5 text-amber-400" /> Време:
                </span>
                <span className="font-bold text-amber-300 font-mono text-base tabular-nums">
                  {formatTime(blueProgress.finishTimeMs)}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Точно решени задачи:</span>
                <span className="font-bold text-emerald-400 font-mono tabular-nums">
                  {blueProgress.correctCount} / {totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Од прв обид:</span>
                <span className="font-bold text-sky-300 font-mono tabular-nums">
                  {blueProgress.firstTryCorrectCount} / {totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Успешно поправени:</span>
                <span className="font-bold text-amber-400 font-mono tabular-nums">
                  {totalTasks - blueProgress.firstTryCorrectCount} задачи
                </span>
              </div>
            </div>
          </div>

          {/* Red Team Card */}
          <div
            className={`p-4 rounded-2xl border text-left transition-all ${
              winner === 'red'
                ? 'bg-rose-950/80 border-rose-400 ring-2 ring-rose-500/40 shadow-lg'
                : 'bg-slate-850/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                {redProgress.name}
              </span>
              {winner === 'red' && (
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  Шампион 👑
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1 text-slate-400">
                  <Timer className="w-3.5 h-3.5 text-amber-400" /> Време:
                </span>
                <span className="font-bold text-amber-300 font-mono text-base tabular-nums">
                  {formatTime(redProgress.finishTimeMs)}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Точно решени задачи:</span>
                <span className="font-bold text-emerald-400 font-mono tabular-nums">
                  {redProgress.correctCount} / {totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Од прв обид:</span>
                <span className="font-bold text-rose-300 font-mono tabular-nums">
                  {redProgress.firstTryCorrectCount} / {totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Успешно поправени:</span>
                <span className="font-bold text-amber-400 font-mono tabular-nums">
                  {totalTasks - redProgress.firstTryCorrectCount} задачи
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Info Notice */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-left mb-6 flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Одлична тимска работа! Сите задачи се совладани. Погрешно одговорените задачи беа вратени на крајот и решени до крај.
          </span>
        </div>

        {/* Primary Restart CTA */}
        <button
          type="button"
          onClick={onRestartGame}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-extrabold text-lg shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>Нова игра (20 нови задачи за двата тима)</span>
        </button>
      </motion.div>
    </div>
  );
};
