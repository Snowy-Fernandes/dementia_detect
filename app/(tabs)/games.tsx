import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Brain, Puzzle, Calculator, ChefHat, Trophy, X } from 'lucide-react-native';
import { StorageService, GameScore } from '../../utils/storage';

const games = [
  {
    id: 'memory',
    title: 'Memory Recall',
    description: 'Remember and match patterns',
    icon: Brain,
    color: '#4A90E2',
    difficulty: 'Easy',
  },
  {
    id: 'puzzle',
    title: 'Puzzle Master',
    description: 'Solve challenging puzzles',
    icon: Puzzle,
    color: '#27AE60',
    difficulty: 'Medium',
  },
  {
    id: 'math',
    title: 'Math Challenge',
    description: 'Quick arithmetic exercises',
    icon: Calculator,
    color: '#E74C3C',
    difficulty: 'Easy',
  },
  {
    id: 'cooking',
    title: 'Cooking Memory',
    description: 'Remember recipe sequences',
    icon: ChefHat,
    color: '#F39C12',
    difficulty: 'Hard',
  },
];

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameProgress, setGameProgress] = useState(0);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    const scores = await StorageService.getGameScores();
    setGameScores(scores);
  };

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setCurrentScore(0);
    setGameProgress(0);
  };

  const playGame = () => {
    const newProgress = gameProgress + 25;
    const points = Math.floor(Math.random() * 100) + 50;
    setCurrentScore(currentScore + points);
    setGameProgress(newProgress);

    if (newProgress >= 100) {
      completeGame();
    }
  };

  const completeGame = async () => {
    const game = games.find((g) => g.id === selectedGame);
    if (!game) return;

    const score: GameScore = {
      gameType: game.title,
      score: currentScore,
      date: new Date().toISOString(),
      difficulty: game.difficulty,
    };

    await StorageService.saveGameScore(score);
    await loadScores();

    const badges = await StorageService.getBadges();
    if (!badges.includes('game_master') && currentScore > 500) {
      await StorageService.addBadge('game_master');
    }

    Alert.alert(
      '🎉 Game Complete!',
      `You scored ${currentScore} points!\n\nGreat job on completing ${game.title}!`,
      [
        {
          text: 'Play Again',
          onPress: () => startGame(selectedGame!),
        },
        {
          text: 'Back to Games',
          onPress: () => setSelectedGame(null),
        },
      ]
    );
  };

  const renderGameModal = () => {
    const game = games.find((g) => g.id === selectedGame);
    if (!game) return null;

    const Icon = game.icon;

    return (
      <Modal
        visible={!!selectedGame}
        animationType="slide"
        onRequestClose={() => setSelectedGame(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{game.title}</Text>
            <TouchableOpacity onPress={() => setSelectedGame(null)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.gameContent}>
            <View style={[styles.gameIconLarge, { backgroundColor: `${game.color}20` }]}>
              <Icon color={game.color} size={64} />
            </View>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Current Score</Text>
              <Text style={styles.scoreValue}>{currentScore}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${gameProgress}%`, backgroundColor: game.color }]}
                />
              </View>
              <Text style={styles.progressText}>{gameProgress}% Complete</Text>
            </View>

            <View style={styles.gameInstructions}>
              <Text style={styles.instructionsTitle}>How to Play</Text>
              <Text style={styles.instructionsText}>
                {game.id === 'memory' && 'Match the patterns that appear on screen. The faster you match, the higher your score!'}
                {game.id === 'puzzle' && 'Arrange the pieces to complete the puzzle. Use logic and spatial reasoning!'}
                {game.id === 'math' && 'Solve arithmetic problems quickly and accurately. Each correct answer earns points!'}
                {game.id === 'cooking' && 'Remember the recipe steps in order. Test your sequential memory skills!'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: game.color }]}
              onPress={playGame}
              disabled={gameProgress >= 100}
            >
              <Text style={styles.playButtonText}>
                {gameProgress >= 100 ? 'Completed!' : gameProgress === 0 ? 'Start Playing' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const getAverageScore = (gameTitle: string) => {
    const scores = gameScores.filter((s) => s.gameType === gameTitle);
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / scores.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Games Hub</Text>
        <Text style={styles.headerSubtitle}>Train your brain with fun activities</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsCard}>
          <Trophy color="#F39C12" size={32} />
          <View style={styles.statsContent}>
            <Text style={styles.statsNumber}>{gameScores.length}</Text>
            <Text style={styles.statsLabel}>Games Played</Text>
          </View>
        </View>

        <View style={styles.gamesGrid}>
          {games.map((game) => {
            const Icon = game.icon;
            const avgScore = getAverageScore(game.title);

            return (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => startGame(game.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                  <Icon color={game.color} size={32} />
                </View>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.gameFooter}>
                  <View style={[styles.difficultyBadge, getDifficultyColor(game.difficulty)]}>
                    <Text style={styles.difficultyText}>{game.difficulty}</Text>
                  </View>
                  {avgScore > 0 && (
                    <Text style={styles.avgScore}>Avg: {avgScore}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {gameScores.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {gameScores.slice(-5).reverse().map((score, index) => (
              <View key={index} style={styles.historyCard}>
                <View>
                  <Text style={styles.historyGame}>{score.gameType}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(score.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyScore}>{score.score} pts</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {renderGameModal()}
    </View>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return { backgroundColor: '#E8F5E9' };
    case 'Medium':
      return { backgroundColor: '#FFF3E0' };
    case 'Hard':
      return { backgroundColor: '#FFEBEE' };
    default:
      return { backgroundColor: '#F5F5F5' };
  }
};

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
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F7DC6F',
  },
  statsContent: {
    marginLeft: 16,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statsLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  gamesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  avgScore: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  historySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyGame: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  historyScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
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
  gameContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  gameIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    fontWeight: '600',
  },
  gameInstructions: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  playButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
