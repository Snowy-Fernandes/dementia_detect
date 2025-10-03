import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video, Camera, Pencil, CircleCheck as CheckCircle } from 'lucide-react-native';
import { StorageService } from '../../utils/storage';

export default function QuickScanScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [drawingPoints, setDrawingPoints] = useState<any[]>([]);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);

  const totalSteps = 3;
  const questions = [
    'What did you have for breakfast today?',
    'Can you name three animals?',
    'What is today\'s date?',
  ];

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

  const handleStopCamera = () => {
    setShowCamera(false);
    setIsRecording(false);
    Alert.alert('Success', 'Video recorded successfully!');
    updateProgress();
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Required', 'Please provide an answer');
      return;
    }
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (newAnswers.length >= questions.length) {
      updateProgress();
    }
  };

  const handleDrawingComplete = () => {
    Alert.alert('Success', 'Drawing saved successfully!');
    updateProgress();
  };

  const updateProgress = () => {
    const newStep = currentStep + 1;
    const newProgress = ((newStep) / totalSteps) * 100;

    if (newStep >= totalSteps) {
      completeScan();
    } else {
      setCurrentStep(newStep);
      setProgress(newProgress);
    }
  };

  const completeScan = async () => {
    await StorageService.updateScanProgress('quick');
    const badges = await StorageService.getBadges();
    if (!badges.includes('first_scan')) {
      await StorageService.addBadge('first_scan');
    }

    Alert.alert(
      'Quick Scan Complete!',
      'Great job! Your results have been saved.',
      [
        {
          text: 'View Results',
          onPress: () => {
            setCurrentStep(0);
            setProgress(0);
            setAnswers([]);
          },
        },
      ]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Video color="#4A90E2" size={48} />
            </View>
            <Text style={styles.stepTitle}>Record Video</Text>
            <Text style={styles.stepDescription}>
              Record a short video answering a simple question
            </Text>

            {showCamera ? (
              <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} facing="front">
                  <View style={styles.cameraOverlay}>
                    <TouchableOpacity
                      style={styles.recordButton}
                      onPress={() => setIsRecording(!isRecording)}
                    >
                      <View style={[
                        styles.recordButtonInner,
                        isRecording && styles.recordButtonRecording
                      ]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={handleStopCamera}
                    >
                      <Text style={styles.stopButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </CameraView>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartCamera}
              >
                <Camera color="#fff" size={24} />
                <Text style={styles.primaryButtonText}>Start Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <CheckCircle color="#27AE60" size={48} />
            </View>
            <Text style={styles.stepTitle}>Answer Questions</Text>
            <Text style={styles.stepDescription}>
              Answer the following questions to the best of your ability
            </Text>

            <View style={styles.questionsContainer}>
              {questions.map((question, index) => (
                <View key={index} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>Question {index + 1}</Text>
                  <Text style={styles.questionText}>{question}</Text>
                  {answers[index] ? (
                    <View style={styles.answeredBadge}>
                      <CheckCircle color="#27AE60" size={16} />
                      <Text style={styles.answeredText}>Answered</Text>
                    </View>
                  ) : (
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Type your answer..."
                      placeholderTextColor="#999"
                      value={index === answers.length ? currentAnswer : ''}
                      onChangeText={setCurrentAnswer}
                      multiline
                      editable={index === answers.length}
                    />
                  )}
                </View>
              ))}
            </View>

            {answers.length < questions.length && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleAnswerSubmit}
              >
                <Text style={styles.primaryButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            )}

            {answers.length === questions.length && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={updateProgress}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Pencil color="#9B59B6" size={48} />
            </View>
            <Text style={styles.stepTitle}>Draw a Shape</Text>
            <Text style={styles.stepDescription}>
              Draw a simple clock showing 3:00
            </Text>

            <View style={styles.drawingArea}>
              <Text style={styles.drawingPlaceholder}>
                Drawing canvas would appear here
              </Text>
              <Text style={styles.drawingHint}>
                Tap and drag to draw
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDrawingComplete}
            >
              <Text style={styles.primaryButtonText}>Complete Drawing</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Scan</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% Complete
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {renderStep()}
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
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
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
    backgroundColor: '#4A90E2',
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
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E74C3C',
  },
  recordButtonRecording: {
    borderRadius: 8,
  },
  stopButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 24,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  questionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  questionNumber: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  answeredText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  drawingArea: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  drawingPlaceholder: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  drawingHint: {
    fontSize: 14,
    color: '#95A5A6',
  },
});
