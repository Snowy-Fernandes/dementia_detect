import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  age?: number;
  language?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  healthInfo?: string;
  avatarColor?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  text?: string;
  imageUri?: string;
  videoUri?: string;
  audioUri?: string;
}

export interface GameScore {
  gameType: string;
  score: number;
  date: string;
  difficulty: string;
}

export interface ScanProgress {
  quickScans: number;
  fullScans: number;
  lastScanDate?: string;
}

const KEYS = {
  USER_PROFILE: '@user_profile',
  JOURNAL_ENTRIES: '@journal_entries',
  GAME_SCORES: '@game_scores',
  SCAN_PROGRESS: '@scan_progress',
  CURRENT_USER: '@current_user',
  BADGES: '@badges',
};

export const StorageService = {
  async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async getUserProfile(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  async saveCurrentUser(username: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, username);
  },

  async getCurrentUser(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.CURRENT_USER);
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const entries = await this.getJournalEntries();
    entries.push(entry);
    await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    const data = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
    return data ? JSON.parse(data) : [];
  },

  async saveGameScore(score: GameScore): Promise<void> {
    const scores = await this.getGameScores();
    scores.push(score);
    await AsyncStorage.setItem(KEYS.GAME_SCORES, JSON.stringify(scores));
  },

  async getGameScores(): Promise<GameScore[]> {
    const data = await AsyncStorage.getItem(KEYS.GAME_SCORES);
    return data ? JSON.parse(data) : [];
  },

  async updateScanProgress(type: 'quick' | 'full'): Promise<void> {
    const progress = await this.getScanProgress();
    if (type === 'quick') {
      progress.quickScans += 1;
    } else {
      progress.fullScans += 1;
    }
    progress.lastScanDate = new Date().toISOString();
    await AsyncStorage.setItem(KEYS.SCAN_PROGRESS, JSON.stringify(progress));
  },

  async getScanProgress(): Promise<ScanProgress> {
    const data = await AsyncStorage.getItem(KEYS.SCAN_PROGRESS);
    return data ? JSON.parse(data) : { quickScans: 0, fullScans: 0 };
  },

  async getBadges(): Promise<string[]> {
    const data = await AsyncStorage.getItem(KEYS.BADGES);
    return data ? JSON.parse(data) : [];
  },

  async addBadge(badge: string): Promise<void> {
    const badges = await this.getBadges();
    if (!badges.includes(badge)) {
      badges.push(badge);
      await AsyncStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
    }
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};
