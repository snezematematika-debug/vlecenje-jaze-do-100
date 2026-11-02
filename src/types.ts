export type OperationType = '×' | '÷';

export interface MathTask {
  id: number;
  num1: number;
  num2: number;
  operation: OperationType;
  answer: number;
  display: string;
}

export type TeamId = 'blue' | 'red';

export interface TeamTaskQueueItem {
  task: MathTask;
  originalIndex: number; // 0 to 19
  isCorrection: boolean; // whether this is a retry of a previously failed task
  attempts: number;
}

export interface TeamProgress {
  name: string;
  color: TeamId;
  queue: TeamTaskQueueItem[]; // current active queue
  currentQueueIndex: number;
  correctCount: number; // how many unique of the 20 are mastered
  wrongQueue: TeamTaskQueueItem[]; // tasks needing correction
  history: {
    task: MathTask;
    enteredAnswer: number;
    isCorrect: boolean;
    isCorrection: boolean;
    timestamp: number;
  }[];
  isFinished: boolean;
  finishTimeMs: number | null;
  firstTryCorrectCount: number;
  totalAttempts: number;
  streak: number;
}

export type GameStatus = 'ready' | 'racing' | 'finished';

export interface GameSettings {
  totalTasks: number; // 20
  operationMode: 'both' | 'multiplication' | 'division';
  soundEnabled: boolean;
  showRopeDifference: boolean; // whether rope shifts by difference in correct answers
}
