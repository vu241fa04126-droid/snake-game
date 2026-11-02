import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { DIFFICULTY_CONFIGS } from '../game/constants';
import { Shield, Flame, Skull } from 'lucide-react';
export const DifficultySelector = ({ currentDifficulty, onSelect, disabled = false }) => {
    const difficulties = [
        { key: 'easy', icon: _jsx(Shield, { className: "w-3.5 h-3.5" }) },
        { key: 'medium', icon: _jsx(Flame, { className: "w-3.5 h-3.5" }) },
        { key: 'hard', icon: _jsx(Skull, { className: "w-3.5 h-3.5" }) }
    ];
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-xs font-semibold text-slate-400 tracking-wide uppercase", children: "Difficulty Mode" }), _jsxs("span", { className: "text-xs text-slate-500 font-mono", children: [DIFFICULTY_CONFIGS[currentDifficulty].initialTickMs, "ms base"] })] }), _jsx("div", { className: "grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl", children: difficulties.map(({ key, icon }) => {
                    const cfg = DIFFICULTY_CONFIGS[key];
                    const isActive = currentDifficulty === key;
                    return (_jsxs("button", { disabled: disabled, onClick: () => onSelect(key), className: `flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                            ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`, children: [_jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [_jsx("span", { style: { color: isActive ? cfg.color : undefined }, className: !isActive ? 'text-slate-500' : '', children: icon }), _jsx("span", { className: "font-semibold", children: cfg.name })] }), _jsx("span", { className: "text-[10px] text-slate-500 truncate max-w-full", children: key === 'easy' ? 'Wrap Walls' : key === 'medium' ? 'Lethal Walls' : 'Obstacles' })] }, key));
                }) }), _jsx("p", { className: "text-[11px] text-slate-500 mt-2 leading-relaxed", children: DIFFICULTY_CONFIGS[currentDifficulty].description })] }));
};
