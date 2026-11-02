import { MathTask, OperationType } from '../types';

/**
 * Generates an array of math tasks with multiplication and division up to 100
 */
export function generateMathTasks(
  count: number = 20,
  mode: 'both' | 'multiplication' | 'division' = 'both'
): MathTask[] {
  const tasks: MathTask[] = [];
  const usedSignatures = new Set<string>();

  // Determine operations pool
  const getOp = (i: number): OperationType => {
    if (mode === 'multiplication') return '×';
    if (mode === 'division') return '÷';
    // Alternate or semi-random balanced
    return i % 2 === 0 ? '×' : '÷';
  };

  let attempts = 0;
  let taskId = 1;

  while (tasks.length < count && attempts < 200) {
    attempts++;
    const op = getOp(tasks.length);

    if (op === '×') {
      // Multiplication: a * b <= 100
      // Choose a and b from 2 to 10 (or occasionally 11, 12 up to product <= 100)
      const a = Math.floor(Math.random() * 9) + 2; // 2 to 10
      const b = Math.floor(Math.random() * 9) + 2; // 2 to 10
      const answer = a * b;
      const signature = `${a}×${b}`;

      if (usedSignatures.has(signature)) continue;
      usedSignatures.add(signature);

      tasks.push({
        id: taskId++,
        num1: a,
        num2: b,
        operation: '×',
        answer,
        display: `${a} × ${b}`
      });
    } else {
      // Division: c ÷ b = a (where c = a * b <= 100, b >= 2, a >= 2)
      const a = Math.floor(Math.random() * 9) + 2; // result 2 to 10
      const b = Math.floor(Math.random() * 9) + 2; // divisor 2 to 10
      const c = a * b;
      const signature = `${c}÷${b}`;

      if (usedSignatures.has(signature)) continue;
      usedSignatures.add(signature);

      tasks.push({
        id: taskId++,
        num1: c,
        num2: b,
        operation: '÷',
        answer: a,
        display: `${c} : ${b}` // in Macedonian curriculum, division is usually written as ':' or '÷'
      });
    }
  }

  // If couldn't fill uniquely, fill remainder
  while (tasks.length < count) {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    tasks.push({
      id: taskId++,
      num1: a,
      num2: b,
      operation: '×',
      answer: a * b,
      display: `${a} × ${b}`
    });
  }

  return tasks;
}

/**
 * Generates two distinct sets of math tasks for Team Blue and Team Red
 * ensuring that for every index i, blueTasks[i] is completely different from redTasks[i].
 */
export function generateDualTeamTasks(
  count: number = 20,
  mode: 'both' | 'multiplication' | 'division' = 'both'
): { blueTasks: MathTask[]; redTasks: MathTask[] } {
  const blueTasks = generateMathTasks(count, mode);
  let redTasks = generateMathTasks(count, mode);

  // Ensure no collision at the same index
  for (let i = 0; i < count; i++) {
    if (blueTasks[i].display === redTasks[i].display) {
      // Find another task in redTasks to swap with that doesn't collide
      let swapped = false;
      for (let j = 0; j < count; j++) {
        if (
          i !== j &&
          redTasks[j].display !== blueTasks[i].display &&
          redTasks[i].display !== blueTasks[j].display
        ) {
          const temp = redTasks[i];
          redTasks[i] = redTasks[j];
          redTasks[j] = temp;
          swapped = true;
          break;
        }
      }
      // If couldn't swap, generate a fresh different task for redTasks[i]
      if (!swapped) {
        let replacement: MathTask;
        do {
          replacement = generateMathTasks(1, mode)[0];
        } while (replacement.display === blueTasks[i].display);
        redTasks[i] = { ...replacement, id: redTasks[i].id };
      }
    }
  }

  return { blueTasks, redTasks };
}
