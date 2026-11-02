import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Trophy, X, RefreshCw, FileJson } from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../game/constants';
export const LeaderboardModal = ({ isOpen, onClose, scores, currentUsername, onRefresh, onOpenJsonInspector }) => {
    const [filter, setFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    if (!isOpen)
        return null;
    const filteredScores = filter === 'all'
        ? scores
        : scores.filter((s) => s.difficulty === filter);
    const handleRefreshClick = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => setIsRefreshing(false), 400);
    };
    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        catch {
            return dateStr;
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto", children: _jsxs("div", { className: "w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400", children: _jsx(Trophy, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white font-display", children: "Arcade Leaderboard" }), _jsx("p", { className: "text-xs text-slate-400", children: "Scores saved in this browser" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: handleRefreshClick, title: "Refresh Leaderboard", className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer", children: _jsx(RefreshCw, { className: `w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}` }) }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3", children: [_jsx("div", { className: "flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800/70", children: ['all', 'easy', 'medium', 'hard'].map((diff) => {
                                const active = filter === diff;
                                return (_jsx("button", { onClick: () => setFilter(diff), className: `px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer capitalize ${active
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'}`, children: diff }, diff));
                            }) }), _jsxs("button", { onClick: () => {
                                onClose();
                                onOpenJsonInspector();
                            }, className: "flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-cyan-950/30", children: [_jsx(FileJson, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Inspect JSON File" })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2", children: filteredScores.length === 0 ? (_jsx("div", { className: "text-center py-12 text-slate-500 text-xs", children: "No scores recorded yet for this mode. Start a game to set the first record!" })) : (filteredScores.map((entry, index) => {
                        const isCurrentUser = entry.username.toLowerCase() === currentUsername.toLowerCase();
                        const rank = index + 1;
                        const cfg = DIFFICULTY_CONFIGS[entry.difficulty];
                        return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-xl transition-colors ${isCurrentUser ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-slate-800/40'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0", children: rank === 1 ? (_jsx("span", { className: "text-amber-400 text-sm", children: "\uD83E\uDD47" })) : rank === 2 ? (_jsx("span", { className: "text-slate-300 text-sm", children: "\uD83E\uDD48" })) : rank === 3 ? (_jsx("span", { className: "text-amber-600 text-sm", children: "\uD83E\uDD49" })) : (_jsxs("span", { className: "text-slate-500 font-mono", children: ["#", rank] })) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-sm font-semibold ${isCurrentUser ? 'text-emerald-400' : 'text-slate-100'}`, children: entry.username }), isCurrentUser && (_jsx("span", { className: "text-[10px] text-emerald-400 font-mono", children: "(You)" }))] }), _jsxs("div", { className: "flex items-center gap-2 text-[11px] text-slate-500 mt-0.5", children: [_jsx("span", { style: { color: cfg?.color || '#94a3b8' }, className: "font-medium capitalize", children: entry.difficulty }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsxs("span", { children: ["Length: ", entry.length] }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: formatDate(entry.date) })] })] })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsx("div", { className: "text-lg font-bold font-mono tabular-nums tracking-tight", style: { color: cfg?.color || '#38bdf8' }, children: entry.score }), _jsxs("div", { className: "text-[10px] text-slate-500 font-mono", children: [entry.applesEaten, " apples"] })] })] }, entry.id || index));
                    })) }), _jsxs("div", { className: "p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: ["Total records: ", filteredScores.length] }), _jsxs("span", { children: ["Saved in ", _jsx("code", { className: "text-slate-400", children: "localStorage" })] })] })] }) }));
};
