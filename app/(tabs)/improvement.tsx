import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { 
  Lightbulb, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Award,
  Users,
  Brain,
  Gamepad2,
  Calendar,
  Clock,
  X,
  Phone
} from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  points: number;
  duration: string;
}

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  difficulty: string;
}

interface ImprovementPlan {
  week: number;
  focus: string;
  goals: string[];
}

const GAMES: Game[] = [
  {
    id: 'g1',
    name: 'Memory Match',
    description: 'Match pairs of cards to improve short-term memory',
    category: 'Memory',
    duration: '10 min',
    difficulty: 'Easy'
  },
  {
    id: 'g2',
    name: 'Word Association',
    description: 'Connect related words to enhance cognitive flexibility',
    category: 'Cognitive',
    duration: '15 min',
    difficulty: 'Medium'
  },
  {
    id: 'g3',
    name: 'Pattern Recognition',
    description: 'Identify patterns to boost analytical thinking',
    category: 'Cognitive',
    duration: '12 min',
    difficulty: 'Medium'
  },
  {
    id: 'g4',
    name: 'Number Sequence',
    description: 'Remember and recall number sequences',
    category: 'Memory',
    duration: '8 min',
    difficulty: 'Easy'
  }
];

const IMPROVEMENT_PLANS: ImprovementPlan[] = [
  {
    week: 1,
    focus: 'Building Foundation',
    goals: [
      'Complete daily memory exercises',
      'Establish consistent routine',
      'Track progress daily'
    ]
  },
  {
    week: 2,
    focus: 'Cognitive Enhancement',
    goals: [
      'Play 2 brain games daily',
      'Increase social interactions',
      'Practice mindfulness'
    ]
  },
  {
    week: 3,
    focus: 'Advanced Training',
    goals: [
      'Tackle complex puzzles',
      'Learn new skills',
      'Physical exercise routine'
    ]
  },
  {
    week: 4,
    focus: 'Consolidation',
    goals: [
      'Review all activities',
      'Identify improvements',
      'Set new challenges'
    ]
  }
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Morning Memory Exercise',
    description: 'Recall 5 items from yesterday evening. Write them down and verify.',
    difficulty: 'Easy',
    category: 'Memory',
    points: 10,
    duration: '5 min'
  },
  {
    id: '2',
    title: 'Brain Training Game',
    description: 'Play a memory or cognitive game for focused mental stimulation.',
    difficulty: 'Easy',
    category: 'Cognitive',
    points: 15,
    duration: '15 min'
  },
  {
    id: '3',
    title: 'Social Connection',
    description: 'Have a 10-minute meaningful conversation with a friend or family member.',
    difficulty: 'Easy',
    category: 'Social',
    points: 10,
    duration: '10 min'
  },
  {
    id: '4',
    title: 'Learn Something New',
    description: 'Study a new topic, word, or skill for at least 15 minutes.',
    difficulty: 'Medium',
    category: 'Learning',
    points: 20,
    duration: '15 min'
  },
  {
    id: '5',
    title: 'Physical Exercise',
    description: 'Take a 20-minute walk or do light exercise to boost brain health.',
    difficulty: 'Medium',
    category: 'Physical',
    points: 20,
    duration: '20 min'
  },
  {
    id: '6',
    title: 'Meditation Practice',
    description: 'Practice 10 minutes of mindfulness or meditation.',
    difficulty: 'Medium',
    category: 'Mental Health',
    points: 15,
    duration: '10 min'
  },
  {
    id: '7',
    title: 'Complex Puzzle',
    description: 'Solve a crossword, sudoku, or logic puzzle.',
    difficulty: 'Hard',
    category: 'Cognitive',
    points: 25,
    duration: '20 min'
  },
  {
    id: '8',
    title: 'Reading Session',
    description: 'Read for 30 minutes and summarize what you learned.',
    difficulty: 'Medium',
    category: 'Learning',
    points: 20,
    duration: '30 min'
  }
];

