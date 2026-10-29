export interface UserStats {
  dailyStreak: number;
  lastDailyDate: string | null;
  dailyCompletedCount: number;
  timeAttackBestSeconds: number | null;
  timeAttackGamesPlayed: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const DEFAULT_STATS: UserStats = {
  dailyStreak: 0,
  lastDailyDate: null,
  dailyCompletedCount: 0,
  timeAttackBestSeconds: null,
  timeAttackGamesPlayed: 0,
  soundEnabled: true,
  hapticsEnabled: true,
};

const STORAGE_KEY = 'genius_star_user_stats';

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}

export function recordDailyCompletion(dateStr: string): UserStats {
  const stats = loadUserStats();
  if (stats.lastDailyDate === dateStr) {
    return stats; // Already completed today
  }

  // Calculate streak logic
  const today = new Date(dateStr);
  let newStreak = 1;

  if (stats.lastDailyDate) {
    const lastDate = new Date(stats.lastDailyDate);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak = stats.dailyStreak + 1;
    }
  }

  const updated: UserStats = {
    ...stats,
    dailyStreak: newStreak,
    lastDailyDate: dateStr,
    dailyCompletedCount: stats.dailyCompletedCount + 1,
  };

  saveUserStats(updated);
  return updated;
}

export function recordTimeAttackResult(seconds: number): UserStats {
  const stats = loadUserStats();
  const best = stats.timeAttackBestSeconds === null ? seconds : Math.min(stats.timeAttackBestSeconds, seconds);

  const updated: UserStats = {
    ...stats,
    timeAttackBestSeconds: best,
    timeAttackGamesPlayed: stats.timeAttackGamesPlayed + 1,
  };

  saveUserStats(updated);
  return updated;
}
