import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MathTask, TeamId, TeamTaskQueueItem } from '../types';
import { Check, Delete, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TeamKeypadProps {
  teamId: TeamId;
  teamName: string;
  currentItem: TeamTaskQueueItem | null;
  taskIndex: number; // current queue index
  totalOriginalTasks: number; // 20
  correctCount: number; // unique correct
  wrongCountPending: number; // how many currently waiting to be corrected
  inputVal: string;
  setInputVal: (val: string | ((prev: string) => string)) => void;
  onSubmitAnswer: (teamId: TeamId, answer: number) => void;
  isFinished: boolean;
  finishTimeMs: number | null;
  lastFeedback: {
    isCorrect: boolean;
    expected: number;
    userVal: number;
    isCorrection: boolean;
  } | null;
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

export const TeamKeypad: React.FC<TeamKeypadProps> = ({
  teamId,
  teamName,
  currentItem,
  taskIndex,
  totalOriginalTasks,
  correctCount,
  wrongCountPending,
  inputVal,
  setInputVal,
  onSubmitAnswer,
  isFinished,
  finishTimeMs,
  lastFeedback,
}) => {
  const isBlue = teamId === 'blue';

  const handleDigit = useCallback(
    (digit: string) => {
      if (isFinished || !currentItem) return;
      sounds.playKeyClick();
      setInputVal((prev) => {
        if (prev.length >= 3) return prev;
        return prev + digit;
      });
    },
    [isFinished, currentItem, setInputVal]
  );

  const handleBackspace = useCallback(() => {
    if (isFinished || !currentItem) return;
    sounds.playKeyClick();
    setInputVal((prev) => prev.slice(0, -1));
  }, [isFinished, currentItem, setInputVal]);

  const handleSubmit = useCallback(() => {
    if (isFinished || !currentItem) return;
    if (inputVal.trim() === '') return;
    const num = parseInt(inputVal, 10);
    if (!isNaN(num)) {
      onSubmitAnswer(teamId, num);
    }
  }, [isFinished, currentItem, inputVal, onSubmitAnswer, teamId]);

  // Support separate keyboard inputs for dual play:
  // Blue: Main number row keys
  // Red: Numpad keys
  useEffect(() => {
    if (isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBlue) {
        // Main keyboard
        if (e.code.startsWith('Digit')) {
          const digit = e.code.replace('Digit', '');
          handleDigit(digit);
        } else if (e.code === 'KeyC' || (e.code === 'Backspace' && !e.repeat)) {
          handleBackspace();
        } else if (e.code === 'Enter' && !e.code.startsWith('Numpad')) {
          e.preventDefault();
          handleSubmit();
        }
      } else {
        // Red team can use Numpad if available
        if (e.code.startsWith('Numpad') && e.key >= '0' && e.key <= '9') {
          handleDigit(e.key);
        } else if (e.code === 'NumpadDecimal' || e.code === 'NumpadSubtract') {
          handleBackspace();
        } else if (e.code === 'NumpadEnter') {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlue, isFinished, handleDigit, handleBackspace, handleSubmit]);

  const primaryBg = isBlue ? 'bg-sky-950/60' : 'bg-rose-950/60';
  const borderColor = isBlue ? 'border-sky-500/40' : 'border-rose-500/40';
  const activeGlow = isBlue
    ? 'ring-2 ring-sky-500/40 border-sky-400 shadow-sky-900/30'
    : 'ring-2 ring-rose-500/40 border-rose-400 shadow-rose-900/30';
  const buttonHover = isBlue
    ? 'hover:bg-sky-600/30 active:bg-sky-600 text-sky-100 border-sky-700/60'
    : 'hover:bg-rose-600/30 active:bg-rose-600 text-rose-100 border-rose-700/60';
  const submitBtnBg = isBlue
    ? 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 shadow-sky-500/40'
    : 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white shadow-rose-500/40';

  const isCorrectionRound = currentItem?.isCorrection;

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border p-3 md:p-4 transition-all duration-300 relative select-none ${primaryBg} ${borderColor} ${activeGlow} backdrop-blur-md shadow-xl`}
    >
      {/* Team Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-base ${
              isBlue
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
            }`}
          >
            {isBlue ? '1' : '2'}
          </div>
          <div>
            <h3 className="font-display font-bold text-base md:text-lg text-white leading-tight">
              {teamName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold font-mono tabular-nums">
                {correctCount} / {totalOriginalTasks} точни
              </span>
              {wrongCountPending > 0 && (
                <>
                  <span>·</span>
                  <span className="text-amber-400 font-medium">
                    {wrongCountPending} за поправка
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Phase tag */}
        <div>
          {isFinished ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Завршено! 🎉
            </span>
          ) : isCorrectionRound ? (
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <RotateCw className="w-3 h-3 animate-spin" /> Поправка
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md">
              #{taskIndex + 1} од {totalOriginalTasks}
            </span>
          )}
        </div>
      </div>

      {/* Problem Display Card */}
      <div className="mb-3">
        {isFinished ? (
          <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-5 text-center shadow-inner flex flex-col items-center justify-center min-h-[120px]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
            <span className="text-sm font-bold text-emerald-200">
              Сите 20 задачи се точно решени!
            </span>
            {finishTimeMs && (
              <span className="text-xs font-mono text-emerald-300/90 mt-1 font-bold">
                Време: {formatTime(finishTimeMs)}
              </span>
            )}
          </div>
        ) : currentItem ? (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 md:p-4 text-center shadow-inner relative overflow-hidden">
            {/* Context label */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span>
                {isCorrectionRound
                  ? '⚠️ Поправи ја погрешната задача:'
                  : `Задача ${currentItem.originalIndex + 1} од ${totalOriginalTasks}:`}
              </span>
              {isCorrectionRound && (
                <span className="text-amber-400 text-[11px]">
                  Обид #{currentItem.attempts + 1}
                </span>
              )}
            </div>

            {/* Formula display */}
            <div className="flex items-center justify-center gap-3 my-1">
              <span className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-wide">
                {currentItem.task.display}
              </span>
              <span className="text-2xl font-bold text-slate-400">=</span>
              <div
                className={`min-w-[80px] h-12 md:h-14 px-3 rounded-xl border-2 flex items-center justify-center text-3xl font-mono font-black ${
                  inputVal
                    ? `${
                        isBlue
                          ? 'border-sky-400 bg-sky-950/80 text-sky-200'
                          : 'border-rose-400 bg-rose-950/80 text-rose-200'
                      }`
                    : 'border-slate-700 bg-slate-950/60 text-slate-500'
                }`}
              >
                {inputVal || (
                  <span className="text-xl text-slate-500 font-sans font-normal animate-pulse">
                    ?
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center min-h-[110px] flex items-center justify-center">
            <span className="text-sm text-slate-500">Се подготвува...</span>
          </div>
        )}

        {/* Feedback message banner for recent answer */}
        <AnimatePresence>
          {lastFeedback && !isFinished && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-1.5 p-1.5 rounded-lg text-xs font-bold text-center border ${
                lastFeedback.isCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              {lastFeedback.isCorrect ? (
                <span>🎉 Точно! Продолжи на следната!</span>
              ) : (
                <span>
                  Забележана грешка ({lastFeedback.userVal}). Ќе ја поправиш на крај!
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Smartboard Keypad Grid: large tactile touch targets */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isFinished || !currentItem}
              onClick={() => handleDigit(digit.toString())}
              className={`h-11 md:h-13 rounded-xl font-display font-bold text-xl md:text-2xl border transition-all duration-100 flex items-center justify-center shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-20 bg-slate-900/90 ${buttonHover}`}
            >
              {digit}
            </button>
          ))}

          {/* Clear / Backspace button */}
          <button
            type="button"
            disabled={isFinished || !currentItem || inputVal.length === 0}
            onClick={handleBackspace}
            title="Избриши цифра"
            className="h-11 md:h-13 rounded-xl font-medium text-sm md:text-base border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-20"
          >
            <Delete className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold">C</span>
          </button>

          {/* Zero (0) */}
          <button
            type="button"
            disabled={isFinished || !currentItem}
            onClick={() => handleDigit('0')}
            className={`h-11 md:h-13 rounded-xl font-display font-bold text-xl md:text-2xl border transition-all duration-100 flex items-center justify-center shadow-md active:scale-95 disabled:pointer-events-none disabled:opacity-20 bg-slate-900/90 ${buttonHover}`}
          >
            0
          </button>

          {/* Submit / Confirm Button */}
          <button
            type="button"
            disabled={isFinished || !currentItem || inputVal.trim() === ''}
            onClick={handleSubmit}
            title="Потврди одговор"
            className={`h-11 md:h-13 rounded-xl font-display font-bold text-sm md:text-base flex items-center justify-center gap-1.5 shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-20 transition-all ${submitBtnBg}`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Следна!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
