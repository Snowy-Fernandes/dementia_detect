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
} from 'react-native';
import { Plus, Search, Image as ImageIcon, Video, Mic, X, Calendar } from 'lucide-react-native';
import { StorageService, JournalEntry } from '../../utils/storage';

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryText, setEntryText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'media'>('all');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const journalEntries = await StorageService.getJournalEntries();
    setEntries(journalEntries.reverse());
  };

  const handleAddEntry = async () => {
    if (!entryText.trim()) {
      Alert.alert('Required', 'Please write something in your journal entry');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: entryText,
    };

    await StorageService.saveJournalEntry(newEntry);
    await loadEntries();
    setEntryText('');
    setShowAddModal(false);
    Alert.alert('Success', 'Journal entry saved!');
  };

  const handleAddMedia = (type: string) => {
    Alert.alert(
      'Add Media',
      `${type} capture would open here. For now, this creates a placeholder entry.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const newEntry: JournalEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              text: `${type} entry captured`,
              ...(type === 'Photo' && { imageUri: 'placeholder' }),
              ...(type === 'Video' && { videoUri: 'placeholder' }),
              ...(type === 'Voice' && { audioUri: 'placeholder' }),
            };
            await StorageService.saveJournalEntry(newEntry);
            await loadEntries();
            setShowAddModal(false);
          },
        },
      ]
    );
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.text?.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <Text style={styles.headerSubtitle}>Record your daily thoughts and memories</Text>

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
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar color="#B0BEC5" size={64} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Start journaling to track your thoughts and memories
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
              </View>
              <Text style={styles.entryText}>{entry.text}</Text>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Entry</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind today?"
              placeholderTextColor="#999"
              value={entryText}
              onChangeText={setEntryText}
              multiline
              autoFocus
            />

            <View style={styles.mediaOptions}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => handleAddMedia('Photo')}
              >
                <ImageIcon color="#4A90E2" size={24} />
                <Text style={styles.mediaButtonText}>Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => handleAddMedia('Video')}
              >
                <Video color="#27AE60" size={24} />
                <Text style={styles.mediaButtonText}>Add Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => handleAddMedia('Voice')}
              >
                <Mic color="#E74C3C" size={24} />
                <Text style={styles.mediaButtonText}>Record Voice</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddEntry}
            >
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 16,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  emptyState: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  entryTime: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  entryText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 12,
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
    bottom: 90,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalContent: {
    flex: 1,
    padding: 24,
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
    gap: 12,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  mediaButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
