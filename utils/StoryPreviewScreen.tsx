import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Play, X, Heart, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock JournalEntry interface
interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  text: string;
  imageUri?: string;
  audioUri?: string;
  tags?: string[];
}

interface StoryPreviewScreenProps {
  entries: JournalEntry[];
  onClose: () => void;
}

export default function StoryPreviewScreen({ entries, onClose }: StoryPreviewScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [rotateAnim] = useState(new Animated.Value(0));

  const currentEntry = entries[currentIndex];

  useEffect(() => {
    animateEntry();
  }, [currentIndex]);

  const animateEntry = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    rotateAnim.setValue(-2);

    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextEntry = () => {
    if (currentIndex < entries.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevEntry = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [-2, 0],
    outputRange: ['-2deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative elements */}
      <View style={[styles.decorCircle, { top: 100, left: -50 }]} />
      <View style={[styles.decorCircle, { bottom: 150, right: -60, backgroundColor: '#B3E5FC' }]} />
      <View style={[styles.decorCircle, { top: 300, right: 30, width: 80, height: 80, backgroundColor: '#81D4FA' }]} />

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <LinearGradient
          colors={['#2196F3', '#1976D2']}
          style={styles.closeButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <X color="#fff" size={24} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Sparkles decoration */}
      <View style={[styles.sparkle, { top: 80, left: 40 }]}>
        <Sparkles color="#64B5F6" size={20} />
      </View>
      <View style={[styles.sparkle, { top: 120, right: 60 }]}>
        <Sparkles color="#42A5F5" size={16} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={prevEntry}
            disabled={currentIndex === 0}
          >
            <LinearGradient
              colors={currentIndex === 0 ? ['#E0E0E0', '#CCCCCC'] : ['#42A5F5', '#1E88E5']}
              style={styles.navButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ChevronLeft color={currentIndex === 0 ? '#999' : '#fff'} size={24} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {currentIndex + 1} of {entries.length}
            </Text>
            <Text style={styles.paginationSubtext}>memories</Text>
          </View>

          <TouchableOpacity 
            style={[styles.navButton, currentIndex === entries.length - 1 && styles.navButtonDisabled]}
            onPress={nextEntry}
            disabled={currentIndex === entries.length - 1}
          >
            <LinearGradient
              colors={currentIndex === entries.length - 1 ? ['#E0E0E0', '#CCCCCC'] : ['#42A5F5', '#1E88E5']}
              style={styles.navButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ChevronRight color={currentIndex === entries.length - 1 ? '#999' : '#fff'} size={24} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Entry content with scrapbook style */}
        <Animated.View 
          style={[
            styles.scrapbookPage,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotation }
              ]
            }
          ]}
        >
          {/* Decorative tape */}
          <View style={[styles.tape, { top: -12, left: 40, transform: [{ rotate: '-3deg' }] }]} />
          <View style={[styles.tape, { top: -12, right: 40, transform: [{ rotate: '3deg' }] }]} />

          {/* Paper texture effect */}
          <View style={styles.paperTexture} />

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Date badge */}
            <View style={styles.dateBadge}>
              <LinearGradient
                colors={['#64B5F6', '#42A5F5']}
                style={styles.dateBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.dateText}>{formatDate(currentEntry.date)}</Text>
              </LinearGradient>
            </View>

            {/* Title with decorative underline */}
            {currentEntry.title && (
              <View style={styles.titleSection}>
                <Text style={styles.title}>{currentEntry.title}</Text>
                <View style={styles.titleUnderline} />
              </View>
            )}

            {/* Photo with polaroid style */}
            {currentEntry.imageUri && (
              <View style={styles.polaroidContainer}>
                <View style={styles.polaroid}>
                  <Image 
                    source={{ uri: currentEntry.imageUri }} 
                    style={styles.polaroidImage}
                    resizeMode="cover"
                  />
                  <View style={styles.polaroidBottom}>
                    <Text style={styles.polaroidCaption}>captured moment ✨</Text>
                  </View>
                </View>
                {/* Corner decorations */}
                <View style={[styles.cornerDecor, { top: -8, left: -8 }]} />
                <View style={[styles.cornerDecor, { top: -8, right: -8 }]} />
              </View>
            )}

            {/* Text content with handwritten style */}
            <View style={styles.textSection}>
              <Text style={styles.text}>{currentEntry.text}</Text>
            </View>

            {/* Audio with cute styling */}
            {currentEntry.audioUri && (
              <View style={styles.audioSection}>
                <LinearGradient
                  colors={['#E3F2FD', '#BBDEFB']}
                  style={styles.audioGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Play color="#1976D2" size={18} fill="#1976D2" />
                  <Text style={styles.audioText}>Voice Memory 🎵</Text>
                </LinearGradient>
              </View>
            )}

            {/* Tags as stickers */}
            {currentEntry.tags && currentEntry.tags.length > 0 && (
              <View style={styles.stickersContainer}>
                {currentEntry.tags.map((tag, index) => (
                  <View key={index} style={[styles.sticker, { 
                    transform: [{ rotate: `${(index % 2 === 0 ? 2 : -2)}deg` }] 
                  }]}>
                    <LinearGradient
                      colors={
                        index % 3 === 0 
                          ? ['#81D4FA', '#64B5F6']
                          : index % 3 === 1 
                          ? ['#4FC3F7', '#29B6F6']
                          : ['#B3E5FC', '#81D4FA']
                      }
                      style={styles.stickerGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.stickerText}>#{tag}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}

            {/* Heart decoration at bottom */}
            <View style={styles.bottomDecor}>
              <Heart color="#2196F3" size={20} fill="#64B5F6" />
            </View>
          </ScrollView>

          {/* Bottom decorative tape */}
          <View style={[styles.tape, { bottom: -12, left: '30%', transform: [{ rotate: '2deg' }] }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    opacity: 0.3,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    borderRadius: 25,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 5,
  },
  content: {
    flex: 1,
    paddingTop: 120,
    paddingBottom: 40,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  navButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pagination: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },
  paginationSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  scrapbookPage: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#FFFEF9',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
  },
  paperTexture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(227, 242, 253, 0.3)',
    borderRadius: 20,
  },
  tape: {
    position: 'absolute',
    width: 80,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
    zIndex: 10,
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  dateBadge: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#64B5F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dateBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    fontFamily: 'System',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#64B5F6',
    borderRadius: 2,
    marginTop: 8,
  },
  polaroidContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-2deg' }],
  },
  polaroid: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  polaroidImage: {
    width: screenWidth - 120,
    height: (screenWidth - 120) * 0.75,
    borderRadius: 2,
  },
  polaroidBottom: {
    marginTop: 12,
    alignItems: 'center',
  },
  polaroidCaption: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  cornerDecor: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#81D4FA',
    opacity: 0.6,
  },
  textSection: {
    backgroundColor: 'rgba(227, 242, 253, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#42A5F5',
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: '#34495E',
    fontFamily: 'System',
  },
  audioSection: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  audioGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  audioText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
  },
  stickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  sticker: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  stickerGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  stickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D47A1',
  },
  bottomDecor: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});