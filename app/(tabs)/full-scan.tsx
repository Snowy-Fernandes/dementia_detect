import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { 
  Eye, 
  Pencil, 
  Mic, 
  CheckSquare, 
  Puzzle, 
  Save, 
  ArrowLeft, 
  Check 
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DrawPoint { x: number; y: number; }
interface Stroke { points: DrawPoint[]; }

const activities = [
  { id: 'eye', title: 'Eye Tracking', icon: Eye, color: '#4A90E2' },
  { id: 'drawing', title: 'Drawing Test', icon: Pencil, color: '#27AE60' },
  { id: 'voice', title: 'Voice Analysis', icon: Mic, color: '#E74C3C' },
  { id: 'mcq', title: 'Memory Quiz', icon: CheckSquare, color: '#F39C12' },
  { id: 'puzzle', title: 'Puzzle Solve', icon: Puzzle, color: '#9B59B6' },
];

export default function FullScanScreen() {
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const router = useRouter();

  const progress = (completedActivities.length / activities.length) * 100;

  const handleStartActivity = (index: number) => {
    setCurrentActivityIndex(index);
    setCurrentActivity(activities[index].id);
  };

  const handleCompleteActivity = () => {
    const activityId = activities[currentActivityIndex].id;
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities([...completedActivities, activityId]);
    }
    setCurrentActivity(null);
    
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    }
  };

  const handleBackToList = () => {
    setCurrentActivity(null);
  };

  if (currentActivity === 'eye') {
    return <EyeTrackingActivity onComplete={handleCompleteActivity} onBack={handleBackToList} />;
  }

  if (currentActivity === 'drawing') {
    return <DrawingActivity onComplete={handleCompleteActivity} onBack={handleBackToList} />;
  }

  if (currentActivity === 'voice') {
    return <VoiceActivity onComplete={handleCompleteActivity} onBack={handleBackToList} />;
  }

  if (currentActivity === 'mcq') {
    return <MemoryQuizActivity onComplete={handleCompleteActivity} onBack={handleBackToList} />;
  }

  if (currentActivity === 'puzzle') {
    return <PuzzleActivity onComplete={handleCompleteActivity} onBack={handleBackToList} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Full Scan</Text>
        <Text style={styles.headerSubtitle}>Comprehensive Assessment</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedActivities.length} of {activities.length} completed
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const isCompleted = completedActivities.includes(activity.id);
          const isNext = index === currentActivityIndex;
          const isLocked = index > currentActivityIndex;

          return (
            <View
              key={activity.id}
              style={[
                styles.activityCard,
                isCompleted && styles.activityCardCompleted,
                isNext && styles.activityCardNext,
                isLocked && styles.activityCardLocked,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}20` },
                  ]}
                >
                  <Icon color={activity.color} size={32} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityStatus}>
                    {isCompleted ? 'Completed' : isNext ? 'Start now' : isLocked ? 'Locked' : 'Ready'}
                  </Text>
                </View>
                {isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Check color="#fff" size={20} />
                  </View>
                ) : isNext ? (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartActivity(index)}
                  >
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}

        {completedActivities.length === activities.length && (
          <View style={styles.completionCard}>
            <Text style={styles.completionTitle}>🎉 All Activities Complete!</Text>
            <Text style={styles.completionText}>
              Excellent work on your comprehensive assessment!
            </Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <Text style={styles.homeButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Eye Tracking Activity
function EyeTrackingActivity({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [eyeDetected, setEyeDetected] = useState(false);

  useEffect(() => {
    if (recording && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (recording && countdown === 0) {
      setRecording(false);
      setRecordingComplete(true);
    }
  }, [recording, countdown]);

  useEffect(() => {
    if (recording) {
      const detectTimer = setTimeout(() => setEyeDetected(true), 1000);
      return () => clearTimeout(detectTimer);
    }
  }, [recording]);

  const startRecording = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed for eye tracking.');
        return;
      }
    }
    setRecording(true);
    setCountdown(5);
    setEyeDetected(false);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#666" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <View style={[styles.activityIconLarge, { backgroundColor: '#4A90E220' }]}>
            <Eye color="#4A90E2" size={48} />
          </View>
        </View>

        <Text style={styles.activityMainTitle}>Eye Tracking Test</Text>
        <Text style={styles.activityDescription}>
          Look directly at the camera for 5 seconds
        </Text>

        <View style={styles.cameraContainer}>
          {permission.granted ? (
            <CameraView
              style={styles.camera}
              facing="front"
            >
              {recording && countdown > 0 && (
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}
              {eyeDetected && recording && (
                <>
                  <View style={styles.eyeBox} pointerEvents="none">
                    <View style={styles.eyeBoxCorner} />
                  </View>
                  <View style={[styles.eyeBox, { left: '55%' }]} pointerEvents="none">
                    <View style={styles.eyeBoxCorner} />
                  </View>
                </>
              )}
            </CameraView>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Eye color="#ccc" size={64} />
              <Text style={styles.placeholderText}>Camera Permission Required</Text>
            </View>
          )}
        </View>

        {!recording && !recordingComplete ? (
          <TouchableOpacity style={styles.primaryButton} onPress={startRecording}>
            <Text style={styles.primaryButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : recordingComplete ? (
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Complete Activity</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>Recording...</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// Drawing Activity
function DrawingActivity({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const strokeRef = useRef<Stroke | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newStroke: Stroke = { points: [{ x: locationX, y: locationY }] };
        strokeRef.current = newStroke;
        setCurrentStroke(newStroke);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (!strokeRef.current) return;
        const updated = {
          ...strokeRef.current,
          points: [...strokeRef.current.points, { x: locationX, y: locationY }],
        };
        strokeRef.current = updated;
        setCurrentStroke(updated);
      },
      onPanResponderRelease: () => {
        if (strokeRef.current && Array.isArray(strokeRef.current.points) && strokeRef.current.points.length > 0) {
          const clone = JSON.parse(JSON.stringify(strokeRef.current)) as Stroke;
          setStrokes(prev => [...prev, clone]);
        }
        strokeRef.current = null;
        setCurrentStroke(null);
      },
      onPanResponderTerminate: () => {
        if (strokeRef.current && Array.isArray(strokeRef.current.points) && strokeRef.current.points.length > 0) {
          const clone = JSON.parse(JSON.stringify(strokeRef.current)) as Stroke;
          setStrokes(prev => [...prev, clone]);
        }
        strokeRef.current = null;
        setCurrentStroke(null);
      },
    })
  ).current;

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
    strokeRef.current = null;
  };

  const pointsToSvgPath = (points?: DrawPoint[]) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  };

  const canComplete = strokes.length > 0 || (currentStroke && currentStroke.points.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#666" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <View style={[styles.activityIconLarge, { backgroundColor: '#27AE6020' }]}>
            <Pencil color="#27AE60" size={48} />
          </View>
        </View>

        <Text style={styles.activityMainTitle}>Drawing Test</Text>
        <Text style={styles.activityDescription}>
          Draw the scenery shown below
        </Text>

        <View style={styles.drawingSection}>
          <Text style={styles.sectionTitle}>Reference Image</Text>
          <View style={styles.referenceImage}>
            <Svg width="100%" height="200" viewBox="0 0 300 200">
              <Rect width="300" height="200" fill="#E3F2FD" />
              <Circle cx="250" cy="40" r="30" fill="#FDD835" />
              <Polygon points="150,80 130,120 170,120" fill="#2E7D32" />
              <Rect x="140" y="120" width="20" height="30" fill="#5D4037" />
              <Rect y="150" width="300" height="50" fill="#66BB6A" />
            </Svg>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Drawing</Text>
          <View style={styles.canvasContainer} {...panResponder.panHandlers}>
            <Svg width="100%" height="100%">
              <Rect width="100%" height="100%" fill="#FFFFFF" />
              
              {strokes.map((stroke, index) => {
                if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return null;
                if (stroke.points.length === 1) {
                  const p = stroke.points[0];
                  return <Circle key={`dot-${index}`} cx={p.x} cy={p.y} r={2} fill="#2C3E50" />;
                }
                return <Path key={`stroke-${index}`} d={pointsToSvgPath(stroke.points)} stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
              })}

              {currentStroke && Array.isArray(currentStroke.points) && currentStroke.points.length > 0 && (
                currentStroke.points.length === 1 ? (
                  <Circle cx={currentStroke.points[0].x} cy={currentStroke.points[0].y} r={2} fill="#2C3E50" />
                ) : (
                  <Path d={pointsToSvgPath(currentStroke.points)} stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                )
              )}
            </Svg>

            {strokes.length === 0 && !currentStroke && (
              <Text style={styles.canvasPlaceholder}>Draw here with your finger</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={clearCanvas}>
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.completeButton, { flex: 1 }, !canComplete && styles.disabledButton]}
            onPress={onComplete}
            disabled={!canComplete}
          >
            <Text style={styles.completeButtonText}>Complete Drawing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Voice Activity
function VoiceActivity({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [recording, setRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const textToSpeak = "The quick brown fox jumps over the lazy dog. Cognitive health is important for everyone.";

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingInstance(recording);
      setRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recordingInstance) return;

    try {
      await recordingInstance.stopAndUnloadAsync();
      const uri = recordingInstance.getURI();
      
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
      }
      
      setRecordingInstance(null);
      setRecording(false);
      setHasRecorded(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const playRecording = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#666" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <View style={[styles.activityIconLarge, { backgroundColor: '#E74C3C20' }]}>
            <Mic color="#E74C3C" size={48} />
          </View>
        </View>

        <Text style={styles.activityMainTitle}>Voice Analysis</Text>
        <Text style={styles.activityDescription}>
          Read the text below clearly
        </Text>

        <View style={styles.textBox}>
          <Text style={styles.speakText}>"{textToSpeak}"</Text>
        </View>

        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[styles.micButton, recording && styles.micButtonRecording]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Mic color="#fff" size={40} />
          </TouchableOpacity>
          <Text style={styles.micText}>
            {recording ? 'Recording... Tap to stop' : 'Tap to start recording'}
          </Text>
        </View>

        {hasRecorded && (
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Text style={styles.playButtonText}>▶ Play Recording</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.completeButton, !hasRecorded && styles.disabledButton]}
          onPress={onComplete}
          disabled={!hasRecorded}
        >
          <Text style={styles.completeButtonText}>Complete Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Memory Quiz Activity
function MemoryQuizActivity({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [items, setItems] = useState([
    '🍎 Apple', '🍌 Banana', '🍊 Orange', '🍇 Grapes', 
    '🥕 Carrot', '🍕 Pizza', '🍔 Burger', '🍰 Cake'
  ]);
  const [basket, setBasket] = useState<string[]>([]);
  const targetItems = ['🍎 Apple', '🍌 Banana', '🍊 Orange', '🍇 Grapes'];

  const moveToBasket = (item: string) => {
    if (!targetItems.includes(item)) {
      Alert.alert('Oops!', 'Only fruits should go in the basket!');
      return;
    }
    if (basket.length >= 4) {
      Alert.alert('Basket Full', 'The basket can only hold 4 fruits!');
      return;
    }
    setBasket([...basket, item]);
    setItems(items.filter((i) => i !== item));
  };

  const removeFromBasket = (item: string) => {
    setItems([...items, item]);
    setBasket(basket.filter((i) => i !== item));
  };

  const isComplete = basket.length === 4 && basket.every(item => targetItems.includes(item));

  if (showInstructions) {
    return (
      <View style={styles.container}>
        <View style={styles.activityHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#666" size={24} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsCard}>
            <View style={[styles.activityIconLarge, { backgroundColor: '#F39C1220', marginBottom: 20 }]}>
              <CheckSquare color="#F39C12" size={48} />
            </View>
            <Text style={styles.instructionsTitle}>Memory Quiz Instructions</Text>
            <Text style={styles.instructionsText}>
              Remember these 4 fruits that belong in the basket:
            </Text>
            <View style={styles.targetItemsContainer}>
              {targetItems.map((item) => (
                <View key={item} style={styles.targetItemCard}>
                  <Text style={styles.targetItemText}>{item}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.instructionsNote}>
              You'll see more items, but only select these 4 fruits!
            </Text>
            <TouchableOpacity
              style={styles.startQuizButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.startQuizButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#666" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <View style={[styles.activityIconLarge, { backgroundColor: '#F39C1220' }]}>
            <CheckSquare color="#F39C12" size={48} />
          </View>
        </View>

        <Text style={styles.activityMainTitle}>Memory Quiz</Text>
        <Text style={styles.activityDescription}>
          Tap fruits to move them into the basket
        </Text>

        <View style={styles.quizSection}>
          <Text style={styles.sectionTitle}>Available Items:</Text>
          <View style={styles.itemsGrid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.itemCard}
                onPress={() => moveToBasket(item)}
              >
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.basketContainer}>
            <Text style={styles.sectionTitle}>🧺 Fruit Basket ({basket.length}/4)</Text>
            <View style={styles.itemsGrid}>
              {basket.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.basketItem}
                  onPress={() => removeFromBasket(item)}
                >
                  <Text style={styles.itemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {basket.length === 0 && (
              <Text style={styles.emptyBasketText}>Tap fruits to add them here</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, !isComplete && styles.disabledButton]}
          onPress={onComplete}
          disabled={!isComplete}
        >
          <Text style={styles.completeButtonText}>Complete Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Puzzle Activity
function PuzzleActivity({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [pieces, setPieces] = useState([
    { id: 1, color: '#4A90E2', position: 3 },
    { id: 2, color: '#27AE60', position: 1 },
    { id: 3, color: '#E74C3C', position: 2 },
    { id: 4, color: '#F39C12', position: 0 },
  ]);
  const [clickCount, setClickCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const movePiece = (index: number) => {
    if (isSolved) return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    const newPieces = [...pieces];
    
    if (index < 3) {
      const temp = newPieces[index].position;
      newPieces[index].position = newPieces[index + 1].position;
      newPieces[index + 1].position = temp;
      setPieces(newPieces);
    }

    if (newClickCount >= 2) {
      setTimeout(() => {
        const solvedPieces = [
          { id: 1, color: '#4A90E2', position: 0 },
          { id: 2, color: '#27AE60', position: 1 },
          { id: 3, color: '#E74C3C', position: 2 },
          { id: 4, color: '#F39C12', position: 3 },
        ];
        setPieces(solvedPieces);
        setIsSolved(true);
      }, 300);
    }
  };

  const sortedPieces = [...pieces].sort((a, b) => a.position - b.position);

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#666" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.activityContent}>
        <View style={styles.activityIconContainer}>
          <View style={[styles.activityIconLarge, { backgroundColor: '#9B59B620' }]}>
            <Puzzle color="#9B59B6" size={48} />
          </View>
        </View>

        <Text style={styles.activityMainTitle}>Puzzle Challenge</Text>
        <Text style={styles.activityDescription}>
          Arrange colors in correct order: Blue → Green → Red → Orange
        </Text>

        <View style={styles.puzzleSection}>
          <Text style={styles.sectionTitle}>Reference Pattern:</Text>
          <View style={styles.puzzleGrid}>
            <View style={[styles.puzzlePiece, { backgroundColor: '#4A90E2' }]} />
            <View style={[styles.puzzlePiece, { backgroundColor: '#27AE60' }]} />
            <View style={[styles.puzzlePiece, { backgroundColor: '#E74C3C' }]} />
            <View style={[styles.puzzlePiece, { backgroundColor: '#F39C12' }]} />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Your Puzzle (Tap to swap):</Text>
          <View style={styles.puzzleGrid}>
            {sortedPieces.map((piece, index) => (
              <TouchableOpacity
                key={piece.id}
                style={[styles.puzzlePiece, { backgroundColor: piece.color }]}
                onPress={() => movePiece(index)}
              />
            ))}
          </View>
        </View>

        {isSolved && (
          <View style={styles.solvedBadge}>
            <Text style={styles.solvedText}>🎉 Puzzle Solved!</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.completeButton, !isSolved && styles.disabledButton]}
          onPress={onComplete}
          disabled={!isSolved}
        >
          <Text style={styles.completeButtonText}>Complete Puzzle</Text>
        </TouchableOpacity>
      </ScrollView>
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
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityCardCompleted: {
    borderColor: '#27AE60',
    backgroundColor: '#E8F5E9',
  },
  activityCardNext: {
    borderColor: '#4A90E2',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  activityCardLocked: {
    opacity: 0.5,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  completionCard: {
    backgroundColor: '#27AE60',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  homeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 16,
  },
  activityHeader: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  activityContent: {
    padding: 24,
  },
  activityIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
  },
  eyeBox: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: 80,
    height: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  eyeBoxCorner: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#27AE60',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  disabledButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  drawingSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  referenceImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#90CAF9',
    marginBottom: 16,
  },
  canvasContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholder: {
    position: 'absolute',
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  textBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  speakText: {
    fontSize: 18,
    color: '#2C3E50',
    lineHeight: 28,
    textAlign: 'center',
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButtonRecording: {
    backgroundColor: '#C0392B',
  },
  micText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  targetItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  targetItemCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F39C12',
    minWidth: 120,
    alignItems: 'center',
  },
  targetItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  instructionsNote: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  startQuizButton: {
    backgroundColor: '#F39C12',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  startQuizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quizSection: {
    width: '100%',
    marginBottom: 24,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
    width: (SCREEN_WIDTH - 72) / 2,
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  basketContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#F39C12',
    borderStyle: 'dashed',
    minHeight: 180,
  },
  basketItem: {
    width: (SCREEN_WIDTH - 96) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F39C12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyBasketText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 32,
  },
  puzzleSection: {
    width: '100%',
    marginBottom: 24,
  },
  puzzleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  puzzlePiece: {
    width: (SCREEN_WIDTH - 80) / 4,
    height: (SCREEN_WIDTH - 80) / 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  solvedBadge: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
    marginBottom: 16,
  },
  solvedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27AE60',
    textAlign: 'center',
  },
});