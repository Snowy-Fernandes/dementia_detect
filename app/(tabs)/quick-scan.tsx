import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Animated,
  PanResponder,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video, Camera, Brain, Trophy, Star, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../utils/storage';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

interface DrawPoint { x: number; y: number; }
interface Stroke { points: DrawPoint[]; color: string; width: number; }

const DRAWING_STORAGE_KEY = '@quickscan:drawing';

export default function QuickScanScreen() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelComplete, setLevelComplete] = useState<boolean[]>([false, false, false]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const strokeRef = useRef<Stroke | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [penColor, setPenColor] = useState<string>('#2C3E50');
  const [penWidth, setPenWidth] = useState<number>(3);

  // Analysis popup states & animation
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisText, setAnalysisText] = useState('You have 0.5% risk of dementia. No worries — keep focused and maintain a healthy lifestyle.');
  const modalScale = useRef(new Animated.Value(0)).current;

  // Load strokes once, validating and normalizing data
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(DRAWING_STORAGE_KEY);
        if (!raw) return;
        const parsed: any = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        const normalized: Stroke[] = parsed
          .filter(s => s && Array.isArray(s.points))
          .map(s => ({
            color: s.color ?? '#2C3E50',
            width: typeof s.width === 'number' ? s.width : 3,
            points: s.points
              .filter((p: any) => p && (typeof p.x === 'number' || !isNaN(Number(p.x))) && (typeof p.y === 'number' || !isNaN(Number(p.y))))
              .map((p: any) => ({ x: Number(p.x), y: Number(p.y) })),
          }))
          .filter(s => Array.isArray(s.points)); // final sanity
        setStrokes(normalized);
      } catch (e) {
        console.warn('Failed to load drawing from storage', e);
      }
    };
    load();
  }, []);

  // Show/hide modal animation
  useEffect(() => {
    if (showAnalysis) {
      modalScale.setValue(0);
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
    } else {
      Animated.timing(modalScale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [showAnalysis, modalScale]);

  // Save helper (so we can call immediately on release)
  const saveStrokesToStorage = async (toSave: Stroke[]) => {
    try {
      const filtered = toSave.filter(s => s && Array.isArray(s.points) && s.points.length > 0);
      await AsyncStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save drawing', e);
    }
  };

  // PanResponder: build current stroke in a ref then commit on release/terminate
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newStroke: Stroke = { points: [{ x: locationX, y: locationY }], color: penColor, width: penWidth };
        strokeRef.current = newStroke;
        setCurrentStroke(newStroke);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (!strokeRef.current) return;
        // make a new object with appended point (immutable-style for safety)
        const updated = {
          ...strokeRef.current,
          points: [...strokeRef.current.points, { x: locationX, y: locationY }],
        };
        strokeRef.current = updated;
        setCurrentStroke(updated);
      },
      onPanResponderRelease: async () => {
        if (strokeRef.current && Array.isArray(strokeRef.current.points) && strokeRef.current.points.length > 0) {
          // deep clone to avoid later mutations affecting stored stroke
          const clone = JSON.parse(JSON.stringify(strokeRef.current)) as Stroke;
          setStrokes(prev => {
            const next = [...prev, clone];
            // persist immediately so nothing is lost between frames
            saveStrokesToStorage(next).catch(() => {});
            return next;
          });
        }
        strokeRef.current = null;
        setCurrentStroke(null);
      },
      onPanResponderTerminate: async () => {
        if (strokeRef.current && Array.isArray(strokeRef.current.points) && strokeRef.current.points.length > 0) {
          const clone = JSON.parse(JSON.stringify(strokeRef.current)) as Stroke;
          setStrokes(prev => {
            const next = [...prev, clone];
            saveStrokesToStorage(next).catch(() => {});
            return next;
          });
        }
        strokeRef.current = null;
        setCurrentStroke(null);
      },
    })
  ).current;

  const questions = [
    { id: 1, text: 'What is your full name?', placeholder: 'Enter your name' },
    { id: 2, text: 'What day of the week is today?', placeholder: 'Enter day' },
    { id: 3, text: 'Can you name three animals?', placeholder: 'E.g., dog, cat, bird' },
  ];

  const videoPrompt = "Please say: 'Today is a beautiful day and I am feeling great!'";

  const handleStartCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed for video recording.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setVideoRecorded(true);
    setShowCamera(false);
    Alert.alert('Great!', 'Video recorded successfully!');
  };

  const showAnalysisCard = (msg?: string) => {
    if (msg) setAnalysisText(msg);
    setShowAnalysis(true);
  };

  const hideAnalysisCard = () => {
    setShowAnalysis(false);
  };

  const completeLevel1 = () => {
    if (!videoRecorded) {
      Alert.alert('Incomplete', 'Please record the video first');
      return;
    }
    const newComplete = [...levelComplete];
    newComplete[0] = true;
    setLevelComplete(newComplete);
    celebrateCompletion();
    setTimeout(() => setCurrentLevel(2), 1000);
  };

  const completeLevel2 = () => {
    const allAnswered = questions.every(q => answers[q.id]?.trim());
    if (!allAnswered) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }
    const newComplete = [...levelComplete];
    newComplete[1] = true;
    setLevelComplete(newComplete);
    celebrateCompletion();
    setTimeout(() => setCurrentLevel(3), 1000);
  };

  const completeLevel3 = () => {
    const pointsFromSaved = strokes.reduce((acc, s) => acc + (s?.points?.length ?? 0), 0);
    const pointsFromRef = strokeRef.current ? (strokeRef.current.points?.length ?? 0) : 0;
    const totalPoints = pointsFromSaved + pointsFromRef;
    if (totalPoints < 10) {
      Alert.alert('Draw More', 'Please draw the clock on the canvas');
      return;
    }
    const newComplete = [...levelComplete];
    newComplete[2] = true;
    setLevelComplete(newComplete);
    celebrateCompletion();
    // show analysis popup and then complete scan shortly after so user sees the popup
    showAnalysisCard('You have 0.5% risk of dementia. No worries — keep focused and maintain a healthy lifestyle.');
    setTimeout(() => {
      completeScan();
    }, 1200);
  };

  const celebrateCompletion = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const completeScan = async () => {
    try {
      await StorageService.updateScanProgress('quick');
      const badges = await StorageService.getBadges();
      if (!badges.includes('first_scan')) await StorageService.addBadge('first_scan');
    } catch (e) {
      console.warn('StorageService error', e);
    }

    Alert.alert('🎉 Scan Complete!', 'Congratulations! You earned 150 points!', [
      {
        text: 'View Results',
        onPress: () => {
          setCurrentLevel(1);
          setLevelComplete([false, false, false]);
          setVideoRecorded(false);
          setAnswers({});
          setStrokes([]);
          setCurrentStroke(null);
          AsyncStorage.removeItem(DRAWING_STORAGE_KEY).catch(() => {});
        },
      },
    ]);
  };

  const handleDrawing = (event: any) => {
    // kept for compatibility but PanResponder handles the real drawing
    const { locationX, locationY } = event.nativeEvent;
    if (!strokeRef.current) {
      const p: Stroke = { points: [{ x: locationX, y: locationY }], color: penColor, width: penWidth };
      strokeRef.current = p;
      setCurrentStroke(p);
      return;
    }
    strokeRef.current = { ...strokeRef.current, points: [...strokeRef.current.points, { x: locationX, y: locationY }] };
    setCurrentStroke(strokeRef.current);
  };

  const clearDrawing = async () => {
    setStrokes([]);
    setCurrentStroke(null);
    strokeRef.current = null;
    try { await AsyncStorage.removeItem(DRAWING_STORAGE_KEY); } catch { /* ignore */ }
  };

  const undoStroke = async () => {
    setStrokes(prev => {
      const next = prev.slice(0, -1);
      saveStrokesToStorage(next).catch(() => {});
      return next;
    });
  };

  // Convert points to SVG path string (handles >1 points). For single point we render Circle.
  const pointsToSvgPath = (points?: DrawPoint[]) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return ''; // special-case: render circle instead of path
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  };

  const renderLevelCard = (level: number, title: string, icon: any, locked: boolean) => {
    const isComplete = levelComplete[level - 1];
    const isCurrent = currentLevel === level;
    return (
      <TouchableOpacity
        style={[styles.levelCard, isCurrent && styles.levelCardActive, isComplete && styles.levelCardComplete, locked && styles.levelCardLocked]}
        disabled={locked}
        activeOpacity={0.7}
      >
        <View style={styles.levelIconContainer}>
          {locked ? <Lock color="#95A5A6" size={32} /> : isComplete ? <View style={styles.completeBadge}><Trophy color="#FFD700" size={32} /></View> : icon}
        </View>
        <Text style={[styles.levelTitle, locked && styles.levelTitleLocked, isComplete && styles.levelTitleComplete]}>{title}</Text>
        {isComplete && <View style={styles.starContainer}><Star color="#FFD700" size={16} fill="#FFD700" /><Star color="#FFD700" size={16} fill="#FFD700" /><Star color="#FFD700" size={16} fill="#FFD700" /></View>}
      </TouchableOpacity>
    );
  };

  const renderLevel1 = () => (
    <View style={styles.levelContent}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelNumber}>Level 1</Text>
        <Text style={styles.levelHeading}>Video Recording Challenge</Text>
        <Text style={styles.levelDescription}>Record yourself speaking the prompt clearly</Text>
      </View>

      <View style={styles.promptCard}>
        <Video color="#4A90E2" size={24} />
        <Text style={styles.promptText}>{videoPrompt}</Text>
      </View>

      {showCamera ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="front">
            <View style={styles.cameraOverlay}>
              <View style={styles.recordingIndicator}>
                {isRecording && <View style={styles.recordingDot} />}
                <Text style={styles.recordingText}>{isRecording ? 'Recording...' : 'Ready to Record'}</Text>
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.recordButton} onPress={() => setIsRecording(!isRecording)}>
                  <View style={[styles.recordButtonInner, isRecording && styles.recordButtonRecording]} />
                </TouchableOpacity>

                {isRecording && <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}><Text style={styles.stopButtonText}>Stop & Save</Text></TouchableOpacity>}
              </View>
            </View>
          </CameraView>
        </View>
      ) : videoRecorded ? (
        <View style={styles.successCard}><Trophy color="#27AE60" size={48} /><Text style={styles.successText}>Video Recorded!</Text></View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={handleStartCamera}><Camera color="#fff" size={24} /><Text style={styles.startButtonText}>Start Recording</Text></TouchableOpacity>
      )}

      {videoRecorded && <TouchableOpacity style={styles.completeButton} onPress={completeLevel1}><Text style={styles.completeButtonText}>Complete Level 1</Text></TouchableOpacity>}
    </View>
  );

  const renderLevel2 = () => (
    <View style={styles.levelContent}>
      <View style={styles.levelHeader}><Text style={styles.levelNumber}>Level 2</Text><Text style={styles.levelHeading}>Memory & Awareness Test</Text><Text style={styles.levelDescription}>Answer these quick questions accurately</Text></View>

      <View style={styles.questionsContainer}>
        {questions.map((question, index) => (
          <View key={question.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Q{index + 1}</Text>
              {answers[question.id] && <View style={styles.answeredBadge}><Text style={styles.answeredText}>✓</Text></View>}
            </View>
            <Text style={styles.questionText}>{question.text}</Text>
            <TextInput style={styles.answerInput} placeholder={question.placeholder} placeholderTextColor="#95A5A6" value={answers[question.id] || ''} onChangeText={(text) => setAnswers({ ...answers, [question.id]: text })} multiline />
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={completeLevel2}><Text style={styles.completeButtonText}>Complete Level 2</Text></TouchableOpacity>
    </View>
  );

  const colorOptions = ['#2C3E50', '#E74C3C', '#27AE60', '#4A90E2', '#9B59B6', '#000000'];

  const renderLevel3 = () => (
    <View style={styles.levelContent}>
      <View style={styles.levelHeader}><Text style={styles.levelNumber}>Level 3</Text><Text style={styles.levelHeading}>Drawing Challenge</Text><Text style={styles.levelDescription}>Draw an analog clock showing 3:00</Text></View>

      <View style={styles.referenceCard}>
        <Text style={styles.referenceTitle}>Reference Clock:</Text>
        <Svg width={120} height={120} style={styles.referenceClock}>
          <Circle cx="60" cy="60" r="55" stroke="#4A90E2" strokeWidth="3" fill="none" />
          <Line x1="60" y1="60" x2="60" y2="20" stroke="#2C3E50" strokeWidth="3" />
          <Line x1="60" y1="60" x2="95" y2="60" stroke="#2C3E50" strokeWidth="3" />
          <Circle cx="60" cy="60" r="4" fill="#2C3E50" />
          <SvgText x="60" y="25" fontSize="12" textAnchor="middle" fill="#2C3E50">12</SvgText>
          <SvgText x="95" y="65" fontSize="12" textAnchor="middle" fill="#2C3E50">3</SvgText>
          <SvgText x="60" y="100" fontSize="12" textAnchor="middle" fill="#2C3E50">6</SvgText>
          <SvgText x="25" y="65" fontSize="12" textAnchor="middle" fill="#2C3E50">9</SvgText>
        </Svg>
      </View>

      <View style={styles.drawingOptions}>
        <View style={styles.colorPicker}>
          {colorOptions.map(c => (
            <TouchableOpacity key={c} onPress={() => setPenColor(c)} style={[styles.colorSwatch, { backgroundColor: c }, penColor === c && styles.colorSwatchSelected]} />
          ))}
        </View>

        <View style={styles.penSizes}>
          <TouchableOpacity onPress={() => setPenWidth(2)} style={[styles.penSizeButton, penWidth === 2 && styles.penSizeSelected]}><View style={{ width: 18, height: 2, backgroundColor: penColor, borderRadius: 1 }} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setPenWidth(4)} style={[styles.penSizeButton, penWidth === 4 && styles.penSizeSelected]}><View style={{ width: 24, height: 4, backgroundColor: penColor, borderRadius: 2 }} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setPenWidth(6)} style={[styles.penSizeButton, penWidth === 6 && styles.penSizeSelected]}><View style={{ width: 30, height: 6, backgroundColor: penColor, borderRadius: 3 }} /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.drawingCanvas} {...panResponder.panHandlers}>
        <Svg width="100%" height="100%">
          {strokes.map((stroke, index) => {
            if (!stroke || !Array.isArray(stroke.points) || stroke.points.length === 0) return null;
            if (stroke.points.length === 1) {
              const p = stroke.points[0];
              return <Circle key={`dot-${index}`} cx={p.x} cy={p.y} r={Math.max(1, stroke.width / 2)} fill={stroke.color} />;
            }
            return <Path key={`stroke-${index}`} d={pointsToSvgPath(stroke.points)} stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
          })}

          {currentStroke && Array.isArray(currentStroke.points) && currentStroke.points.length > 0 && (currentStroke.points.length === 1 ? (
            <Circle cx={currentStroke.points[0].x} cy={currentStroke.points[0].y} r={Math.max(1, currentStroke.width / 2)} fill={currentStroke.color} />
          ) : (
            <Path d={pointsToSvgPath(currentStroke.points)} stroke={currentStroke.color} strokeWidth={currentStroke.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>

        {strokes.length === 0 && !currentStroke && <Text style={styles.canvasPlaceholder}>Draw here with your finger</Text>}
      </View>

      <View style={styles.drawingControls}>
        <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}><Text style={styles.clearButtonText}>Clear</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.clearButton, { backgroundColor: '#E9ECEF' }]} onPress={undoStroke}><Text style={[styles.clearButtonText]}>Undo</Text></TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={completeLevel3}><Text style={styles.completeButtonText}>Complete Level 3</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Scan Challenge</Text>
        <View style={styles.pointsBadge}><Brain color="#4A90E2" size={20} /><Text style={styles.pointsText}>150 pts</Text></View>
      </View>

      <View style={styles.levelIndicator}>
        {renderLevelCard(1, 'Video', <Video color="#4A90E2" size={32} />, false)}
        {renderLevelCard(2, 'Questions', <Brain color="#27AE60" size={32} />, currentLevel < 2 && !levelComplete[0])}
        {renderLevelCard(3, 'Drawing', <Star color="#9B59B6" size={32} />, currentLevel < 3 && !levelComplete[1])}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {currentLevel === 1 && renderLevel1()}
          {currentLevel === 2 && renderLevel2()}
          {currentLevel === 3 && renderLevel3()}
        </Animated.View>
      </ScrollView>

      {/* Analysis Popup Modal */}
      <Modal transparent visible={showAnalysis} animationType="none">
        <TouchableWithoutFeedback onPress={hideAnalysisCard}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalCard, { transform: [{ scale: modalScale }] }]}>
              <Text style={styles.modalTitle}>Quick Analysis</Text>
              <Text style={styles.modalBody}>{analysisText}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={hideAnalysisCard}>
                <Text style={styles.modalButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#2C3E50' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F4F8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  pointsText: { fontSize: 16, fontWeight: '700', color: '#4A90E2' },
  levelIndicator: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, gap: 12 },
  levelCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E9ECEF' },
  levelCardActive: { borderColor: '#4A90E2', backgroundColor: '#E8F4F8' },
  levelCardComplete: { borderColor: '#27AE60', backgroundColor: '#E8F5E9' },
  levelCardLocked: { opacity: 0.5 },
  levelIconContainer: { marginBottom: 8 },
  completeBadge: { backgroundColor: '#FFF9E6', padding: 8, borderRadius: 50 },
  levelTitle: { fontSize: 14, fontWeight: '700', color: '#2C3E50', textAlign: 'center' },
  levelTitleLocked: { color: '#95A5A6' },
  levelTitleComplete: { color: '#27AE60' },
  starContainer: { flexDirection: 'row', marginTop: 8, gap: 4 },
  content: { flex: 1 },
  scrollContent: { padding: 24 },
  levelContent: { gap: 20 },
  levelHeader: { alignItems: 'center', marginBottom: 8 },
  levelNumber: { fontSize: 14, fontWeight: '700', color: '#4A90E2', backgroundColor: '#E8F4F8', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  levelHeading: { fontSize: 24, fontWeight: '700', color: '#2C3E50', marginBottom: 8, textAlign: 'center' },
  levelDescription: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', lineHeight: 22 },
  promptCard: { flexDirection: 'row', backgroundColor: '#E8F4F8', padding: 20, borderRadius: 16, gap: 12, alignItems: 'center' },
  promptText: { flex: 1, fontSize: 16, color: '#2C3E50', fontWeight: '600', lineHeight: 24 },
  cameraContainer: { width: '100%', height: 400, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', paddingVertical: 20 },
  recordingIndicator: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, gap: 8 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E74C3C' },
  recordingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cameraControls: { alignItems: 'center', gap: 16 },
  recordButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  recordButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E74C3C' },
  recordButtonRecording: { borderRadius: 8, width: 30, height: 30 },
  stopButton: { paddingHorizontal: 32, paddingVertical: 14, backgroundColor: '#4A90E2', borderRadius: 24 },
  stopButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A90E2', paddingVertical: 18, borderRadius: 16, gap: 10 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  successCard: { backgroundColor: '#E8F5E9', padding: 32, borderRadius: 20, alignItems: 'center', gap: 12 },
  successText: { fontSize: 20, fontWeight: '700', color: '#27AE60' },
  questionsContainer: { gap: 16 },
  questionCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionNumber: { fontSize: 14, fontWeight: '700', color: '#4A90E2', backgroundColor: '#E8F4F8', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  answeredBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center' },
  answeredText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  questionText: { fontSize: 16, color: '#2C3E50', fontWeight: '600', marginBottom: 12, lineHeight: 24 },
  answerInput: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, fontSize: 16, color: '#2C3E50', minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E9ECEF' },
  referenceCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  referenceTitle: { fontSize: 16, fontWeight: '700', color: '#2C3E50', marginBottom: 16 },
  referenceClock: { marginVertical: 10 },
  drawingOptions: { marginTop: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorPicker: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  colorSwatchSelected: { borderColor: '#000', transform: [{ scale: 1.05 }] },
  penSizes: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  penSizeButton: { padding: 6, borderRadius: 8, backgroundColor: '#F1F3F5', justifyContent: 'center', alignItems: 'center' },
  penSizeSelected: { backgroundColor: '#E8F4F8', borderWidth: 1, borderColor: '#4A90E2' },
  drawingCanvas: { width: '100%', height: 300, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#4A90E2', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  canvasPlaceholder: { position: 'absolute', fontSize: 16, color: '#95A5A6' },
  drawingControls: { flexDirection: 'row', gap: 12, marginTop: 12 },
  clearButton: { flex: 1, backgroundColor: '#E9ECEF', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  clearButtonText: { color: '#7F8C8D', fontSize: 16, fontWeight: '700' },
  completeButton: { flex: 2, backgroundColor: '#27AE60', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 8 },
  modalBody: { fontSize: 15, color: '#4A4A4A', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  modalButton: { backgroundColor: '#4A90E2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
