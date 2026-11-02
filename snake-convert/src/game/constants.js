export const GRID_SIZE = 22;
export const DIFFICULTY_CONFIGS = {
    easy: {
        name: 'Easy',
        label: 'Casual Breeze',
        initialTickMs: 135,
        minTickMs: 95,
        speedIncrementPerApple: 0.5,
        wrapWalls: true,
        baseApplePoints: 10,
        bonusPoints: 30,
        hasObstacles: false,
        description: 'Wrap-around walls · Relaxed pacing · Gentle learning curve',
        color: '#10b981' // emerald
    },
    medium: {
        name: 'Medium',
        label: 'Classic Arcade',
        initialTickMs: 95,
        minTickMs: 65,
        speedIncrementPerApple: 0.8,
        wrapWalls: false,
        baseApplePoints: 15,
        bonusPoints: 50,
        hasObstacles: false,
        description: 'Lethal perimeter walls · Timed golden apples · Balanced speed',
        color: '#06b6d4' // cyan
    },
    hard: {
        name: 'Hard',
        label: 'Viper Protocol',
        initialTickMs: 68,
        minTickMs: 48,
        speedIncrementPerApple: 1.0,
        wrapWalls: false,
        baseApplePoints: 25,
        bonusPoints: 75,
        hasObstacles: true,
        description: 'Lethal walls + 4 hazard pillars · High velocity · Maximum score',
        color: '#f43f5e' // rose
    }
};
// Strategic obstacles for Hard difficulty
export const HARD_OBSTACLES = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 5 },
    { x: 16, y: 5 },
    { x: 16, y: 6 },
    { x: 15, y: 5 },
    { x: 5, y: 16 },
    { x: 5, y: 15 },
    { x: 6, y: 16 },
    { x: 16, y: 16 },
    { x: 16, y: 15 },
    { x: 15, y: 16 }
];
