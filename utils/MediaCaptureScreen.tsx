import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Camera, Video, Mic, Check, Image as ImageIcon } from 'lucide-react-native';
import { JournalEntry, MediaItem } from './journal';
import { storageService } from './storage';

interface MediaCaptureScreenProps {
  mediaType: 'photo' | 'video' | 'audio';
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
}

// Sample media library
const USER_MEDIA_LIBRARY = {
  photos: [
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    'https://images.unsplash.com/photo-1451226428352-cf66bf8a0317?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
  ],
  videos: [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ]
};

export default function MediaCaptureScreen({ mediaType, onClose, onSave }: MediaCaptureScreenProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');

  const handleSelectMedia = (mediaUri: string) => {
    setSelectedMedia(mediaUri);
  };

  const handleSave = () => {
    if (!selectedMedia && mediaType !== 'audio') {
      Alert.alert('Required', `Please select a ${mediaType}`);
      return;
    }

    if (!title.trim()) {
      Alert.alert('Required', 'Please add a title for your entry');
      return;
    }

    let entryText = caption;
    let audioText = '';

    if (mediaType === 'audio') {
      audioText = storageService.getRandomAudioResponse();
      entryText = `🎤 ${audioText}`;
    } else if (mediaType === 'photo') {
      entryText = caption || `📸 ${title}`;
    } else if (mediaType === 'video') {
      entryText = caption || `🎥 ${title}`;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: title,
      text: entryText,
      mood: 'happy',
      tags: [mediaType, 'memory'],
      ...(mediaType === 'photo' && { imageUri: selectedMedia }),
      ...(mediaType === 'video' && { videoUri: selectedMedia }),
      ...(mediaType === 'audio' && { 
        audioUri: `audio_${Date.now()}`,
        audioText: audioText
      }),
    };

    onSave(newEntry);
    onClose();
  };

  const renderMediaGrid = () => {
    const mediaItems = mediaType === 'photo' ? USER_MEDIA_LIBRARY.photos : USER_MEDIA_LIBRARY.videos;

    return (
      <ScrollView style={styles.mediaGrid}>
        <Text style={styles.sectionTitle}>Your {mediaType === 'photo' ? 'Photos' : 'Videos'}</Text>
        <View style={styles.grid}>
          {mediaItems.map((mediaUri, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.mediaItem,
                selectedMedia === mediaUri && styles.mediaItemSelected
              ]}
              onPress={() => handleSelectMedia(mediaUri)}
            >
              {mediaType === 'photo' ? (
                <Image source={{ uri: mediaUri }} style={styles.mediaThumbnail} />
              ) : (
                <View style={styles.videoThumbnail}>
                  <Video color="#fff" size={32} />
                </View>
              )}
              {selectedMedia === mediaUri && (
                <View style={styles.selectedBadge}>
                  <Check color="#fff" size={20} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAudioInterface = () => (
    <View style={styles.audioContainer}>
      <View style={styles.audioIcon}>
        <Mic color="#4A90E2" size={64} />
      </View>
      <Text style={styles.audioTitle}>Record Voice Memo</Text>
      <Text style={styles.audioDescription}>
        Tap to record your thoughts. We'll create a beautiful voice entry for your journal.
      </Text>
      <TouchableOpacity 
        style={styles.recordButton}
        onPress={() => setSelectedMedia('recorded')}
      >
        <Mic color="#fff" size={24} />
        <Text style={styles.recordButtonText}>
          {selectedMedia ? 'Recording Ready!' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          {mediaType === 'photo' && <ImageIcon color="#4A90E2" size={24} />}
          {mediaType === 'video' && <Video color="#27AE60" size={24} />}
          {mediaType === 'audio' && <Mic color="#E74C3C" size={24} />}
          <Text style={styles.modalTitle}>
            Add {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X color="#2C3E50" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Media Selection */}
        {mediaType !== 'audio' ? renderMediaGrid() : renderAudioInterface()}

        {/* Preview */}
        {selectedMedia && mediaType === 'photo' && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Image source={{ uri: selectedMedia }} style={styles.previewImage} />
          </View>
        )}

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your memory a title..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Caption Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>
            {mediaType === 'audio' ? 'Additional Notes' : 'Caption'}
          </Text>
          <TextInput
            style={styles.captionInput}
            placeholder={
              mediaType === 'audio' 
                ? "Add any additional thoughts..." 
                : "Write a caption for your memory..."
            }
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Preview for audio */}
        {mediaType === 'audio' && selectedMedia && (
          <View style={styles.audioPreview}>
            <Text style={styles.sectionTitle}>Voice Preview</Text>
            <View style={styles.audioPreviewCard}>
              <Mic color="#4A90E2" size={24} />
              <Text style={styles.audioPreviewText}>
                Your voice memo will be transcribed and added to your journal
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedMedia && mediaType !== 'audio') && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={(!selectedMedia && mediaType !== 'audio') || !title.trim()}
        >
          <Text style={styles.saveButtonText}>Add to Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mediaGrid: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaItemSelected: {
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 4,
  },
  audioContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 24,
  },
  audioIcon: {
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 40,
    marginBottom: 16,
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  audioDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  titleInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  captionInput: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  audioPreview: {
    marginBottom: 24,
  },
  audioPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  audioPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  footer: {
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
  saveButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});