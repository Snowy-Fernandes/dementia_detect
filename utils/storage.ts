// import AsyncStorage from '@react-native-async-storage/async-storage';

// export interface UserProfile {
//   id: string;
//   username: string;
//   email: string;
//   age?: number;
//   language?: string;
//   emergencyContact?: {
//     name: string;
//     phone: string;
//   };
//   healthInfo?: string;
//   avatarColor?: string;
// }

// export interface JournalEntry {
//   id: string;
//   date: string;
//   text?: string;
//   imageUri?: string;
//   videoUri?: string;
//   audioUri?: string;
// }

// export interface GameScore {
//   gameType: string;
//   score: number;
//   date: string;
//   difficulty: string;
// }

// export interface ScanProgress {
//   quickScans: number;
//   fullScans: number;
//   lastScanDate?: string;
// }

// const KEYS = {
//   USER_PROFILE: '@user_profile',
//   JOURNAL_ENTRIES: '@journal_entries',
//   GAME_SCORES: '@game_scores',
//   SCAN_PROGRESS: '@scan_progress',
//   CURRENT_USER: '@current_user',
//   BADGES: '@badges',
// };

// export const StorageService = {
//   async saveUserProfile(profile: UserProfile): Promise<void> {
//     await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
//   },

//   async getUserProfile(): Promise<UserProfile | null> {
//     const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
//     return data ? JSON.parse(data) : null;
//   },

//   async saveCurrentUser(username: string): Promise<void> {
//     await AsyncStorage.setItem(KEYS.CURRENT_USER, username);
//   },

//   async getCurrentUser(): Promise<string | null> {
//     return await AsyncStorage.getItem(KEYS.CURRENT_USER);
//   },

//   async saveJournalEntry(entry: JournalEntry): Promise<void> {
//     const entries = await this.getJournalEntries();
//     entries.push(entry);
//     await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
//   },

//   async getJournalEntries(): Promise<JournalEntry[]> {
//     const data = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
//     return data ? JSON.parse(data) : [];
//   },

//   async saveGameScore(score: GameScore): Promise<void> {
//     const scores = await this.getGameScores();
//     scores.push(score);
//     await AsyncStorage.setItem(KEYS.GAME_SCORES, JSON.stringify(scores));
//   },

//   async getGameScores(): Promise<GameScore[]> {
//     const data = await AsyncStorage.getItem(KEYS.GAME_SCORES);
//     return data ? JSON.parse(data) : [];
//   },

//   async updateScanProgress(type: 'quick' | 'full'): Promise<void> {
//     const progress = await this.getScanProgress();
//     if (type === 'quick') {
//       progress.quickScans += 1;
//     } else {
//       progress.fullScans += 1;
//     }
//     progress.lastScanDate = new Date().toISOString();
//     await AsyncStorage.setItem(KEYS.SCAN_PROGRESS, JSON.stringify(progress));
//   },

//   async getScanProgress(): Promise<ScanProgress> {
//     const data = await AsyncStorage.getItem(KEYS.SCAN_PROGRESS);
//     return data ? JSON.parse(data) : { quickScans: 0, fullScans: 0 };
//   },

//   async getBadges(): Promise<string[]> {
//     const data = await AsyncStorage.getItem(KEYS.BADGES);
//     return data ? JSON.parse(data) : [];
//   },

//   async addBadge(badge: string): Promise<void> {
//     const badges = await this.getBadges();
//     if (!badges.includes(badge)) {
//       badges.push(badge);
//       await AsyncStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
//     }
//   },

//   async clearAll(): Promise<void> {
//     await AsyncStorage.clear();
//   },
// };
import { JournalEntry, AnalysisData, DailyAnalysis } from './journal';

class StorageService {
  private readonly ENTRIES_KEY = 'journal_entries';
  private readonly ANALYSIS_KEY = 'journal_analysis';
  private readonly MEMORY_CHECK_KEY = 'memory_checks';

