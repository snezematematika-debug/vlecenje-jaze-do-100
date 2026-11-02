/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MathTask,
  TeamId,
  TeamProgress,
  TeamTaskQueueItem,
  GameStatus,
  GameSettings,
} from './types';
import { generateDualTeamTasks } from './utils/mathGenerator';
import { sounds } from './utils/soundEffects';
import { TugOfWarArena } from './components/TugOfWarArena';
import { TeamKeypad } from './components/TeamKeypad';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import {
  RotateCcw,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Swords,
  Timer,
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>({
    totalTasks: 20,
    operationMode: 'both',
    soundEnabled: true,
    showRopeDifference: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Match State
  const [gameStatus, setGameStatus] = useState<GameStatus>('racing');
  const [winner, setWinner] = useState<TeamId | 'tie' | null>(null);

  // Live Timer
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerAnimRef = useRef<number | null>(null);

  // Teams progress
  const [blueProgress, setBlueProgress] = useState<TeamProgress>({
    name: 'Тим 1 · Сини',
    color: 'blue',
    queue: [],
    currentQueueIndex: 0,
    correctCount: 0,
    wrongQueue: [],
    history: [],
    isFinished: false,
    finishTimeMs: null,
    firstTryCorrectCount: 0,
    totalAttempts: 0,
    streak: 0,
  });

  const [redProgress, setRedProgress] = useState<TeamProgress>({
    name: 'Тим 2 · Црвени',
    color: 'red',
    queue: [],
    currentQueueIndex: 0,
    correctCount: 0,
    wrongQueue: [],
    history: [],
    isFinished: false,
    finishTimeMs: null,
    firstTryCorrectCount: 0,
    totalAttempts: 0,
    streak: 0,
  });

  // Inputs
  const [blueInput, setBlueInput] = useState('');
  const [redInput, setRedInput] = useState('');

  // Live Feedback flashes
  const [blueFeedback, setBlueFeedback] = useState<{
    isCorrect: boolean;
    expected: number;
    userVal: number;
    isCorrection: boolean;
  } | null>(null);

  const [redFeedback, setRedFeedback] = useState<{
    isCorrect: boolean;
    expected: number;
    userVal: number;
    isCorrection: boolean;
  } | null>(null);

  const [lastPullTeam, setLastPullTeam] = useState<TeamId | null>(null);
  const [lastPullType, setLastPullType] = useState<'correct' | 'wrong' | null>(null);

  // Initialize fresh race with completely distinct tasks for each team
  const startNewRace = useCallback(() => {
    const { blueTasks, redTasks } = generateDualTeamTasks(
      settings.totalTasks,
      settings.operationMode
    );

    const initialBlueQueue: TeamTaskQueueItem[] = blueTasks.map((t, idx) => ({
      task: t,
      originalIndex: idx,
      isCorrection: false,
      attempts: 0,
    }));

    const initialRedQueue: TeamTaskQueueItem[] = redTasks.map((t, idx) => ({
      task: t,
      originalIndex: idx,
      isCorrection: false,
      attempts: 0,
    }));

    setBlueProgress({
      name: 'Тим 1 · Сини',
      color: 'blue',
      queue: initialBlueQueue,
      currentQueueIndex: 0,
      correctCount: 0,
      wrongQueue: [],
      history: [],
      isFinished: false,
      finishTimeMs: null,
      firstTryCorrectCount: 0,
      totalAttempts: 0,
      streak: 0,
    });

    setRedProgress({
      name: 'Тим 2 · Црвени',
      color: 'red',
      queue: initialRedQueue,
      currentQueueIndex: 0,
      correctCount: 0,
      wrongQueue: [],
      history: [],
      isFinished: false,
      finishTimeMs: null,
      firstTryCorrectCount: 0,
      totalAttempts: 0,
      streak: 0,
    });

    setBlueInput('');
    setRedInput('');
    setBlueFeedback(null);
    setRedFeedback(null);
    setWinner(null);
    setLastPullTeam(null);
    setLastPullType(null);
    setElapsedMs(0);

    startTimeRef.current = performance.now();
    setGameStatus('racing');
    sounds.playWhistle();
  }, [settings.totalTasks, settings.operationMode]);

  // Initial mount
  useEffect(() => {
    startNewRace();
  }, [startNewRace]);

  // Sound sync
  useEffect(() => {
    sounds.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Live stopwatch loop
  useEffect(() => {
    if (gameStatus !== 'racing') {
      if (timerAnimRef.current) cancelAnimationFrame(timerAnimRef.current);
      return;
    }

    const updateTimer = () => {
      if (startTimeRef.current !== null) {
        setElapsedMs(performance.now() - startTimeRef.current);
      }
      timerAnimRef.current = requestAnimationFrame(updateTimer);
    };

    timerAnimRef.current = requestAnimationFrame(updateTimer);
    return () => {
      if (timerAnimRef.current) cancelAnimationFrame(timerAnimRef.current);
    };
  }, [gameStatus]);

  // Handler when a team submits an answer
  const handleAnswerSubmit = (team: TeamId, enteredAnswer: number) => {
    if (gameStatus !== 'racing') return;

    const isBlue = team === 'blue';
    const progress = isBlue ? blueProgress : redProgress;

    if (progress.isFinished) return;

    const currentItem = progress.queue[progress.currentQueueIndex];
    if (!currentItem) return;

    const isCorrect = enteredAnswer === currentItem.task.answer;
    const now = performance.now();
    const currentElapsed = startTimeRef.current ? now - startTimeRef.current : 0;

    // Trigger visual pull and audio
    setLastPullTeam(team);
    setLastPullType(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      sounds.playCorrect();
      sounds.playRopeTug();
    } else {
      sounds.playWrong();
    }

    // Set brief feedback banner
    if (isBlue) {
      setBlueInput('');
      setBlueFeedback({
        isCorrect,
        expected: currentItem.task.answer,
        userVal: enteredAnswer,
        isCorrection: currentItem.isCorrection,
      });
    } else {
      setRedInput('');
      setRedFeedback({
        isCorrect,
        expected: currentItem.task.answer,
        userVal: enteredAnswer,
        isCorrection: currentItem.isCorrection,
      });
    }

    // Process team progression with error cycling
    const updater = (prev: TeamProgress): TeamProgress => {
      const newHistory = [
        ...prev.history,
        {
          task: currentItem.task,
          enteredAnswer,
          isCorrect,
          isCorrection: currentItem.isCorrection,
          timestamp: currentElapsed,
        },
      ];

      const newTotalAttempts = prev.totalAttempts + 1;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      let newCorrectCount = prev.correctCount;
      let newFirstTryCorrect = prev.firstTryCorrectCount;
      let newWrongQueue = [...prev.wrongQueue];

      if (isCorrect) {
        newCorrectCount += 1;
        if (!currentItem.isCorrection && currentItem.attempts === 0) {
          newFirstTryCorrect += 1;
        }
      } else {
        // Failed attempt: add to wrongQueue for re-examination
        newWrongQueue.push({
          task: currentItem.task,
          originalIndex: currentItem.originalIndex,
          isCorrection: true,
          attempts: currentItem.attempts + 1,
        });
      }

      // Check if there are more tasks in the current queue
      if (prev.currentQueueIndex + 1 < prev.queue.length) {
        return {
          ...prev,
          history: newHistory,
          totalAttempts: newTotalAttempts,
          streak: newStreak,
          correctCount: newCorrectCount,
          firstTryCorrectCount: newFirstTryCorrect,
          wrongQueue: newWrongQueue,
          currentQueueIndex: prev.currentQueueIndex + 1,
        };
      }

      // Current queue exhausted! Check if there are mistakes to correct
      if (newWrongQueue.length > 0) {
        // Load the wrongQueue as the new active queue!
        return {
          ...prev,
          history: newHistory,
          totalAttempts: newTotalAttempts,
          streak: newStreak,
          correctCount: newCorrectCount,
          firstTryCorrectCount: newFirstTryCorrect,
          queue: newWrongQueue,
          wrongQueue: [],
          currentQueueIndex: 0,
        };
      }

      // NO remaining errors! ALL 20 tasks are correctly solved!
      return {
        ...prev,
        history: newHistory,
        totalAttempts: newTotalAttempts,
        streak: newStreak,
        correctCount: newCorrectCount,
        firstTryCorrectCount: newFirstTryCorrect,
        wrongQueue: [],
        isFinished: true,
        finishTimeMs: currentElapsed,
      };
    };

    if (isBlue) {
      setBlueProgress((prev) => {
        const next = updater(prev);
        if (next.isFinished && !redProgress.isFinished) {
          // Blue won the race!
          handleTeamVictory('blue', next, redProgress);
        }
        return next;
      });
    } else {
      setRedProgress((prev) => {
        const next = updater(prev);
        if (next.isFinished && !blueProgress.isFinished) {
          // Red won the race!
          handleTeamVictory('red', blueProgress, next);
        }
        return next;
      });
    }
  };

  const handleTeamVictory = (
    winningTeam: TeamId,
    blueState: TeamProgress,
    redState: TeamProgress
  ) => {
    setWinner(winningTeam);
    setGameStatus('finished');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Live rope position: net difference in correct answers
  // redProgress.correctCount - blueProgress.correctCount
  // If blue leads by 3, ropePosition = -3 (shifted to left)
  // If red leads by 4, ropePosition = +4 (shifted to right)
  const ropePosition = redProgress.correctCount - blueProgress.correctCount;

  const currentBlueItem = blueProgress.queue[blueProgress.currentQueueIndex] || null;
  const currentRedItem = redProgress.queue[redProgress.currentQueueIndex] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-4 md:px-8 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Swords className="w-4 h-4" />
          </div>
          <span className="font-display font-extrabold text-base md:text-lg tracking-tight text-white">
            Математичка трка: Влечење јаже
          </span>
        </div>

        {/* Zone 2: Navigation / match meta items */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <span className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400">
            Режим:
            <strong className="text-amber-300">Истовремена трка (двајцата решаваат)</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400">
            Цел:
            <strong className="text-emerald-400">20 точни решенија најбрзо</strong>
          </span>
          <span className="text-slate-600">·</span>
          <span className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-400">
            Задачи:
            <strong className="text-sky-300">Различни за двата тима (без препишување)</strong>
          </span>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            title={settings.soundEnabled ? 'Исклучи звук' : 'Вклучи звук'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Цел екран за паметна табла"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Settings modal button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Поставки на играта"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* New game restart button */}
          <button
            type="button"
            onClick={startNewRace}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-display font-bold text-xs shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Нова трка</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Arena Layout */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-2 sm:p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-stretch">
        {/* Left Column: Blue Team (Team 1) */}
        <section className="lg:col-span-3 h-full">
          <TeamKeypad
            teamId="blue"
            teamName="Тим 1 · Сини"
            currentItem={currentBlueItem}
            taskIndex={currentBlueItem?.originalIndex ?? 0}
            totalOriginalTasks={settings.totalTasks}
            correctCount={blueProgress.correctCount}
            wrongCountPending={blueProgress.wrongQueue.length}
            inputVal={blueInput}
            setInputVal={setBlueInput}
            onSubmitAnswer={handleAnswerSubmit}
            isFinished={blueProgress.isFinished}
            finishTimeMs={blueProgress.finishTimeMs}
            lastFeedback={blueFeedback}
          />
        </section>

        {/* Center Column: Interactive Tug of War Arena with Live Stopwatch */}
        <section className="lg:col-span-6 h-full flex flex-col">
          <TugOfWarArena
            ropePosition={ropePosition}
            blueProgress={blueProgress}
            redProgress={redProgress}
            totalTasks={settings.totalTasks}
            elapsedMs={elapsedMs}
            lastPullTeam={lastPullTeam}
            lastPullType={lastPullType}
            gameStatus={gameStatus}
          />
        </section>

        {/* Right Column: Red Team (Team 2) */}
        <section className="lg:col-span-3 h-full">
          <TeamKeypad
            teamId="red"
            teamName="Тим 2 · Црвени"
            currentItem={currentRedItem}
            taskIndex={currentRedItem?.originalIndex ?? 0}
            totalOriginalTasks={settings.totalTasks}
            correctCount={redProgress.correctCount}
            wrongCountPending={redProgress.wrongQueue.length}
            inputVal={redInput}
            setInputVal={setRedInput}
            onSubmitAnswer={handleAnswerSubmit}
            isFinished={redProgress.isFinished}
            finishTimeMs={redProgress.finishTimeMs}
            lastFeedback={redFeedback}
          />
        </section>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
        }}
        onResetGame={startNewRace}
      />

      {/* Game Over Celebration Modal */}
      {gameStatus === 'finished' && winner && (
        <GameOverModal
          winner={winner}
          blueProgress={blueProgress}
          redProgress={redProgress}
          totalTasks={settings.totalTasks}
          onRestartGame={startNewRace}
        />
      )}
    </div>
  );
}
