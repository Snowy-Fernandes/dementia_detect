import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { Plus, Search, Image as ImageIcon, Video, Mic, X, Calendar, BarChart3, Brain, Trash2, Play, Pause, Edit3, Eye } from 'lucide-react-native';
import { storageService, JournalEntry } from '../../utils/storage';
import StoryPreviewScreen from '../../utils/StoryPreviewScreen';
import MediaCaptureScreen from '../../utils/MediaCaptureScreen';

const { width: screenWidth } = Dimensions.get('window');

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showDailyCheck, setShowDailyCheck] = useState(false);
  const [showMemoryResult, setShowMemoryResult] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'media'>('all');
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [stats, setStats] = useState({ totalEntries: 0, totalWords: 0, streak: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [memoryScore, setMemoryScore] = useState(0);
  const [selectedMediaType, setSelectedMediaType] = useState<'photo' | 'video' | 'audio' | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const dailyPrompts = [
    "Describe what you did yesterday in detail. What were the key moments?",
    "What were the most memorable moments from yesterday? Describe them vividly.",
    "How did you feel throughout the day yesterday? What triggered those emotions?",
    "What conversations stood out to you yesterday? Who did you talk to and about what?",
    "Describe your surroundings and activities from yesterday. Where were you and what did you do?",
  ];

  useEffect(() => {
    loadEntries();
    loadStats();
    checkDailyPrompt();
  }, []);

  const loadEntries = async () => {
    const journalEntries = await storageService.getJournalEntries();
    setEntries(journalEntries.reverse());
  };

  const loadStats = async () => {
    const statsData = await storageService.getStats();
    setStats(statsData);
  };

  const checkDailyPrompt = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntries = await storageService.getEntriesByDateRange(yesterday, yesterday);
    
    if (yesterdayEntries.length === 0) {
      const randomPrompt = dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)];
      setDailyPrompt(randomPrompt);
    }
  };

  const handleAddEntry = async () => {
    if (!entryTitle.trim()) {
      Alert.alert('Required', 'Please add a title for your entry');
      return;
    }

    if (!entryText.trim()) {
      Alert.alert('Required', 'Please write something in your journal entry');
      return;
    }

    const newEntry: JournalEntry = {
      id: selectedEntry?.id || Date.now().toString(),
      date: selectedEntry?.date || new Date().toISOString(),
      title: entryTitle,
      text: entryText,
      mood: analyzeMood(entryText),
      tags: extractTags(entryText),
    };

    await storageService.saveJournalEntry(newEntry);
    await loadEntries();
    await loadStats();
    setEntryText('');
    setEntryTitle('');
    setShowAddModal(false);
    setSelectedEntry(null);
    
    if (!selectedEntry) {
      Alert.alert('Success', 'Journal entry saved!');
    }
  };

  const handleDeleteEntry = async (entry: JournalEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteJournalEntry(entry.id);
            await loadEntries();
            await loadStats();
            Alert.alert('Deleted', 'Journal entry has been deleted successfully!');
          },
        },
      ]
    );
  };

  const handleAddMedia = (type: 'photo' | 'video' | 'audio') => {
    setSelectedMediaType(type);
    setShowMediaCapture(true);
  };

  const handleSaveMediaEntry = async (entry: JournalEntry) => {
    await storageService.saveJournalEntry(entry);
    await loadEntries();
    await loadStats();
    Alert.alert('Success', 'Media entry added to your journal!');
  };

  const analyzeMemoryResponse = (response: string) => {
    const words = response.split(/\s+/).length;
    const sentences = response.split(/[.!?]+/).length - 1;
    const hasDetails = response.length > 100;
    const hasEmotions = /feel|felt|emotion|happy|sad|excited|nervous|proud|grateful/i.test(response);
    const hasSpecifics = /at \d|with \w+|in \w+|because|when|where/i.test(response);

    let score = 0;
    if (words > 50) score += 3;
    if (words > 100) score += 2;
    if (sentences > 2) score += 2;
    if (hasDetails) score += 2;
    if (hasEmotions) score += 1;
    if (hasSpecifics) score += 2;

    return Math.min(10, score);
  };

  const handleDailyCheckSubmit = async () => {
    if (!entryText.trim()) {
      Alert.alert('Required', 'Please write your memory response');
      return;
    }

    const score = analyzeMemoryResponse(entryText);
    setMemoryScore(score);

    const memoryEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: 'Daily Memory Check',
      text: `🧠 ${entryText}`,
      mood: score >= 7 ? 'happy' : score >= 4 ? 'neutral' : 'sad',
      tags: ['memory-check', 'daily'],
    };

    await storageService.saveJournalEntry(memoryEntry);
    await storageService.saveMemoryCheck({
      date: new Date().toISOString(),
      prompt: dailyPrompt,
      response: entryText,
      score: score
    });

    setShowDailyCheck(false);
    setShowMemoryResult(true);
    setEntryText('');
    await loadEntries();
    await loadStats();
  };

  const analyzeMood = (text: string): string => {
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excited', 'love', 'joy', 'amazing', 'fantastic', 'excellent'];
    const negativeWords = ['sad', 'bad', 'terrible', 'angry', 'hate', 'upset', 'worried', 'anxious', 'stress', 'tired'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'happy';
    if (negativeCount > positiveCount) return 'sad';
    return 'neutral';
  };

  const extractTags = (text: string): string[] => {
    const commonTags = ['work', 'family', 'friends', 'travel', 'food', 'exercise', 'study', 'relax', 'shopping', 'music', 'movie', 'book', 'weather'];
    return commonTags.filter(tag => text.toLowerCase().includes(tag)).slice(0, 4);
  };

  const runAnalysis = async () => {
    setLoading(true);
    const analysisData = await storageService.getConsistencyAnalysis();
    setAnalysis(analysisData);
    setLoading(false);
    setShowAnalysisModal(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEntryTitle(entry.title || '');
    setEntryText(entry.text.replace('🧠 ', ''));
    setShowAddModal(true);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'text' && entry.text && !entry.imageUri && !entry.videoUri && !entry.audioUri) ||
      (filterType === 'media' && (entry.imageUri || entry.videoUri || entry.audioUri));

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'neutral': return '😐';
      default: return '📝';
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'happy': return '#27AE60';
      case 'sad': return '#E74C3C';
      case 'neutral': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const playAudio = (audioId: string) => {
    setPlayingAudio(audioId === playingAudio ? null : audioId);
    setTimeout(() => {
      setPlayingAudio(null);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Digital Diary</Text>
            <Text style={styles.headerSubtitle}>Capture your story, one memory at a time</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowStoryPreview(true)}>
              <Eye color="#4A90E2" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={runAnalysis}>
              <BarChart3 color="#4A90E2" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#7F8C8D" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'text' && styles.filterButtonActive]}
            onPress={() => setFilterType('text')}
          >
            <Text style={[styles.filterText, filterType === 'text' && styles.filterTextActive]}>
              Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'media' && styles.filterButtonActive]}
            onPress={() => setFilterType('media')}
          >
            <Text style={[styles.filterText, filterType === 'media' && styles.filterTextActive]}>
              Media
            </Text>
          </TouchableOpacity>
        </View>

        {/* Memory Check Button */}
        <TouchableOpacity 
          style={styles.memoryCheckButton}
          onPress={() => setShowDailyCheck(true)}
        >
          <Brain color="#fff" size={20} />
          <Text style={styles.memoryCheckText}>Daily Memory Check</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#B0BEC5" size={64} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Start journaling to track your thoughts and memories
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Write First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryDateContainer}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(entry.mood) }]}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                  </View>
                </View>
                <View style={styles.entryActions}>
                  <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditEntry(entry)}
                  >
                    <Edit3 color="#4A90E2" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteEntry(entry)}
                  >
                    <Trash2 color="#E74C3C" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {entry.title && (
                <Text style={styles.entryTitle}>{entry.title}</Text>
              )}
              
              {entry.imageUri && (
                <Image source={{ uri: entry.imageUri }} style={styles.mediaPreview} />
              )}
              
              <Text style={styles.entryText}>{entry.text}</Text>

              {entry.audioUri && (
                <TouchableOpacity 
                  style={styles.audioPlayer}
                  onPress={() => playAudio(entry.audioUri!)}
                >
                  {playingAudio === entry.audioUri ? (
                    <Pause color="#4A90E2" size={20} />
                  ) : (
                    <Play color="#4A90E2" size={20} />
                  )}
                  <Text style={styles.audioText}>
                    {playingAudio === entry.audioUri ? 'Playing...' : 'Play Voice Recording'}
                  </Text>
                  {entry.audioText && (
                    <Text style={styles.audioTranscript} numberOfLines={2}>
                      {entry.audioText}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {entry.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.entryFooter}>
                {entry.imageUri && (
                  <View style={styles.mediaBadge}>
                    <ImageIcon color="#4A90E2" size={16} />
                    <Text style={styles.mediaBadgeText}>Photo</Text>
                  </View>
                )}
                {entry.videoUri && (
                  <View style={styles.mediaBadge}>
                    <Video color="#27AE60" size={16} />
                    <Text style={styles.mediaBadgeText}>Video</Text>
                  </View>
                )}
                {entry.audioUri && (
                  <View style={styles.mediaBadge}>
                    <Mic color="#E74C3C" size={16} />
                    <Text style={styles.mediaBadgeText}>Voice</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Entry FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedEntry(null);
          setEntryTitle('');
          setEntryText('');
          setShowAddModal(true);
        }}
        activeOpacity={0.8}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* Add/Edit Entry Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedEntry(null);
          setEntryTitle('');
          setEntryText('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedEntry ? 'Edit Entry' : 'New Journal Entry'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setSelectedEntry(null);
              setEntryTitle('');
              setEntryText('');
            }}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry Title"
              placeholderTextColor="#999"
              value={entryTitle}
              onChangeText={setEntryTitle}
            />

            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind today?"
              placeholderTextColor="#999"
              value={entryText}
              onChangeText={setEntryText}
              multiline
            />

            <View style={styles.mediaOptions}>
              <Text style={styles.mediaOptionsTitle}>Add Media</Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleAddMedia('photo')}
                >
                  <ImageIcon color="#4A90E2" size={24} />
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleAddMedia('video')}
                >
                  <Video color="#27AE60" size={24} />
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleAddMedia('audio')}
                >
                  <Mic color="#E74C3C" size={24} />
                  <Text style={styles.mediaButtonText}>Voice</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddEntry}
            >
              <Text style={styles.saveButtonText}>
                {selectedEntry ? 'Update Entry' : 'Save Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Media Capture Modal */}
      <Modal
        visible={showMediaCapture}
        animationType="slide"
        onRequestClose={() => setShowMediaCapture(false)}
      >
        {selectedMediaType && (
          <MediaCaptureScreen
            mediaType={selectedMediaType}
            onClose={() => setShowMediaCapture(false)}
            onSave={handleSaveMediaEntry}
          />
        )}
      </Modal>

      {/* Daily Check Modal */}
      <Modal
        visible={showDailyCheck}
        animationType="slide"
        onRequestClose={() => setShowDailyCheck(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.dailyCheckHeader}>
              <Brain color="#4A90E2" size={24} />
              <Text style={styles.modalTitle}>Daily Memory Check</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDailyCheck(false)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.dailyCheckContent}>
              <Text style={styles.dailyCheckPrompt}>{dailyPrompt}</Text>
              <TextInput
                style={[styles.textInput, styles.dailyCheckInput]}
                placeholder="Write your response here..."
                placeholderTextColor="#999"
                value={entryText}
                onChangeText={setEntryText}
                multiline
              />
              <Text style={styles.dailyCheckTip}>
                💡 This helps track memory consistency and detail over time
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveButton, styles.dailyCheckButton]}
              onPress={handleDailyCheckSubmit}
            >
              <Text style={styles.saveButtonText}>Save & Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Memory Result Modal */}
      <Modal
        visible={showMemoryResult}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.resultModalContainer}>
          <View style={styles.resultModal}>
            <Text style={styles.resultEmoji}>
              {memoryScore >= 8 ? '🎉' : memoryScore >= 6 ? '👍' : '🤔'}
            </Text>
            <Text style={styles.resultTitle}>
              {memoryScore >= 8 ? 'Excellent Memory!' : 
               memoryScore >= 6 ? 'Good Recall!' : 
               'Keep Practicing!'}
            </Text>
            <Text style={styles.resultScore}>
              Memory Score: {memoryScore}/10
            </Text>
            <Text style={styles.resultMessage}>
              {memoryScore >= 8 ? 'Yay! You have great memory retention! 🧠\nYour detailed recollection shows strong cognitive health.' :
               memoryScore >= 6 ? 'Nice! You remembered most details! 💫\nRegular practice will make your memory even sharper.' :
               'Daily practice will help improve your memory! 📝\nTry to include more specific details next time.'}
            </Text>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => setShowMemoryResult(false)}
            >
              <Text style={styles.resultButtonText}>Continue Journaling</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Story Preview Modal */}
      <Modal
        visible={showStoryPreview}
        animationType="fade"
        statusBarTranslucent
      >
        <StoryPreviewScreen
          entries={entries.filter(entry => entry.imageUri || entry.title)}
          onClose={() => setShowStoryPreview(false)}
        />
      </Modal>

      {/* Analysis Modal */}
      <Modal
        visible={showAnalysisModal}
        animationType="slide"
        onRequestClose={() => setShowAnalysisModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.dailyCheckHeader}>
              <BarChart3 color="#4A90E2" size={24} />
              <Text style={styles.modalTitle}>Journal Analysis</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>Analyzing your journal...</Text>
              </View>
            ) : analysis && analysis.length > 0 ? (
              <View style={styles.analysisContent}>
                <Text style={styles.analysisTitle}>Consistency Overview</Text>
                {analysis.map((day: any, index: number) => (
                  <View key={index} style={styles.analysisCard}>
                    <Text style={styles.analysisDate}>{new Date(day.date).toLocaleDateString()}</Text>
                    <View style={styles.analysisMetrics}>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Detail Score</Text>
                        <View style={styles.scoreBar}>
                          <View 
                            style={[styles.scoreFill, { width: `${day.detailScore * 10}%` }]} 
                          />
                        </View>
                        <Text style={styles.metricValue}>{day.detailScore.toFixed(1)}/10</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Consistency</Text>
                        <View style={styles.scoreBar}>
                          <View 
                            style={[styles.scoreFill, { width: `${day.consistencyScore * 10}%` }]} 
                          />
                        </View>
                        <Text style={styles.metricValue}>{day.consistencyScore.toFixed(1)}/10</Text>
                      </View>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Vocabulary</Text>
                        <Text style={styles.metricValue}>{day.vocabularySize} unique words</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noAnalysisContainer}>
                <Text style={styles.noAnalysisText}>No analysis data available yet.</Text>
                <Text style={styles.noAnalysisSubtext}>Start writing to see insights about your journaling patterns!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  filterTextActive: {
    color: '#fff',
  },
  memoryCheckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  memoryCheckText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  moodIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moodEmoji: {
    fontSize: 12,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actionButton: {
    padding: 4,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  entryText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 12,
  },
  audioPlayer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  audioText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 8,
  },
  audioTranscript: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  entryFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mediaBadgeText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  dailyCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  titleInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  mediaOptions: {
    marginBottom: 24,
  },
  mediaOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  dailyCheckContent: {
    flex: 1,
  },
  dailyCheckPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    lineHeight: 24,
  },
  dailyCheckInput: {
    minHeight: 150,
  },
  dailyCheckTip: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 12,
  },
  modalFooter: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  dailyCheckButton: {
    backgroundColor: '#27AE60',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  resultButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContent: {
    gap: 16,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  analysisMetrics: {
    gap: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    width: 100,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    width: 80,
    textAlign: 'right',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  noAnalysisContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noAnalysisText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  noAnalysisSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});