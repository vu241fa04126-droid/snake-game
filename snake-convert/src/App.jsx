import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { useSnakeGame } from './game/useSnakeGame';
import { DIFFICULTY_CONFIGS } from './game/constants';
import { getSkinById } from './utils/skins';
import { sound } from './utils/audio';
import { fetchScores, getSavedActiveUsername, loginUser, saveScore, DEFAULT_USER } from './utils/storage';
import { TopBar } from './components/TopBar';
import { SnakeCanvas } from './components/SnakeCanvas';
import { ScoreBoard } from './components/ScoreBoard';
import { DifficultySelector } from './components/DifficultySelector';
import { MobileControls } from './components/MobileControls';
import { LeaderboardModal } from './components/LeaderboardModal';
import { JsonInspectorModal } from './components/JsonInspectorModal';
import { UserLoginModal } from './components/UserLoginModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { Trophy, FileJson, Shield, Flame, Skull } from 'lucide-react';
export default function App({ onLogout }) {
    // Current user & skin
    const [user, setUser] = useState(DEFAULT_USER);
    const [soundMuted, setSoundMuted] = useState(() => sound.getMuted());
    const [scores, setScores] = useState([]);
    const [difficulty, setDifficulty] = useState('medium');
    // Modals
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isJsonInspectorOpen, setIsJsonInspectorOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [gameOverData, setGameOverData] = useState({
        isOpen: false,
        score: 0,
        applesEaten: 0,
        snakeLength: 3,
        difficulty: 'medium',
        isPersonalBest: false,
        isGlobalBest: false
    });
    // Load initial user and scores
    const loadInitialData = useCallback(async () => {
        const savedName = getSavedActiveUsername();
        const loggedUser = await loginUser(savedName);
        setUser(loggedUser);
        const fetchedScores = await fetchScores();
        setScores(fetchedScores);
    }, []);
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);
    // Handle game over callback
    const handleGameOver = useCallback(async (finalScore, finalLength, apples, diff) => {
        if (finalScore > 0) {
            const result = await saveScore({
                username: user.username,
                score: finalScore,
                difficulty: diff,
                length: finalLength,
                applesEaten: apples
            });
            // Refresh scores list
            const updatedScores = await fetchScores();
            setScores(updatedScores);
            // Update user's personal best in local state if higher
            setUser((prev) => {
                const currentBest = prev.highScores?.[diff] || 0;
                return {
                    ...prev,
                    gamesPlayed: prev.gamesPlayed + 1,
                    highScores: {
                        ...prev.highScores,
                        [diff]: Math.max(currentBest, finalScore)
                    }
                };
            });
            if (result.isGlobalBest) {
                sound.playHighScore();
            }
            setGameOverData({
                isOpen: true,
                score: finalScore,
                applesEaten: apples,
                snakeLength: finalLength,
                difficulty: diff,
                isPersonalBest: result.isPersonalBest,
                isGlobalBest: result.isGlobalBest
            });
        }
        else {
            setGameOverData({
                isOpen: true,
                score: 0,
                applesEaten: 0,
                snakeLength: finalLength,
                difficulty: diff,
                isPersonalBest: false,
                isGlobalBest: false
            });
        }
    }, [user.username]);
    // Snake game hook
    const { status, score, applesEaten, snake, prevSnake, direction, food, bonusFood, bonusTimeRemaining, obstacles, particles, floatingTexts, shake, progress, startGame, pauseGame, resumeGame, restartGame, changeDirection, setDifficulty: setGameDifficulty } = useSnakeGame(difficulty, handleGameOver);
    // Sync difficulty changes
    const handleDifficultyChange = (newDiff) => {
        setDifficulty(newDiff);
        setGameDifficulty(newDiff);
    };
    // Sound toggle
    const handleToggleSound = () => {
        const muted = sound.toggleMute();
        setSoundMuted(muted);
    };
    // User save & switch
    const handleSaveUser = async (username, skinId) => {
        const updated = await loginUser(username, skinId);
        setUser(updated);
        // Reload scores
        const refreshed = await fetchScores();
        setScores(refreshed);
    };
    // Re-fetch scores
    const handleRefreshScores = async () => {
        const s = await fetchScores();
        setScores(s);
    };
    // Personal Best and Global Best for active difficulty
    const personalBest = user.highScores?.[difficulty] || 0;
    const currentDiffScores = scores.filter((s) => s.difficulty === difficulty);
    const globalBest = currentDiffScores.length > 0 ? currentDiffScores[0].score : 0;
    const activeSkin = getSkinById(user.avatar);
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans", children: [_jsx(TopBar, { user: user, soundMuted: soundMuted, onToggleSound: handleToggleSound, onLogout: onLogout, onOpenUserModal: () => setIsUserModalOpen(true), onOpenLeaderboard: () => setIsLeaderboardOpen(true), onOpenJsonInspector: () => setIsJsonInspectorOpen(true), onOpenRules: () => setIsRulesOpen(true) }), _jsx("main", { className: "flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col gap-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [_jsxs("aside", { className: "lg:col-span-4 flex flex-col gap-5 order-2 lg:order-1", children: [_jsxs("div", { className: "p-4 sm:p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center relative shadow-md", style: {
                                                                background: `linear-gradient(135deg, ${activeSkin.headColor}, ${activeSkin.bodyGradientEnd})`,
                                                                boxShadow: `0 0 12px ${activeSkin.glowColor}`
                                                            }, children: _jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: activeSkin.eyeColor } }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-bold text-white flex items-center gap-1.5", children: _jsx("span", { children: user.username }) }), _jsxs("div", { className: "text-[11px] text-slate-400", children: ["Skin: ", _jsx("span", { className: "text-emerald-400 font-medium", children: activeSkin.name })] })] })] }), _jsx("button", { onClick: () => setIsUserModalOpen(true), className: "text-xs text-slate-400 hover:text-white py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer", children: "Edit Profile" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-center", children: [_jsxs("div", { className: "p-2 rounded-xl bg-slate-950/70 border border-slate-800/60", children: [_jsxs("div", { className: "text-[10px] text-slate-500 uppercase font-medium flex items-center justify-center gap-1", children: [_jsx(Shield, { className: "w-2.5 h-2.5 text-emerald-400" }), _jsx("span", { children: "Easy" })] }), _jsx("div", { className: "text-xs font-bold font-mono text-emerald-400 tabular-nums mt-0.5", children: user.highScores?.easy || 0 })] }), _jsxs("div", { className: "p-2 rounded-xl bg-slate-950/70 border border-slate-800/60", children: [_jsxs("div", { className: "text-[10px] text-slate-500 uppercase font-medium flex items-center justify-center gap-1", children: [_jsx(Flame, { className: "w-2.5 h-2.5 text-cyan-400" }), _jsx("span", { children: "Medium" })] }), _jsx("div", { className: "text-xs font-bold font-mono text-cyan-400 tabular-nums mt-0.5", children: user.highScores?.medium || 0 })] }), _jsxs("div", { className: "p-2 rounded-xl bg-slate-950/70 border border-slate-800/60", children: [_jsxs("div", { className: "text-[10px] text-slate-500 uppercase font-medium flex items-center justify-center gap-1", children: [_jsx(Skull, { className: "w-2.5 h-2.5 text-rose-400" }), _jsx("span", { children: "Hard" })] }), _jsx("div", { className: "text-xs font-bold font-mono text-rose-400 tabular-nums mt-0.5", children: user.highScores?.hard || 0 })] })] })] }), _jsx("div", { className: "p-4 sm:p-5 bg-slate-900/60 border border-slate-800 rounded-2xl", children: _jsx(DifficultySelector, { currentDifficulty: difficulty, onSelect: handleDifficultyChange, disabled: status === 'PLAYING' }) }), _jsxs("div", { className: "p-4 sm:p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-4 h-4 text-amber-400" }), _jsxs("h4", { className: "text-xs font-bold text-slate-300 uppercase tracking-wide", children: ["Top Scores (", difficulty, ")"] })] }), _jsx("button", { onClick: () => setIsLeaderboardOpen(true), className: "text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer", children: "View All" })] }), _jsx("div", { className: "flex flex-col divide-y divide-slate-800/60", children: currentDiffScores.slice(0, 4).length === 0 ? (_jsx("div", { className: "py-4 text-center text-xs text-slate-500", children: "No scores yet. Be the first!" })) : (currentDiffScores.slice(0, 4).map((entry, idx) => {
                                                const isYou = entry.username.toLowerCase() === user.username.toLowerCase();
                                                return (_jsxs("div", { className: "py-2 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-[11px] font-mono text-slate-500 font-bold w-4", children: ["#", idx + 1] }), _jsx("span", { className: `font-medium ${isYou ? 'text-emerald-400' : 'text-slate-300'}`, children: entry.username }), isYou && (_jsx("span", { className: "text-[9px] text-emerald-400 font-mono", children: "(You)" }))] }), _jsx("span", { className: "font-mono font-bold text-slate-200 tabular-nums", children: entry.score })] }, entry.id || idx));
                                            })) }), _jsxs("button", { onClick: () => setIsJsonInspectorOpen(true), className: "w-full mt-1 py-2 px-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer", children: [_jsx(FileJson, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Open JSON Database" })] })] })] }), _jsxs("div", { className: "lg:col-span-8 flex flex-col gap-4 order-1 lg:order-2", children: [_jsx(ScoreBoard, { score: score, applesEaten: applesEaten, snakeLength: snake.length, difficulty: difficulty, personalBest: personalBest, globalBest: globalBest, status: status, onStart: startGame, onPause: pauseGame, onResume: resumeGame, onRestart: restartGame }), _jsx(SnakeCanvas, { status: status, snake: snake, prevSnake: prevSnake, direction: direction, food: food, bonusFood: bonusFood, bonusTimeRemaining: bonusTimeRemaining, obstacles: obstacles, particles: particles, floatingTexts: floatingTexts, shake: shake, progress: progress, skin: activeSkin, wrapWalls: DIFFICULTY_CONFIGS[difficulty].wrapWalls, onDirectionChange: changeDirection, onStart: startGame, onResume: resumeGame, onPause: pauseGame, onRestart: restartGame }), _jsx(MobileControls, { status: status, onDirectionChange: changeDirection, onPause: pauseGame, onResume: resumeGame, onRestart: restartGame })] })] }) }), _jsx("footer", { className: "border-t border-slate-900 bg-slate-950 py-5 px-6 text-xs text-slate-500 mt-auto", children: _jsxs("div", { className: "max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "Serpentis Arcade" }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: "Smooth 60FPS Physics" }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "text-slate-400", children: "Browser Local Storage" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setIsRulesOpen(true), className: "hover:text-slate-300 transition-colors cursor-pointer", children: "Rules" }), _jsx("button", { onClick: () => setIsLeaderboardOpen(true), className: "hover:text-slate-300 transition-colors cursor-pointer", children: "Leaderboard" }), _jsxs("button", { onClick: () => setIsJsonInspectorOpen(true), className: "hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1", children: [_jsx(FileJson, { className: "w-3 h-3" }), _jsx("span", { children: "localStorage" })] })] })] }) }), _jsx(LeaderboardModal, { isOpen: isLeaderboardOpen, onClose: () => setIsLeaderboardOpen(false), scores: scores, currentUsername: user.username, onRefresh: handleRefreshScores, onOpenJsonInspector: () => setIsJsonInspectorOpen(true) }), _jsx(JsonInspectorModal, { isOpen: isJsonInspectorOpen, onClose: () => setIsJsonInspectorOpen(false), onScoresUpdated: handleRefreshScores }), _jsx(UserLoginModal, { isOpen: isUserModalOpen, onClose: () => setIsUserModalOpen(false), currentUser: user, onSaveUser: handleSaveUser }), _jsx(RulesModal, { isOpen: isRulesOpen, onClose: () => setIsRulesOpen(false) }), _jsx(GameOverModal, { isOpen: gameOverData.isOpen, score: gameOverData.score, applesEaten: gameOverData.applesEaten, snakeLength: gameOverData.snakeLength, difficulty: gameOverData.difficulty, isPersonalBest: gameOverData.isPersonalBest, isGlobalBest: gameOverData.isGlobalBest, onRestart: () => {
                    setGameOverData((prev) => ({ ...prev, isOpen: false }));
                    restartGame();
                }, onOpenLeaderboard: () => {
                    setGameOverData((prev) => ({ ...prev, isOpen: false }));
                    setIsLeaderboardOpen(true);
                } })] }));
}
