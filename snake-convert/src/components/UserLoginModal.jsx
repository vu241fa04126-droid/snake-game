import React, { useState } from 'react';
import { SNAKE_SKINS } from '../utils/skins';

export function UserLoginModal({ isOpen, onClose, currentUser, onSaveUser }) {
  const [selectedSkin, setSelectedSkin] = useState(currentUser.avatar || 'emerald');
  const [saving, setSaving] = useState(false);
  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSaveUser(currentUser.username, selectedSkin);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold">Player profile</h2>
        <p className="mt-1 text-sm text-slate-400">Logged in as <strong>{currentUser.username}</strong></p>
        <p className="mt-5 mb-3 text-sm font-semibold">Choose your snake skin</p>
        <div className="grid grid-cols-1 gap-2">
          {SNAKE_SKINS.map((skin) => (
            <button key={skin.id} type="button" onClick={() => setSelectedSkin(skin.id)}
              className={`rounded-xl border p-3 text-left ${selectedSkin === skin.id ? 'border-emerald-400 bg-slate-800' : 'border-slate-700 bg-slate-950'}`}>
              <span className="font-semibold">{skin.name}</span>
              {selectedSkin === skin.id && <span className="float-right text-emerald-400">✓</span>}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">{saving ? 'Saving…' : 'Save skin'}</button>
        </div>
      </form>
    </div>
  );
}
