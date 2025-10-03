export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  imageUri?: string;
  videoUri?: string;
  audioUri?: string;
  audioText?: string;
  mood?: string;
  tags?: string[];
  title?: string;
}

export interface DailyAnalysis {
  date: string;
  entries: string[];
  wordCount: number;
  uniqueWords: Set<string>;
  consistencyScore: number;
  detailScore: number;
  vocabularySize: number;
}

export interface AnalysisData {
  [key: string]: DailyAnalysis;
}

export interface MediaItem {
  uri: string;
  type: 'photo' | 'video' | 'audio';
  caption?: string;
}