export default function ImprovementScreen() {
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showGames, setShowGames] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    saveProgress();
  }, [completedToday, totalPoints, streak]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('improvement_progress');
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedToday(data.completedToday || []);
        setTotalPoints(data.totalPoints || 0);
        setStreak(data.streak || 0);
        setCurrentWeek(Math.floor((data.totalPoints || 0) / 100) + 1);
        
        // Check if it's a new day
        const lastDate = data.lastDate;
        const today = new Date().toDateString();
        if (lastDate !== today) {
          setCompletedToday([]);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const data = {
        completedToday,
        totalPoints,
        streak,
        lastDate: new Date().toDateString()
      };
      await AsyncStorage.setItem('improvement_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleToggleComplete = (id: string) => {
    const rec = RECOMMENDATIONS.find(r => r.id === id);
    if (!rec) return;

    if (completedToday.includes(id)) {
      setCompletedToday(completedToday.filter((cid) => cid !== id));
      setTotalPoints(prev => Math.max(0, prev - rec.points));
    } else {
      setCompletedToday([...completedToday, id]);
      setTotalPoints(prev => prev + rec.points);
      
      // Update streak
      if (completedToday.length + 1 >= 3 && !completedToday.length) {
        setStreak(prev => prev + 1);
      }
    }
  };

  const handleConnectSpecialist = () => {
    setShowSpecialistModal(true);
  };

  const handleCallSpecialist = () => {
    Linking.openURL('tel:+18002255333').catch(err => 
      Alert.alert('Error', 'Unable to make a call. Please try again.')
    );
  };

  const handleEmailSpecialist = () => {
    Linking.openURL('mailto:support@dementiacare.com?subject=Connect%20with%20Specialist&body=Hello,%20I%20would%20like%20to%20connect%20with%20a%20specialist.').catch(err =>
      Alert.alert('Error', 'Unable to open email. Please try again.')
    );
  };

  const handleNavigateToSpecialists = () => {
    try {
      // Try to navigate to specialists screen
      router.push('/specialists');
    } catch (error) {
      // If navigation fails, show alternative options
      Alert.alert(
        'Specialist Connection',
        'Choose how you would like to connect:',
        [
          { text: 'Phone Call', onPress: handleCallSpecialist },
          { text: 'Email', onPress: handleEmailSpecialist },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handlePlayGame = (game: Game) => {
    Alert.alert(
      game.name,
      `${game.description}\n\nDuration: ${game.duration}\nDifficulty: ${game.difficulty}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Game',
          onPress: () => {
            setShowGames(false);
            Alert.alert('Game Started', `Enjoy playing ${game.name}! Complete it to earn points.`);
          }
        }
      ]
    );
  };

  const completionRate = RECOMMENDATIONS.length > 0
    ? Math.round((completedToday.length / RECOMMENDATIONS.length) * 100)
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#27AE60';
      case 'Medium': return '#F39C12';
      case 'Hard': return '#E74C3C';
      default: return '#7F8C8D';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Improvement Plan</Text>
        <Text style={styles.headerSubtitle}>Your personalized cognitive enhancement journey</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp color="#4A90E2" size={24} />
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <Award color="#F39C12" size={24} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Target color="#27AE60" size={24} />
            <Text style={styles.statValue}>{currentWeek}</Text>
            <Text style={styles.statLabel}>Week</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Calendar color="#4A90E2" size={28} />
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedToday.length} of {RECOMMENDATIONS.length} completed
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

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowGames(true)}
          >
            <Gamepad2 color="#fff" size={20} />
            <Text style={styles.actionButtonText}>Brain Games</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowPlans(true)}
          >
            <Brain color="#fff" size={20} />
            <Text style={styles.actionButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.specialistButton}
          onPress={handleConnectSpecialist}
        >
          <Users color="#fff" size={22} />
          <Text style={styles.specialistButtonText}>Connect with Specialist</Text>
        </TouchableOpacity>

        {/* Celebration */}
        {completedToday.length === RECOMMENDATIONS.length && RECOMMENDATIONS.length > 0 && (
          <View style={styles.celebrationCard}>
            <Award color="#F39C12" size={48} />
            <Text style={styles.celebrationTitle}>Perfect Day! 🎉</Text>
            <Text style={styles.celebrationText}>
              You've completed all tasks! You earned {RECOMMENDATIONS.reduce((sum, r) => sum + r.points, 0)} points today.
            </Text>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>Daily Tasks</Text>
          </View>

          {RECOMMENDATIONS.map((rec) => {
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
                  <View style={styles.headerRight}>
                    <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(rec.difficulty)}20` }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(rec.difficulty) }]}>
                        {rec.difficulty}
                      </Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>+{rec.points} pts</Text>
                    </View>
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
                      <View style={styles.durationRow}>
                        <Clock color="#7F8C8D" size={14} />
                        <Text style={styles.durationText}>{rec.duration}</Text>
                      </View>
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
            Complete at least 3 tasks daily to maintain your streak. Consistency builds better cognitive health!
          </Text>
        </View>
      </ScrollView>

      {/* Games Modal */}
      <Modal
        visible={showGames}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGames(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Brain Games</Text>
              <TouchableOpacity onPress={() => setShowGames(false)}>
                <X color="#2C3E50" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {GAMES.map(game => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => handlePlayGame(game)}
                >
                  <View style={styles.gameIcon}>
                    <Gamepad2 color="#4A90E2" size={24} />
                  </View>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameDescription}>{game.description}</Text>
                    <View style={styles.gameMetaRow}>
                      <Text style={styles.gameMeta}>{game.duration}</Text>
                      <Text style={styles.gameMeta}>•</Text>
                      <Text style={styles.gameMeta}>{game.difficulty}</Text>
                      <Text style={styles.gameMeta}>•</Text>
                      <Text style={styles.gameMeta}>{game.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Plans Modal */}
      <Modal
        visible={showPlans}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlans(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>4-Week Improvement Plan</Text>
              <TouchableOpacity onPress={() => setShowPlans(false)}>
                <X color="#2C3E50" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {IMPROVEMENT_PLANS.map(plan => (
                <View 
                  key={plan.week} 
                  style={[
                    styles.planCard,
                    currentWeek === plan.week && styles.planCardActive
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planWeek}>Week {plan.week}</Text>
                    {currentWeek === plan.week && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planFocus}>{plan.focus}</Text>
                  <View style={styles.goalsContainer}>
                    {plan.goals.map((goal, idx) => (
                      <View key={idx} style={styles.goalRow}>
                        <Text style={styles.goalBullet}>•</Text>
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Specialist Connection Modal */}
      <Modal
        visible={showSpecialistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSpecialistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connect with Specialist</Text>
              <TouchableOpacity onPress={() => setShowSpecialistModal(false)}>
                <X color="#2C3E50" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.specialistModalContent}>
              <View style={styles.specialistIcon}>
                <Users color="#4A90E2" size={48} />
              </View>
              
              <Text style={styles.specialistModalTitle}>
                Professional Support Available
              </Text>
              
              <Text style={styles.specialistModalDescription}>
                Connect with certified healthcare specialists who can provide personalized guidance and support for cognitive health improvement.
              </Text>

              <View style={styles.specialistOptions}>
                <TouchableOpacity 
                  style={styles.specialistOption}
                  onPress={handleNavigateToSpecialists}
                >
                  <View style={styles.optionIcon}>
                    <Users color="#4A90E2" size={24} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Browse Specialists</Text>
                    <Text style={styles.optionDescription}>
                      View available specialists and their profiles
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.specialistOption}
                  onPress={handleCallSpecialist}
                >
                  <View style={styles.optionIcon}>
                    <Phone color="#27AE60" size={24} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Immediate Call</Text>
                    <Text style={styles.optionDescription}>
                      Call our support line for immediate assistance
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.specialistOption}
                  onPress={handleEmailSpecialist}
                >
                  <View style={styles.optionIcon}>
                    <Award color="#F39C12" size={24} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Email Consultation</Text>
                    <Text style={styles.optionDescription}>
                      Send an email for detailed consultation
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.specialistFooter}>
                <Text style={styles.footerText}>
                  Available Monday - Friday, 9 AM - 6 PM
                </Text>
                <Text style={styles.footerNote}>
                  Emergency? Call 911 immediately
                </Text>
              </View>
            </View>
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
    fontSize: 15,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  specialistButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  specialistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 18,
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
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
  pointsBadge: {
    backgroundColor: '#F39C1220',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: '#F39C12',
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
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: '#7F8C8D',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gameCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  gameMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gameMeta: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  planCard: {
    padding: 20,
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  planCardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planWeek: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  currentBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  planFocus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
  },
  goalsContainer: {
    gap: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalBullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 8,
    marginTop: 2,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  // Specialist Modal Styles
  specialistModalContent: {
    padding: 24,
  },
  specialistIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  specialistModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  specialistModalDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  specialistOptions: {
    gap: 16,
    marginBottom: 30,
  },
  specialistOption: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  specialistFooter: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  footerText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
});