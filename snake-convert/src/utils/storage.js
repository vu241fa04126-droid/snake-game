const STORAGE_ACTIVE_USER = 'serpentis_active_username';
const STORAGE_LOCAL_SCORES = 'serpentis_cached_scores';
const STORAGE_LOCAL_USER = 'serpentis_cached_user';

function readScores() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_LOCAL_SCORES) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeScores(scores) {
  localStorage.setItem(STORAGE_LOCAL_SCORES, JSON.stringify(scores));
}

export const DEFAULT_USER = {
  username: 'Player',
  avatar: 'emerald',
  theme: 'emerald',
  createdAt: new Date().toISOString(),
  gamesPlayed: 0,
  highScores: { easy: 0, medium: 0, hard: 0 }
};

export async function loginUser(username, avatar = 'emerald', theme = 'classic') {
  const cleanName = username.trim().slice(0, 20) || 'Player';
  const profileKey = `serpentis_profile_${cleanName.toLowerCase()}`;
  let user;
  try {
    user = JSON.parse(localStorage.getItem(profileKey) || 'null');
  } catch {
    user = null;
  }
  if (!user) user = { ...DEFAULT_USER, username: cleanName, highScores: { ...DEFAULT_USER.highScores } };
  user.avatar = avatar || user.avatar || 'emerald';
  user.theme = theme || user.theme || 'classic';
  localStorage.setItem(STORAGE_ACTIVE_USER, user.username);
  localStorage.setItem(profileKey, JSON.stringify(user));
  localStorage.setItem(STORAGE_LOCAL_USER, JSON.stringify(user));
  return user;
}

export function getSavedActiveUsername() {
  return localStorage.getItem(STORAGE_ACTIVE_USER) || 'Player';
}

export async function fetchScores(difficulty) {
  const scores = readScores();
  if (difficulty && difficulty !== 'all') return scores.filter(score => score.difficulty === difficulty);
  return scores;
}

export async function saveScore(params) {
  const newEntry = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: params.username,
    score: Number(params.score) || 0,
    difficulty: params.difficulty,
    length: params.length,
    applesEaten: params.applesEaten,
    date: new Date().toISOString()
  };
  const scores = readScores();
  const previousBest = scores.filter(score => score.username.toLowerCase() === params.username.toLowerCase() && score.difficulty === params.difficulty).reduce((best, score) => Math.max(best, score.score), 0);
  scores.push(newEntry);
  scores.sort((a, b) => b.score - a.score);
  writeScores(scores);

  const profileKey = `serpentis_profile_${params.username.toLowerCase()}`;
  try {
    const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
    if (profile) {
      profile.gamesPlayed = (profile.gamesPlayed || 0) + 1;
      profile.highScores = { easy: 0, medium: 0, hard: 0, ...(profile.highScores || {}) };
      profile.highScores[params.difficulty] = Math.max(profile.highScores[params.difficulty] || 0, newEntry.score);
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(STORAGE_LOCAL_USER, JSON.stringify(profile));
    }
  } catch { /* Ignore an unavailable profile cache. */ }

  return {
    isPersonalBest: newEntry.score > previousBest,
    isGlobalBest: scores[0]?.id === newEntry.id,
    newEntry
  };
}

export async function exportRawScoresJson() {
  return JSON.stringify(readScores(), null, 2);
}

export async function importScoresJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return { success: false, error: 'JSON must be an array of score objects' };
    const valid = parsed.every(item => item && typeof item.username === 'string' && Number.isFinite(Number(item.score)) && typeof item.difficulty === 'string');
    if (!valid) return { success: false, error: 'One or more score records are invalid.' };
    writeScores(parsed);
    return { success: true, count: parsed.length };
  } catch (error) {
    return { success: false, error: error?.message || 'Invalid JSON syntax' };
  }
}

export async function resetScores() {
  localStorage.removeItem(STORAGE_LOCAL_SCORES);
  return true;
}
