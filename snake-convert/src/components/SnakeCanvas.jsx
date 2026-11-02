import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useEffect, useCallback } from 'react';
import { GRID_SIZE } from '../game/constants';
import { Play, Pause, RotateCcw } from 'lucide-react';
export const SnakeCanvas = ({ status, snake, prevSnake, direction, food, bonusFood, bonusTimeRemaining, obstacles, particles, floatingTexts, shake, progress, skin, wrapWalls, onDirectionChange, onStart, onResume, onPause, onRestart }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const touchStartRef = useRef(null);
    // Touch & Swipe gestures for mobile
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    };
    const handleTouchEnd = (e) => {
        if (!touchStartRef.current || e.changedTouches.length === 0)
            return;
        const start = touchStartRef.current;
        const end = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const minSwipeDistance = 25;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > minSwipeDistance) {
                if (dx > 0)
                    onDirectionChange('RIGHT');
                else
                    onDirectionChange('LEFT');
            }
        }
        else {
            if (Math.abs(dy) > minSwipeDistance) {
                if (dy > 0)
                    onDirectionChange('DOWN');
                else
                    onDirectionChange('UP');
            }
        }
        touchStartRef.current = null;
    };
    // Render routine
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const width = canvas.width;
        const height = canvas.height;
        const cellSize = width / GRID_SIZE;
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        // Apply shake effect if active
        if (shake > 0.05) {
            const shakeX = (Math.random() - 0.5) * shake * 2.5;
            const shakeY = (Math.random() - 0.5) * shake * 2.5;
            ctx.translate(shakeX, shakeY);
        }
        // 1. Grid Background
        ctx.fillStyle = '#090d16'; // Deep midnight dark slate
        ctx.fillRect(0, 0, width, height);
        // Subtle checkerboard pattern
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if ((r + c) % 2 === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
                    ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            }
        }
        // Hairline grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= GRID_SIZE; i++) {
            const pos = i * cellSize;
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, height);
            ctx.moveTo(0, pos);
            ctx.lineTo(width, pos);
        }
        ctx.stroke();
        // 2. Arena Wall Border
        ctx.lineWidth = 2;
        if (wrapWalls) {
            // Dotted/dashed border in easy mode to indicate wrap-around portals
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
            ctx.setLineDash([6, 6]);
        }
        else {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
            ctx.setLineDash([]);
        }
        ctx.strokeRect(1, 1, width - 2, height - 2);
        ctx.setLineDash([]);
        // 3. Obstacles (Hard mode)
        obstacles.forEach((obs) => {
            const ox = obs.x * cellSize;
            const oy = obs.y * cellSize;
            const pad = cellSize * 0.08;
            ctx.save();
            // Obstacle block
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.fillRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
            ctx.strokeRect(ox + pad, oy + pad, cellSize - pad * 2, cellSize - pad * 2);
            // Warning hazard stripes inside
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ox + pad, oy + cellSize - pad);
            ctx.lineTo(ox + cellSize - pad, oy + pad);
            ctx.stroke();
            ctx.restore();
        });
        // 4. Standard Food (Apple)
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const time = Date.now();
        const pulse = Math.sin(time / 220) * (cellSize * 0.06);
        const appleRadius = cellSize * 0.38 + pulse;
        ctx.save();
        // Ambient red glow
        const foodGlow = ctx.createRadialGradient(fx, fy, 2, fx, fy, cellSize * 0.9);
        foodGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        foodGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = foodGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, cellSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        // Apple body gradient
        const appleGrad = ctx.createRadialGradient(fx - appleRadius * 0.3, fy - appleRadius * 0.3, 2, fx, fy, appleRadius);
        appleGrad.addColorStop(0, '#f87171');
        appleGrad.addColorStop(0.7, '#dc2626');
        appleGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = appleGrad;
        ctx.beginPath();
        ctx.arc(fx, fy + appleRadius * 0.1, appleRadius * 0.92, 0, Math.PI * 2);
        ctx.fill();
        // Apple stem
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = cellSize * 0.09;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fx, fy - appleRadius * 0.7);
        ctx.quadraticCurveTo(fx + cellSize * 0.12, fy - appleRadius * 1.25, fx + cellSize * 0.1, fy - appleRadius * 1.35);
        ctx.stroke();
        // Leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(fx + cellSize * 0.14, fy - appleRadius * 0.95, cellSize * 0.14, cellSize * 0.08, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 5. Bonus Food (Golden Apple)
        if (bonusFood) {
            const bfx = bonusFood.x * cellSize + cellSize / 2;
            const bfy = bonusFood.y * cellSize + cellSize / 2;
            const goldPulse = Math.sin(time / 140) * (cellSize * 0.08);
            const goldRadius = cellSize * 0.42 + goldPulse;
            ctx.save();
            // Radiant golden aura
            const goldGlow = ctx.createRadialGradient(bfx, bfy, 2, bfx, bfy, cellSize * 1.2);
            goldGlow.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
            goldGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = goldGlow;
            ctx.beginPath();
            ctx.arc(bfx, bfy, cellSize * 1.2, 0, Math.PI * 2);
            ctx.fill();
            // Golden apple body
            const goldGrad = ctx.createRadialGradient(bfx - goldRadius * 0.35, bfy - goldRadius * 0.35, 2, bfx, bfy, goldRadius);
            goldGrad.addColorStop(0, '#fef08a');
            goldGrad.addColorStop(0.5, '#f59e0b');
            goldGrad.addColorStop(1, '#b45309');
            ctx.fillStyle = goldGrad;
            ctx.beginPath();
            ctx.arc(bfx, bfy, goldRadius, 0, Math.PI * 2);
            ctx.fill();
            // Sparkle highlights
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(bfx - goldRadius * 0.35, bfy - goldRadius * 0.35, goldRadius * 0.22, 0, Math.PI * 2);
            ctx.fill();
            // Golden timer ring
            if (bonusTimeRemaining > 0 && bonusFood.durationMs) {
                const totalDuration = bonusFood.durationMs;
                const elapsed = time - bonusFood.spawnTime;
                const progressLeft = Math.max(0, 1 - elapsed / totalDuration);
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(bfx, bfy, cellSize * 0.65, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressLeft, false);
                ctx.stroke();
                // Seconds indicator text
                ctx.fillStyle = '#fef08a';
                ctx.font = `bold ${Math.max(10, Math.floor(cellSize * 0.38))}px JetBrains Mono`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${bonusTimeRemaining}s`, bfx, bfy - cellSize * 0.85);
            }
            ctx.restore();
        }
        // 6. Smooth Interpolated Snake Body
        if (snake.length > 0) {
            const snakeLength = snake.length;
            // Calculate interpolated center points for each segment
            const points = [];
            for (let i = 0; i < snakeLength; i++) {
                const cur = snake[i];
                const prev = prevSnake[i] || cur;
                // If wrapped across wall, do not interpolate line across the entire screen
                const wrapped = Math.abs(cur.x - prev.x) > 1 || Math.abs(cur.y - prev.y) > 1;
                const ix = wrapped ? cur.x : prev.x + (cur.x - prev.x) * progress;
                const iy = wrapped ? cur.y : prev.y + (cur.y - prev.y) * progress;
                points.push({
                    x: ix * cellSize + cellSize / 2,
                    y: iy * cellSize + cellSize / 2
                });
            }
            // Draw body segments from tail to head
            for (let i = points.length - 1; i >= 1; i--) {
                const pt = points[i];
                const nextPt = points[i - 1];
                const taperRatio = 1 - (i / snakeLength) * 0.35; // gentle tail taper
                const segRadius = (cellSize * 0.4) * taperRatio;
                ctx.save();
                // Body segment capsule
                ctx.fillStyle = i % 2 === 0 ? skin.bodyGradientStart : skin.bodyGradientEnd;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, segRadius, 0, Math.PI * 2);
                ctx.fill();
                // Connect with pill stroke between adjacent segments if not wrapped
                const dist = Math.hypot(nextPt.x - pt.x, nextPt.y - pt.y);
                if (dist < cellSize * 1.5) {
                    ctx.strokeStyle = skin.bodyGradientStart;
                    ctx.lineWidth = segRadius * 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(pt.x, pt.y);
                    ctx.lineTo(nextPt.x, nextPt.y);
                    ctx.stroke();
                }
                // Spine detail highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, segRadius * 0.35, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            // 7. Snake Head
            const headPt = points[0];
            const headRadius = cellSize * 0.44;
            ctx.save();
            // Head ambient glow
            ctx.shadowColor = skin.headColor;
            ctx.shadowBlur = 12;
            ctx.fillStyle = skin.headColor;
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, headRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow
            // Dynamic Eye positioning based on direction
            let eye1 = { x: 0, y: 0 };
            let eye2 = { x: 0, y: 0 };
            let eyeOffsetFwd = headRadius * 0.35;
            let eyeOffsetSide = headRadius * 0.48;
            if (direction === 'RIGHT') {
                eye1 = { x: headPt.x + eyeOffsetFwd, y: headPt.y - eyeOffsetSide };
                eye2 = { x: headPt.x + eyeOffsetFwd, y: headPt.y + eyeOffsetSide };
            }
            else if (direction === 'LEFT') {
                eye1 = { x: headPt.x - eyeOffsetFwd, y: headPt.y - eyeOffsetSide };
                eye2 = { x: headPt.x - eyeOffsetFwd, y: headPt.y + eyeOffsetSide };
            }
            else if (direction === 'UP') {
                eye1 = { x: headPt.x - eyeOffsetSide, y: headPt.y - eyeOffsetFwd };
                eye2 = { x: headPt.x + eyeOffsetSide, y: headPt.y - eyeOffsetFwd };
            }
            else if (direction === 'DOWN') {
                eye1 = { x: headPt.x - eyeOffsetSide, y: headPt.y + eyeOffsetFwd };
                eye2 = { x: headPt.x + eyeOffsetSide, y: headPt.y + eyeOffsetFwd };
            }
            // Eye whites / outer
            const eyeSize = headRadius * 0.32;
            [eye1, eye2].forEach((eye) => {
                ctx.fillStyle = skin.eyeColor;
                ctx.beginPath();
                ctx.arc(eye.x, eye.y, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                // Eye pupils looking in heading direction
                let pupilDx = 0;
                let pupilDy = 0;
                const pMag = eyeSize * 0.4;
                if (direction === 'RIGHT')
                    pupilDx = pMag;
                if (direction === 'LEFT')
                    pupilDx = -pMag;
                if (direction === 'UP')
                    pupilDy = -pMag;
                if (direction === 'DOWN')
                    pupilDy = pMag;
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(eye.x + pupilDx, eye.y + pupilDy, eyeSize * 0.52, 0, Math.PI * 2);
                ctx.fill();
            });
            // Animated flicking tongue
            const tongueCycle = (time % 1800);
            if (tongueCycle < 350) {
                const tongueProgress = Math.sin((tongueCycle / 350) * Math.PI);
                const tLen = headRadius * 1.1 * tongueProgress;
                let tx = headPt.x;
                let ty = headPt.y;
                if (direction === 'RIGHT')
                    tx += headRadius + tLen;
                if (direction === 'LEFT')
                    tx -= headRadius + tLen;
                if (direction === 'UP')
                    ty -= headRadius + tLen;
                if (direction === 'DOWN')
                    ty += headRadius + tLen;
                ctx.strokeStyle = '#f43f5e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (direction === 'RIGHT') {
                    ctx.moveTo(headPt.x + headRadius, headPt.y);
                    ctx.lineTo(tx, ty);
                    ctx.lineTo(tx + 4, ty - 3);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx + 4, ty + 3);
                }
                else if (direction === 'LEFT') {
                    ctx.moveTo(headPt.x - headRadius, headPt.y);
                    ctx.lineTo(tx, ty);
                    ctx.lineTo(tx - 4, ty - 3);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx - 4, ty + 3);
                }
                else if (direction === 'UP') {
                    ctx.moveTo(headPt.x, headPt.y - headRadius);
                    ctx.lineTo(tx, ty);
                    ctx.lineTo(tx - 3, ty - 4);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx + 3, ty - 4);
                }
                else {
                    ctx.moveTo(headPt.x, headPt.y + headRadius);
                    ctx.lineTo(tx, ty);
                    ctx.lineTo(tx - 3, ty + 4);
                    ctx.moveTo(tx, ty);
                    ctx.lineTo(tx + 3, ty + 4);
                }
                ctx.stroke();
            }
            ctx.restore();
        }
        // 8. Particles
        particles.forEach((p) => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        // 9. Floating score popups
        floatingTexts.forEach((ft) => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.font = `bold ${Math.max(12, Math.floor(cellSize * 0.55))}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x * cellSize, ft.y * cellSize);
            ctx.restore();
        });
        ctx.restore();
    }, [
        status,
        snake,
        prevSnake,
        direction,
        food,
        bonusFood,
        bonusTimeRemaining,
        obstacles,
        particles,
        floatingTexts,
        shake,
        progress,
        skin,
        wrapWalls
    ]);
    // Adjust canvas size to parent container with Retina DPR
    useEffect(() => {
        const handleResize = () => {
            const container = containerRef.current;
            const canvas = canvasRef.current;
            if (!container || !canvas)
                return;
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const side = Math.floor(Math.min(rect.width, rect.height));
            if (side > 0) {
                canvas.width = side * dpr;
                canvas.height = side * dpr;
                canvas.style.width = `${side}px`;
                canvas.style.height = `${side}px`;
                render();
            }
        };
        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [render]);
    // Run render loop
    useEffect(() => {
        render();
    }, [render]);
    return (_jsxs("div", { ref: containerRef, className: "relative w-full aspect-square max-w-[620px] mx-auto flex items-center justify-center rounded-2xl bg-slate-950 p-2 border border-slate-800 shadow-2xl overflow-hidden select-none touch-none", onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd, children: [_jsx("canvas", { ref: canvasRef, className: "rounded-xl block cursor-crosshair" }), status === 'IDLE' && (_jsxs("div", { className: "absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 transition-opacity", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/50", children: _jsx(Play, { className: "w-8 h-8 translate-x-0.5 fill-current" }) }), _jsx("h2", { className: "text-2xl font-bold tracking-tight text-white mb-2 font-display", children: "Ready to Glide?" }), _jsx("p", { className: "text-sm text-slate-400 max-w-xs mb-6", children: "Use Arrow keys or WASD to control. Collect apples, avoid self-collision, and climb the JSON leaderboard." }), _jsxs("button", { onClick: onStart, className: "px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2", children: [_jsx(Play, { className: "w-4 h-4 fill-current" }), _jsx("span", { children: "Start Game" })] })] })), status === 'PAUSED' && (_jsxs("div", { className: "absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-lg", children: _jsx(Pause, { className: "w-7 h-7" }) }), _jsx("h3", { className: "text-xl font-bold text-white mb-1 font-display", children: "Game Paused" }), _jsx("p", { className: "text-xs text-slate-400 mb-5", children: "Press Spacebar or click Resume to continue" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: onResume, className: "px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5", children: [_jsx(Play, { className: "w-4 h-4 fill-current" }), _jsx("span", { children: "Resume" })] }), _jsxs("button", { onClick: onRestart, className: "px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-1.5", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Restart" })] })] })] }))] }));
};