  // In-memory storage
  private storage: { [key: string]: any } = {
    [this.ENTRIES_KEY]: [
      {
        id: '1',
        date: new Date().toISOString(),
        title: 'Welcome to Your Digital Diary',
        text: 'Welcome to your digital diary! This is your space to capture memories, thoughts, and moments. Start writing your story today!',
        mood: 'happy',
        tags: ['welcome', 'first-entry']
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000).toISOString(),
        title: 'Beautiful Sunset',
        text: 'Captured an amazing sunset today. The colors were breathtaking - orange, pink, and purple blending together perfectly.',
        imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        mood: 'happy',
        tags: ['sunset', 'nature', 'photography']
      },
      {
        id: '3',
        date: new Date(Date.now() - 172800000).toISOString(),
        title: 'Morning Thoughts',
        text: 'Started the day with meditation and coffee. Feeling grateful for the little moments that make life special.',
        mood: 'neutral',
        tags: ['morning', 'gratitude', 'meditation']
      }
    ],
    [this.ANALYSIS_KEY]: {},
    [this.MEMORY_CHECK_KEY]: []
  };

  // Sample audio responses for voice entries
  private audioResponses = [
    "Just recorded my thoughts about today's amazing hike. The view from the top was absolutely worth the climb!",
    "This voice memo captures my excitement about the new project. Can't wait to see how it unfolds in the coming weeks.",
    "Recorded my reflections on the book I just finished reading. So many valuable insights about personal growth.",
    "Capturing this moment of gratitude - spent quality time with family today and created beautiful memories.",
    "Voice note about my workout session today. Pushed myself harder and feeling accomplished!",
    "Recording my thoughts on the beautiful concert I attended. The music touched my soul deeply."
  ];

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const entries = await this.getJournalEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    this.storage[this.ENTRIES_KEY] = entries;
    await this.analyzeEntry(entry);
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return this.storage[this.ENTRIES_KEY] || [];
  }

  async deleteJournalEntry(id: string): Promise<void> {
    const entries = await this.getJournalEntries();
    this.storage[this.ENTRIES_KEY] = entries.filter(entry => entry.id !== id);
  }

  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    const entries = await this.getJournalEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  async getEntryById(id: string): Promise<JournalEntry | null> {
    const entries = await this.getJournalEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  async getMediaEntries(): Promise<JournalEntry[]> {
    const entries = await this.getJournalEntries();
    return entries.filter(entry => entry.imageUri || entry.videoUri || entry.audioUri);
  }

  getRandomAudioResponse(): string {
    return this.audioResponses[Math.floor(Math.random() * this.audioResponses.length)];
  }

  private async analyzeEntry(entry: JournalEntry): Promise<void> {
    const analysis: AnalysisData = this.storage[this.ANALYSIS_KEY] || {};
    const today = new Date().toDateString();
    
    if (!analysis[today]) {
      analysis[today] = {
        date: today,
        entries: [],
        wordCount: 0,
        uniqueWords: new Set(),
        consistencyScore: 0,
        detailScore: 0,
        vocabularySize: 0
      };
    }

    const words = entry.text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    analysis[today].entries.push(entry.id);
    analysis[today].wordCount += words.length;
    words.forEach(word => analysis[today].uniqueWords.add(word));
    analysis[today].vocabularySize = analysis[today].uniqueWords.size;
    
    // Calculate scores
    analysis[today].detailScore = Math.min(10, words.length / 10);
    analysis[today].consistencyScore = this.calculateConsistency(analysis[today]);
    
    this.storage[this.ANALYSIS_KEY] = analysis;
  }

  private calculateConsistency(dayAnalysis: DailyAnalysis): number {
    const uniqueWordRatio = dayAnalysis.uniqueWords.size / Math.max(dayAnalysis.wordCount, 1);
    return Math.min(10, uniqueWordRatio * 20);
  }

  async getDailyAnalysis(date: Date): Promise<DailyAnalysis | null> {
    const analysis: AnalysisData = this.storage[this.ANALYSIS_KEY] || {};
    return analysis[date.toDateString()] || null;
  }

  async getConsistencyAnalysis(): Promise<DailyAnalysis[]> {
    const analysis: AnalysisData = this.storage[this.ANALYSIS_KEY] || {};
    return Object.keys(analysis).map(date => ({
      ...analysis[date],
      vocabularySize: analysis[date].uniqueWords.size
    }));
  }

  async saveMemoryCheck(check: { date: string; prompt: string; response: string; score: number }): Promise<void> {
    const memoryChecks = this.storage[this.MEMORY_CHECK_KEY] || [];
    memoryChecks.push(check);
    this.storage[this.MEMORY_CHECK_KEY] = memoryChecks;
  }

  async getMemoryChecks(): Promise<any[]> {
    return this.storage[this.MEMORY_CHECK_KEY] || [];
  }

  async clearAllData(): Promise<void> {
    this.storage[this.ENTRIES_KEY] = [];
    this.storage[this.ANALYSIS_KEY] = {};
    this.storage[this.MEMORY_CHECK_KEY] = [];
  }

  async getStats(): Promise<{ totalEntries: number; totalWords: number; streak: number }> {
    const entries = await this.getJournalEntries();
    const totalWords = entries.reduce((sum, entry) => sum + entry.text.split(/\s+/).length, 0);
    
    // Simple streak calculation
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasTodayEntry = entries.some(entry => 
      new Date(entry.date).toDateString() === today.toDateString()
    );
    const hasYesterdayEntry = entries.some(entry => 
      new Date(entry.date).toDateString() === yesterday.toDateString()
    );
    
    const streak = hasTodayEntry && hasYesterdayEntry ? 2 : hasTodayEntry ? 1 : 0;

    return {
      totalEntries: entries.length,
      totalWords,
      streak
    };
  }
}

export const storageService = new StorageService();

export { JournalEntry };
