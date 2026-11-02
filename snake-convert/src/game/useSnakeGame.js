import { useState, useEffect, useRef, useCallback } from 'react';
import { DIFFICULTY_CONFIGS, GRID_SIZE, HARD_OBSTACLES } from './constants';
import { sound } from '../utils/audio';
const INITIAL_SNAKE = [
    { x: 11, y: 11 },
    { x: 10, y: 11 },
    { x: 9, y: 11 }
];
export function useSnakeGame(currentDifficulty, onGameOver) {
    const [difficulty, setDifficultyState] = useState(currentDifficulty);
    const [status, setStatus] = useState('IDLE');
    const [score, setScore] = useState(0);
    const [applesEaten, setApplesEaten] = useState(0);
    // Snake positions
    const snakeRef = useRef([...INITIAL_SNAKE]);
    const prevSnakeRef = useRef([...INITIAL_SNAKE]);
    const [snakeState, setSnakeState] = useState([...INITIAL_SNAKE]);
    const [prevSnakeState, setPrevSnakeState] = useState([...INITIAL_SNAKE]);
    // Movement & direction
    const directionRef = useRef('RIGHT');
    const directionQueueRef = useRef([]);
    const [directionState, setDirectionState] = useState('RIGHT');
    // Difficulty config
    const config = DIFFICULTY_CONFIGS[difficulty];
    const currentTickMsRef = useRef(config.initialTickMs);
    const lastTickTimeRef = useRef(0);
    const [progressState, setProgressState] = useState(1);
    // Obstacles
    const obstacles = config.hasObstacles ? HARD_OBSTACLES : [];
    // Food items
    const spawnFood = useCallback((currentSnake, obs) => {
        let newX;
        let newY;
        let attempts = 0;
        const maxAttempts = 300;
        do {
            newX = Math.floor(Math.random() * GRID_SIZE);
            newY = Math.floor(Math.random() * GRID_SIZE);
            attempts++;
            const inSnake = currentSnake.some((s) => s.x === newX && s.y === newY);
            const inObstacle = obs.some((o) => o.x === newX && o.y === newY);
            if (!inSnake && !inObstacle) {
                break;
            }
        } while (attempts < maxAttempts);
        return {
            x: newX,
            y: newY,
            type: 'apple',
            points: config.baseApplePoints,
            spawnTime: Date.now()
        };
    }, [config.baseApplePoints]);
    const [food, setFood] = useState(() => spawnFood(INITIAL_SNAKE, obstacles));
    const [bonusFood, setBonusFood] = useState(null);
    const [bonusTimeRemaining, setBonusTimeRemaining] = useState(0);
    // Particles & floating text
    const particlesRef = useRef([]);
    const [particlesState, setParticlesState] = useState([]);
    const floatingTextsRef = useRef([]);
    const [floatingTextsState, setFloatingTextsState] = useState([]);
    const [shake, setShake] = useState(0);
    // Set difficulty cleanly
    const setDifficulty = useCallback((diff) => {
        setDifficultyState(diff);
        currentTickMsRef.current = DIFFICULTY_CONFIGS[diff].initialTickMs;
        if (status !== 'PLAYING') {
            const newObs = DIFFICULTY_CONFIGS[diff].hasObstacles ? HARD_OBSTACLES : [];
            setFood(spawnFood(INITIAL_SNAKE, newObs));
            setBonusFood(null);
        }
    }, [spawnFood, status]);
    // Direction handler with 180-degree turn check
    const changeDirection = useCallback((newDir) => {
        const opposites = {
            UP: 'DOWN',
            DOWN: 'UP',
            LEFT: 'RIGHT',
            RIGHT: 'LEFT'
        };
        const lastQueued = directionQueueRef.current.length > 0
            ? directionQueueRef.current[directionQueueRef.current.length - 1]
            : directionRef.current;
        if (newDir !== lastQueued && newDir !== opposites[lastQueued]) {
            if (directionQueueRef.current.length < 2) {
                directionQueueRef.current.push(newDir);
                sound.playTurn();
            }
        }
    }, []);
    // Create particle burst at grid coordinate
    const createEatParticles = useCallback((gx, gy, color) => {
        const newParticles = [];
        const count = 18;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 1.2 + Math.random() * 2.8;
            newParticles.push({
                x: gx + 0.5,
                y: gy + 0.5,
                vx: Math.cos(angle) * speed * 0.08,
                vy: Math.sin(angle) * speed * 0.08,
                size: 2.5 + Math.random() * 3,
                color,
                alpha: 1,
                life: 0,
                maxLife: 22 + Math.floor(Math.random() * 10)
            });
        }
        particlesRef.current = [...particlesRef.current, ...newParticles];
    }, []);
    // Add floating points text
    const addFloatingText = useCallback((gx, gy, text, color) => {
        floatingTextsRef.current.push({
            id: `float-${Date.now()}-${Math.random()}`,
            x: gx + 0.5,
            y: gy,
            text,
            color,
            alpha: 1,
            vy: -0.04
        });
    }, []);
    // Start / Restart
    const resetGame = useCallback(() => {
        snakeRef.current = [...INITIAL_SNAKE];
        prevSnakeRef.current = [...INITIAL_SNAKE];
        directionRef.current = 'RIGHT';
        directionQueueRef.current = [];
        currentTickMsRef.current = DIFFICULTY_CONFIGS[difficulty].initialTickMs;
        lastTickTimeRef.current = performance.now();
        const obs = DIFFICULTY_CONFIGS[difficulty].hasObstacles ? HARD_OBSTACLES : [];
        setSnakeState([...INITIAL_SNAKE]);
        setPrevSnakeState([...INITIAL_SNAKE]);
        setDirectionState('RIGHT');
        setScore(0);
        setApplesEaten(0);
        setFood(spawnFood(INITIAL_SNAKE, obs));
        setBonusFood(null);
        setBonusTimeRemaining(0);
        particlesRef.current = [];
        floatingTextsRef.current = [];
        setParticlesState([]);
        setFloatingTextsState([]);
        setShake(0);
        setProgressState(1);
    }, [difficulty, spawnFood]);
    const startGame = useCallback(() => {
        resetGame();
        setStatus('PLAYING');
    }, [resetGame]);
    const pauseGame = useCallback(() => {
        if (status === 'PLAYING') {
            setStatus('PAUSED');
        }
    }, [status]);
    const resumeGame = useCallback(() => {
        if (status === 'PAUSED') {
            lastTickTimeRef.current = performance.now();
            setStatus('PLAYING');
        }
    }, [status]);
    const restartGame = useCallback(() => {
        resetGame();
        setStatus('PLAYING');
    }, [resetGame]);
    // Main game tick execution
    const executeTick = useCallback(() => {
        if (directionQueueRef.current.length > 0) {
            directionRef.current = directionQueueRef.current.shift();
            setDirectionState(directionRef.current);
        }
        const currentSnake = snakeRef.current;
        prevSnakeRef.current = currentSnake.map((seg) => ({ ...seg }));
        const head = currentSnake[0];
        const dir = directionRef.current;
        let nextX = head.x;
        let nextY = head.y;
        if (dir === 'UP')
            nextY -= 1;
        if (dir === 'DOWN')
            nextY += 1;
        if (dir === 'LEFT')
            nextX -= 1;
        if (dir === 'RIGHT')
            nextX += 1;
        // Boundary rules based on difficulty
        if (config.wrapWalls) {
            nextX = (nextX + GRID_SIZE) % GRID_SIZE;
            nextY = (nextY + GRID_SIZE) % GRID_SIZE;
        }
        else {
            if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
                // Wall collision death!
                sound.playGameOver();
                setShake(10);
                setStatus('GAME_OVER');
                onGameOver?.(score, currentSnake.length, applesEaten, difficulty);
                return;
            }
        }
        // Check obstacle collision (Hard mode)
        if (config.hasObstacles && HARD_OBSTACLES.some((o) => o.x === nextX && o.y === nextY)) {
            sound.playGameOver();
            setShake(12);
            setStatus('GAME_OVER');
            onGameOver?.(score, currentSnake.length, applesEaten, difficulty);
            return;
        }
        // Check self-collision (exclude tail tip if it's going to move, but if eating it won't move)
        // To be strictly correct: if head collides with any segment except the last one (if not growing)
        const willEatStandard = nextX === food.x && nextY === food.y;
        const willEatBonus = bonusFood && nextX === bonusFood.x && nextY === bonusFood.y;
        const isGrowing = willEatStandard || willEatBonus;
        const segmentsToCheck = isGrowing ? currentSnake : currentSnake.slice(0, -1);
        if (segmentsToCheck.some((s) => s.x === nextX && s.y === nextY)) {
            // Self collision death!
            sound.playGameOver();
            setShake(10);
            setStatus('GAME_OVER');
            onGameOver?.(score, currentSnake.length, applesEaten, difficulty);
            return;
        }
        // Build new snake
        const newHead = { x: nextX, y: nextY };
        const newSnake = [newHead, ...currentSnake];
        if (!isGrowing) {
            newSnake.pop();
        }
        snakeRef.current = newSnake;
        setSnakeState(newSnake);
        setPrevSnakeState(prevSnakeRef.current);
        // Eating standard food
        if (willEatStandard) {
            const addedPoints = food.points;
            const newTotalScore = score + addedPoints;
            const newApplesCount = applesEaten + 1;
            sound.playEat(false);
            createEatParticles(food.x, food.y, '#ef4444');
            addFloatingText(food.x, food.y, `+${addedPoints}`, '#ef4444');
            setScore(newTotalScore);
            setApplesEaten(newApplesCount);
            // Accelerate tick speed slightly
            currentTickMsRef.current = Math.max(config.minTickMs, currentTickMsRef.current - config.speedIncrementPerApple);
            // Spawn new standard food
            const obs = config.hasObstacles ? HARD_OBSTACLES : [];
            setFood(spawnFood(newSnake, obs));
            // Check for bonus food spawn (e.g. every 5 apples)
            if (newApplesCount > 0 && newApplesCount % 5 === 0 && !bonusFood) {
                let bx, by;
                let bAttempts = 0;
                do {
                    bx = Math.floor(Math.random() * GRID_SIZE);
                    by = Math.floor(Math.random() * GRID_SIZE);
                    bAttempts++;
                    const inSnake = newSnake.some((s) => s.x === bx && s.y === by);
                    const inObstacle = obs.some((o) => o.x === bx && o.y === by);
                    const isFood = bx === food.x && by === food.y;
                    if (!inSnake && !inObstacle && !isFood)
                        break;
                } while (bAttempts < 200);
                const duration = 7500; // 7.5 seconds
                setBonusFood({
                    x: bx,
                    y: by,
                    type: 'golden',
                    points: config.bonusPoints,
                    spawnTime: Date.now(),
                    durationMs: duration
                });
            }
        }
        // Eating bonus food
        if (willEatBonus && bonusFood) {
            const addedPoints = bonusFood.points;
            sound.playEat(true);
            createEatParticles(bonusFood.x, bonusFood.y, '#fbbf24');
            addFloatingText(bonusFood.x, bonusFood.y, `+${addedPoints} GOLDEN!`, '#fbbf24');
            setScore((prev) => prev + addedPoints);
            setBonusFood(null);
        }
    }, [
        config,
        food,
        bonusFood,
        score,
        applesEaten,
        difficulty,
        onGameOver,
        createEatParticles,
        addFloatingText,
        spawnFood
    ]);
    // Animation frame loop for continuous smooth interpolation, particles, and tick timing
    useEffect(() => {
        let animId;
        const loop = (timestamp) => {
            if (status === 'PLAYING') {
                const elapsed = timestamp - lastTickTimeRef.current;
                const tickMs = currentTickMsRef.current;
                // Progress between ticks: 0.0 to 1.0
                const progress = Math.min(1, elapsed / tickMs);
                setProgressState(progress);
                if (elapsed >= tickMs) {
                    lastTickTimeRef.current = timestamp;
                    executeTick();
                }
                // Check bonus food expiry
                if (bonusFood && bonusFood.durationMs) {
                    const remaining = Math.max(0, bonusFood.durationMs - (Date.now() - bonusFood.spawnTime));
                    setBonusTimeRemaining(Math.ceil(remaining / 1000));
                    if (remaining <= 0) {
                        setBonusFood(null);
                    }
                }
            }
            // Update particles
            if (particlesRef.current.length > 0) {
                particlesRef.current = particlesRef.current
                    .map((p) => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vx: p.vx * 0.94,
                    vy: p.vy * 0.94,
                    life: p.life + 1,
                    alpha: 1 - p.life / p.maxLife
                }))
                    .filter((p) => p.life < p.maxLife);
                setParticlesState([...particlesRef.current]);
            }
            // Update floating texts
            if (floatingTextsRef.current.length > 0) {
                floatingTextsRef.current = floatingTextsRef.current
                    .map((ft) => ({
                    ...ft,
                    y: ft.y + ft.vy,
                    alpha: ft.alpha - 0.02
                }))
                    .filter((ft) => ft.alpha > 0);
                setFloatingTextsState([...floatingTextsRef.current]);
            }
            // Dampen screen shake
            setShake((prev) => (prev > 0.1 ? prev * 0.82 : 0));
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [status, executeTick, bonusFood]);
    // Global Keyboard event handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Avoid capturing shortcuts if typing in input/textarea
            const target = e.target;
            if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                return;
            }
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (status === 'PLAYING')
                        changeDirection('UP');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (status === 'PLAYING')
                        changeDirection('DOWN');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    if (status === 'PLAYING')
                        changeDirection('LEFT');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    if (status === 'PLAYING')
                        changeDirection('RIGHT');
                    break;
                case ' ': // Space to pause/resume
                    e.preventDefault();
                    if (status === 'PLAYING')
                        pauseGame();
                    else if (status === 'PAUSED')
                        resumeGame();
                    else if (status === 'IDLE' || status === 'GAME_OVER')
                        startGame();
                    break;
                case 'r':
                case 'R':
                    if (status === 'PLAYING' || status === 'PAUSED' || status === 'GAME_OVER') {
                        restartGame();
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, changeDirection, pauseGame, resumeGame, startGame, restartGame]);
    return {
        status,
        score,
        applesEaten,
        difficulty,
        setDifficulty,
        snake: snakeState,
        prevSnake: prevSnakeState,
        direction: directionState,
        food,
        bonusFood,
        bonusTimeRemaining,
        obstacles,
        particles: particlesState,
        floatingTexts: floatingTextsState,
        shake,
        progress: progressState,
        startGame,
        pauseGame,
        resumeGame,
        restartGame,
        changeDirection
    };
}
