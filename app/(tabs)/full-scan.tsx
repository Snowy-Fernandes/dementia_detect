import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Eye, Pencil, Mic, SquareCheck as CheckSquare, Puzzle, Save } from 'lucide-react-native';
import { StorageService } from '../../utils/storage';
import { useRouter } from 'expo-router';

const activities = [
  { id: 'eye', title: 'Eye Tracking', icon: Eye, color: '#4A90E2', completed: false },
  { id: 'drawing', title: 'Drawing Test', icon: Pencil, color: '#27AE60', completed: false },
  { id: 'voice', title: 'Voice Analysis', icon: Mic, color: '#E74C3C', completed: false },
  { id: 'mcq', title: 'Memory Quiz', icon: CheckSquare, color: '#F39C12', completed: false },
  { id: 'puzzle', title: 'Puzzle Solve', icon: Puzzle, color: '#9B59B6', completed: false },
];

export default function FullScanScreen() {
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const router = useRouter();

  const progress = (completedActivities.length / activities.length) * 100;

  const handleActivityPress = (activityId: string) => {
    setSelectedActivity(activityId);
    setTimeout(() => {
      completeActivity(activityId);
    }, 2000);
  };

  const completeActivity = (activityId: string) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities([...completedActivities, activityId]);
    }
    setSelectedActivity(null);
  };

  const handleSave = async () => {
    await StorageService.updateScanProgress('full');
    Alert.alert(
      'Progress Saved',
      'Your progress has been saved. You can continue later.',
      [{ text: 'OK' }]
    );
  };

  const handleComplete = async () => {
    if (completedActivities.length < activities.length) {
      Alert.alert(
        'Incomplete Scan',
        'Please complete all activities before finishing.',
        [{ text: 'OK' }]
      );
      return;
    }

    await StorageService.updateScanProgress('full');
    const badges = await StorageService.getBadges();
    if (!badges.includes('full_scan_complete')) {
      await StorageService.addBadge('full_scan_complete');
    }

    Alert.alert(
      'Full Scan Complete!',
      'Excellent work! Your comprehensive assessment is complete.',
      [
        {
          text: 'View Home',
          onPress: () => router.push('/(tabs)' as any),
        },
      ]
    );
  };

  if (selectedActivity) {
    const activity = activities.find((a) => a.id === selectedActivity);
    const Icon = activity?.icon || Eye;

    return (
      <View style={styles.activityContainer}>
        <View style={styles.activityContent}>
          <View style={[styles.activityIconLarge, { backgroundColor: `${activity?.color}20` }]}>
            <Icon color={activity?.color || '#4A90E2'} size={64} />
          </View>
          <Text style={styles.activityTitle}>{activity?.title}</Text>
          <Text style={styles.activityDescription}>
            Completing activity...
          </Text>
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    );
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
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isCompleted = completedActivities.includes(activity.id);

            return (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityCard,
                  isCompleted && styles.activityCardCompleted,
                ]}
                onPress={() => !isCompleted && handleActivityPress(activity.id)}
                disabled={isCompleted}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}20` },
                  ]}
                >
                  <Icon color={activity.color} size={32} />
                </View>
                <Text style={styles.activityName}>{activity.title}</Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <CheckSquare color="#27AE60" size={20} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Save color="#4A90E2" size={20} />
            <Text style={styles.saveButtonText}>Save Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeButton,
              completedActivities.length < activities.length && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={completedActivities.length < activities.length}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>Complete Scan</Text>
          </TouchableOpacity>
        </View>
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
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  activityCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
  activityIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  completeButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  activityContent: {
    alignItems: 'center',
  },
  activityIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  activityDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
  },
});
