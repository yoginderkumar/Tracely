// utils/zipLevels.ts
import { Level } from '@/types';

export const levels: Level[] = [
  // Monday - Easy starter
  {
    id: 1,
    width: 4,
    height: 4,
    difficulty: 'easy',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 3, y: 0, number: 2 },
      { x: 3, y: 3, number: 3 },
      { x: 0, y: 3, number: 4 },
    ],
    walls: [], // No walls for easy level
  },
  
  // Tuesday - Introducing barriers
  {
    id: 2,
    width: 5,
    height: 4,
    difficulty: 'easy',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 4, y: 0, number: 2 },
      { x: 4, y: 3, number: 3 },
      { x: 0, y: 3, number: 4 },
    ],
    walls: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
  },

  // Wednesday - Medium complexity
  {
    id: 3,
    width: 5,
    height: 5,
    difficulty: 'medium',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 2, y: 0, number: 2 },
      { x: 4, y: 2, number: 3 },
      { x: 2, y: 4, number: 4 },
      { x: 0, y: 4, number: 5 },
    ],
    walls: [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
    ],
  },

  // Thursday - Harder puzzle
  {
    id: 4,
    width: 6,
    height: 5,
    difficulty: 'medium',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 5, y: 0, number: 2 },
      { x: 5, y: 2, number: 3 },
      { x: 2, y: 2, number: 4 },
      { x: 0, y: 4, number: 5 },
      { x: 5, y: 4, number: 6 },
    ],
    walls: [
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 4, y: 2 },
    ],
  },

  // Friday - Challenging
  {
    id: 5,
    width: 6,
    height: 6,
    difficulty: 'hard',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 2, y: 0, number: 2 },
      { x: 5, y: 1, number: 3 },
      { x: 5, y: 3, number: 4 },
      { x: 3, y: 5, number: 5 },
      { x: 1, y: 5, number: 6 },
      { x: 0, y: 3, number: 7 },
    ],
    walls: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 4 },
      { x: 4, y: 4 },
    ],
  },

  // Weekend bonus - Expert level
  {
    id: 6,
    width: 7,
    height: 6,
    difficulty: 'hard',
    numbers: [
      { x: 0, y: 0, number: 1 },
      { x: 6, y: 0, number: 2 },
      { x: 6, y: 2, number: 3 },
      { x: 3, y: 2, number: 4 },
      { x: 0, y: 2, number: 5 },
      { x: 0, y: 5, number: 6 },
      { x: 3, y: 5, number: 7 },
      { x: 6, y: 5, number: 8 },
    ],
    walls: [
      { x: 2, y: 0 },
      { x: 4, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 1, y: 4 },
      { x: 5, y: 4 },
    ],
  },
];

export const getDailyLevel = (): Level => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Map days to difficulty progression
  const dayToLevelMap = {
    1: 1, // Monday - Easy
    2: 2, // Tuesday - Easy+
    3: 3, // Wednesday - Medium
    4: 4, // Thursday - Medium+
    5: 5, // Friday - Hard
    6: 6, // Saturday - Expert
    0: 6, // Sunday - Expert
  };

  const levelIndex = dayToLevelMap[dayOfWeek as keyof typeof dayToLevelMap] || 1;
  return levels[levelIndex - 1];
};

export const getLevel = (id: number): Level | undefined => {
  return levels.find(level => level.id === id);
};

export const getAllLevels = (): Level[] => {
  return levels;
};