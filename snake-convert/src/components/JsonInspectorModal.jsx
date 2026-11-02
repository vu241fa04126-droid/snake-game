import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { exportRawScoresJson, importScoresJson, resetScores } from '../utils/storage';
import { Code2, Download, Copy, Check, RefreshCw, Upload, AlertCircle, X } from 'lucide-react';
export const JsonInspectorModal = ({ isOpen, onClose, onScoresUpdated }) => {
    const [jsonText, setJsonText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [importStatus, setImportStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const loadData = async () => {
        setIsLoading(true);
        setImportStatus(null);
        try {
            const text = await exportRawScoresJson();
            setJsonText(text);
        }
        catch {
            setJsonText('[]');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            loadData();
            setIsEditing(false);
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            // fallback
        }
    };
    const handleDownload = () => {
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `serpentis-scores-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const handleSaveImport = async () => {
        const res = await importScoresJson(jsonText);
        if (res.success) {
            setImportStatus({
                success: true,
                message: `Successfully imported and persisted ${res.count} scores to JSON!`
            });
            setIsEditing(false);
            onScoresUpdated();
        }
        else {
            setImportStatus({
                success: false,
                message: res.error || 'Failed to import JSON.'
            });
        }
    };
    const handleResetDefaults = async () => {
        if (window.confirm('Reset all scores back to default seed entries?')) {
            await resetScores();
            await loadData();
            onScoresUpdated();
            setImportStatus({ success: true, message: 'Scores reset to defaults.' });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto", children: _jsxs("div", { className: "w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400", children: _jsx(Code2, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white font-display", children: "JSON Score Database" }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Browser storage: ", _jsx("code", { className: "text-cyan-400", children: "localStorage" })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: loadData, title: "Reload scores from browser storage", className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer", children: _jsx(RefreshCw, { className: `w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}` }) }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "px-6 py-2.5 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-2 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: handleCopy, className: "flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer font-medium", children: [copied ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }), _jsx("span", { children: copied ? 'Copied!' : 'Copy JSON' })] }), _jsxs("button", { onClick: handleDownload, className: "flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer font-medium", children: [_jsx(Download, { className: "w-3.5 h-3.5 text-cyan-400" }), _jsx("span", { children: "Download .json" })] }), _jsxs("button", { onClick: () => setIsEditing(!isEditing), className: `flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer font-medium ${isEditing
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`, children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), _jsx("span", { children: isEditing ? 'Editing Mode' : 'Edit / Import' })] })] }), _jsx("button", { onClick: handleResetDefaults, className: "text-xs text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer py-1 px-2", children: "Reset Defaults" })] }), importStatus && (_jsxs("div", { className: `mx-6 mt-3 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 ${importStatus.success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`, children: [importStatus.success ? _jsx(Check, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: importStatus.message })] })), _jsx("div", { className: "flex-1 p-6 overflow-hidden flex flex-col", children: isEditing ? (_jsxs("div", { className: "flex-1 flex flex-col gap-2", children: [_jsx("label", { className: "text-xs text-slate-400", children: "Paste valid JSON array of score objects below, then click \u201CApply & Save Changes\u201D:" }), _jsx("textarea", { value: jsonText, onChange: (e) => setJsonText(e.target.value), className: "flex-1 w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed", rows: 14, spellCheck: false }), _jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [_jsx("button", { onClick: () => {
                                            setIsEditing(false);
                                            loadData();
                                        }, className: "px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer", children: "Cancel" }), _jsx("button", { onClick: handleSaveImport, className: "px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer", children: "Apply & Save Changes" })] })] })) : (_jsx("div", { className: "flex-1 overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-400/90 leading-relaxed", children: _jsx("pre", { className: "whitespace-pre", children: jsonText }) })) }), _jsxs("div", { className: "px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: ["Schema: ", _jsx("code", { className: "text-slate-400", children: "[{ id, username, score, difficulty, length, date }]" })] }), _jsx("span", { children: "Verified UTF-8 JSON" })] })] }) }));
};
