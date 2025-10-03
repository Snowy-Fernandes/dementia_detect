import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Lightbulb, Target, CircleCheck as CheckCircle, TrendingUp, Award } from 'lucide-react-native';
import { StorageService } from '../../utils/storage';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  completed: boolean;
}

const generateRecommendations = (scanCount: number): Recommendation[] => {
  const base: Recommendation[] = [
    {
      id: '1',
      title: 'Daily Memory Exercise',
      description: 'Practice recalling 5 items from your breakfast each morning',
      difficulty: 'Easy',
      category: 'Memory',
      completed: false,
    },
    {
      id: '2',
      title: 'Brain Games',
      description: 'Play memory games for 15 minutes daily',
      difficulty: 'Easy',
      category: 'Cognitive',
      completed: false,
    },
    {
      id: '3',
      title: 'Social Engagement',
      description: 'Have a meaningful conversation with someone today',
      difficulty: 'Easy',
      category: 'Social',
      completed: false,
    },
    {
      id: '4',
      title: 'Learning Activity',
      description: 'Learn a new word or fact each day',
      difficulty: 'Medium',
      category: 'Learning',
      completed: false,
    },
    {
      id: '5',
      title: 'Physical Exercise',
      description: 'Take a 20-minute walk to boost brain health',
      difficulty: 'Medium',
      category: 'Physical',
      completed: false,
    },
  ];

  if (scanCount >= 3) {
    base.push({
      id: '6',
      title: 'Complex Puzzles',
      description: 'Solve crosswords or sudoku puzzles',
      difficulty: 'Hard',
      category: 'Cognitive',
      completed: false,
    });
  }

  return base;
};

export default function ImprovementScreen() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    const progress = await StorageService.getScanProgress();
    const totalScans = progress.quickScans + progress.fullScans;
    const recs = generateRecommendations(totalScans);
    setRecommendations(recs);
  };

  const handleToggleComplete = (id: string) => {
    if (completedToday.includes(id)) {
      setCompletedToday(completedToday.filter((cid) => cid !== id));
    } else {
      setCompletedToday([...completedToday, id]);
    }
  };

  const completionRate = recommendations.length > 0
    ? Math.round((completedToday.length / recommendations.length) * 100)
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#27AE60';
      case 'Medium':
        return '#F39C12';
      case 'Hard':
        return '#E74C3C';
      default:
        return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Improvement Plan</Text>
        <Text style={styles.headerSubtitle}>Personalized recommendations for you</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp color="#4A90E2" size={32} />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedToday.length} of {recommendations.length} completed
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
        </View>

        {completedToday.length === recommendations.length && recommendations.length > 0 && (
          <View style={styles.celebrationCard}>
            <Award color="#F39C12" size={48} />
            <Text style={styles.celebrationTitle}>Amazing Work!</Text>
            <Text style={styles.celebrationText}>
              You've completed all recommendations for today. Keep up the great work!
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>Your Recommendations</Text>
          </View>

          {recommendations.map((rec) => {
            const isCompleted = completedToday.includes(rec.id);

            return (
              <TouchableOpacity
                key={rec.id}
                style={[styles.recommendationCard, isCompleted && styles.recommendationCardCompleted]}
                onPress={() => handleToggleComplete(rec.id)}
                activeOpacity={0.8}
              >
                <View style={styles.recommendationHeader}>
                  <View style={styles.categoryBadge}>
                    <Target color="#4A90E2" size={14} />
                    <Text style={styles.categoryText}>{rec.category}</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(rec.difficulty)}20` }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(rec.difficulty) }]}>
                      {rec.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.recommendationContent}>
                  <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                      {isCompleted && <CheckCircle color="#fff" size={20} />}
                    </View>
                    <View style={styles.textContent}>
                      <Text style={[styles.recommendationTitle, isCompleted && styles.recommendationTitleCompleted]}>
                        {rec.title}
                      </Text>
                      <Text style={styles.recommendationDescription}>{rec.description}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pro Tip</Text>
          <Text style={styles.tipText}>
            Consistency is key! Try to complete these activities at the same time each day to build a healthy routine.
          </Text>
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    marginLeft: 16,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    minWidth: 45,
    textAlign: 'right',
  },
  celebrationCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F7DC6F',
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationCardCompleted: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#B0BEC5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  textContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  recommendationTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#7F8C8D',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
  },
});
