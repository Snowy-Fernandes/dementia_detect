import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Brain, Puzzle, Calculator, ChefHat, Trophy, X, Lock, Star, Move } from 'lucide-react-native';
import { StorageService, GameScore } from '../../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

// Updated PuzzleGame with image and directional controls
const PuzzleGame = ({ onComplete, onScoreUpdate }: { onComplete: (score: number) => void; onScoreUpdate: (score: number) => void }) => {
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sample puzzle image (you can replace this with any image URL)
  const puzzleImage = 'https://images.unsplash.com/photo-1546561892-65bf811416cf?w=300&h=300&fit=crop';

  useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const shuffled = [...solved].sort(() => Math.random() - 0.5);
    setPuzzle(shuffled);
    setEmptyIndex(shuffled.indexOf(0));
    setMoves(0);
    setScore(0);
  };

  const canMoveTile = (index: number): boolean => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Check if the tile is adjacent to the empty space (including diagonals)
    const rowDiff = Math.abs(row - emptyRow);
    const colDiff = Math.abs(col - emptyCol);
    
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0);
  };

  const moveTile = (index: number) => {
    if (!canMoveTile(index) || moves > 50) return;
    
    const newPuzzle = [...puzzle];
    [newPuzzle[emptyIndex], newPuzzle[index]] = [newPuzzle[index], newPuzzle[emptyIndex]];
    setPuzzle(newPuzzle);
    setEmptyIndex(index);
    
    const newMoves = moves + 1;
    setMoves(newMoves);
    
    const newScore = Math.max(0, 1000 - (newMoves * 10));
    setScore(newScore);
    onScoreUpdate(newScore);

    // Check if puzzle is solved
    if (JSON.stringify(newPuzzle) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 0])) {
      onComplete(newScore + 500);
    }
  };

  const getTilePosition = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return { row, col };
  };

  const getMoveDirections = (index: number): string[] => {
    if (!canMoveTile(index)) return [];
    
    const { row, col } = getTilePosition(index);
    const { row: emptyRow, col: emptyCol } = getTilePosition(emptyIndex);
    
    const directions: string[] = [];
    
    if (row < emptyRow) directions.push('down');
    if (row > emptyRow) directions.push('up');
    if (col < emptyCol) directions.push('right');
    if (col > emptyCol) directions.push('left');
    
    // Check diagonals
    if (row < emptyRow && col < emptyCol) directions.push('down-right');
    if (row < emptyRow && col > emptyCol) directions.push('down-left');
    if (row > emptyRow && col < emptyCol) directions.push('up-right');
    if (row > emptyRow && col > emptyCol) directions.push('up-left');
    
    return directions;
  };

  const renderTile = (number: number, index: number) => {
    if (number === 0) {
      return (
        <View style={[gameStyles.puzzleTile, gameStyles.emptyTile]}>
          <Text style={gameStyles.emptyText}>Empty</Text>
        </View>
      );
    }

    const { row, col } = getTilePosition(index);
    const tileSize = 96; // 300 / 3 - 2px margin
    const directions = getMoveDirections(index);

    return (
      <TouchableOpacity
        key={index}
        style={[
          gameStyles.puzzleTile,
          gameStyles.imageTile,
          canMoveTile(index) && gameStyles.movableTile,
        ]}
        onPress={() => moveTile(index)}
        disabled={!canMoveTile(index)}
      >
        {/* Puzzle piece with image */}
        <Image
          source={{ uri: puzzleImage }}
          style={[
            gameStyles.tileImage,
            {
              width: 300,
              height: 300,
              left: -col * tileSize,
              top: -row * tileSize,
            },
          ]}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Direction arrows */}
        {directions.length > 0 && (
          <View style={gameStyles.directionOverlay}>
            {directions.includes('up') && (
              <View style={[gameStyles.arrow, gameStyles.arrowUp]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('down') && (
              <View style={[gameStyles.arrow, gameStyles.arrowDown]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('left') && (
              <View style={[gameStyles.arrow, gameStyles.arrowLeft]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('right') && (
              <View style={[gameStyles.arrow, gameStyles.arrowRight]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('up-left') && (
              <View style={[gameStyles.arrow, gameStyles.arrowUpLeft]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('up-right') && (
              <View style={[gameStyles.arrow, gameStyles.arrowUpRight]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('down-left') && (
              <View style={[gameStyles.arrow, gameStyles.arrowDownLeft]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
            {directions.includes('down-right') && (
              <View style={[gameStyles.arrow, gameStyles.arrowDownRight]}>
                <Move size={16} color="#27AE60" />
              </View>
            )}
          </View>
        )}
        
        {/* Tile number (for debugging) */}
        <Text style={gameStyles.tileNumber}>{number}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={gameStyles.container}>
      <View style={gameStyles.header}>
        <Text style={gameStyles.title}>Puzzle Master</Text>
        <View style={gameStyles.stats}>
          <Text style={gameStyles.statText}>Moves: {moves}</Text>
          <Text style={gameStyles.statText}>Score: {score}</Text>
        </View>
      </View>

      <View style={gameStyles.puzzleFrame}>
        <Text style={gameStyles.frameTitle}>Complete the Picture</Text>
        
        <View style={gameStyles.puzzleContainer}>
          {/* Reference image */}
          <View style={gameStyles.referenceSection}>
            <Text style={gameStyles.referenceTitle}>Target Image:</Text>
            <Image 
              source={{ uri: puzzleImage }} 
              style={gameStyles.referenceImage}
              resizeMode="cover"
            />
          </View>

          {/* Puzzle grid */}
          <View style={gameStyles.puzzleGrid}>
            {puzzle.map((number, index) => renderTile(number, index))}
          </View>
        </View>
      </View>

      <View style={gameStyles.instructionsBox}>
        <Text style={gameStyles.instructionsTitle}>How to Play:</Text>
        <Text style={gameStyles.instructionsText}>
          • Tap any tile adjacent to the empty space to move it
          • Arrows show possible move directions
          • Recreate the target image above
          • Complete with the fewest moves for maximum points!
        </Text>
      </View>

      <View style={gameStyles.controls}>
        <TouchableOpacity style={gameStyles.controlButton} onPress={initializePuzzle}>
          <Text style={gameStyles.controlButtonText}>Shuffle Puzzle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[gameStyles.controlButton, gameStyles.hintButton]}
          onPress={() => {
            // Find a movable tile and highlight it
            const movableIndex = puzzle.findIndex((_, index) => canMoveTile(index) && index !== emptyIndex);
            if (movableIndex !== -1) {
              Alert.alert('Hint', `You can move the tile at position ${movableIndex + 1}`);
            }
          }}
        >
          <Text style={gameStyles.controlButtonText}>Get Hint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Other game components remain the same (MemoryGame, MathGame, CookingGame)
const MemoryGame = ({ onComplete, onScoreUpdate }: { onComplete: (score: number) => void; onScoreUpdate: (score: number) => void }) => {
  const [cards, setCards] = useState<{ id: number; value: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const values = [1, 1, 2, 2, 3, 3, 4, 4];
    const shuffled = [...values].sort(() => Math.random() - 0.5);
    const newCards = shuffled.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false,
    }));
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
  };

  const handleCardPress = (id: number) => {
    if (flippedCards.length >= 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlippedCards;
      
      if (cards[firstId].value === cards[secondId].value) {
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[firstId].matched = true;
          updatedCards[secondId].matched = true;
          setCards(updatedCards);
          setFlippedCards([]);
          
          const newScore = score + 100;
          setScore(newScore);
          onScoreUpdate(newScore);

          if (updatedCards.every(card => card.matched)) {
            setTimeout(() => onComplete(newScore + 500), 500);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[firstId].flipped = false;
          updatedCards[secondId].flipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <View style={gameStyles.container}>
      <View style={gameStyles.header}>
        <Text style={gameStyles.title}>Memory Match</Text>
        <View style={gameStyles.stats}>
          <Text style={gameStyles.statText}>Moves: {moves}</Text>
          <Text style={gameStyles.statText}>Score: {score}</Text>
        </View>
      </View>

      <View style={gameStyles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              gameStyles.card,
              card.flipped || card.matched ? gameStyles.cardFlipped : gameStyles.cardHidden,
            ]}
            onPress={() => handleCardPress(index)}
            disabled={card.matched}
          >
            {card.flipped || card.matched ? (
              <Text style={gameStyles.cardText}>{card.value}</Text>
            ) : (
              <Text style={gameStyles.cardHiddenText}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={gameStyles.resetButton} onPress={initializeGame}>
        <Text style={gameStyles.resetButtonText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const MathGame = ({ onComplete, onScoreUpdate }: { onComplete: (score: number) => void; onScoreUpdate: (score: number) => void }) => {
  const [problem, setProblem] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    generateProblem();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateProblem = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let answer;

    switch (operator) {
      case '+': answer = num1 + num2; break;
      case '-': 
        if (num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
        break;
      case '*': 
        num1 = Math.floor(Math.random() * 5) + 1;
        num2 = Math.floor(Math.random() * 5) + 1;
        answer = num1 * num2;
        break;
      default: answer = num1 + num2;
    }

    setProblem({ num1, num2, operator, answer });
    setUserAnswer('');
  };

  const checkAnswer = () => {
    if (parseInt(userAnswer) === problem.answer) {
      const newScore = score + 100;
      setScore(newScore);
      setCorrectCount(correctCount + 1);
      onScoreUpdate(newScore);
      
      if (correctCount >= 9) {
        onComplete(newScore + 500);
      } else {
        generateProblem();
      }
    } else {
      Alert.alert('Wrong!', `The correct answer was ${problem.answer}`);
      generateProblem();
    }
  };

  return (
    <View style={gameStyles.container}>
      <View style={gameStyles.header}>
        <Text style={gameStyles.title}>Math Challenge</Text>
        <View style={gameStyles.stats}>
          <Text style={gameStyles.statText}>Time: {timeLeft}s</Text>
          <Text style={gameStyles.statText}>Score: {score}</Text>
          <Text style={gameStyles.statText}>Correct: {correctCount}/10</Text>
        </View>
      </View>

      <View style={gameStyles.mathProblem}>
        <Text style={gameStyles.problemText}>
          {problem.num1} {problem.operator} {problem.num2} = ?
        </Text>
      </View>

      <View style={gameStyles.answerContainer}>
        <TextInput
          style={gameStyles.answerInput}
          value={userAnswer}
          onChangeText={setUserAnswer}
          keyboardType="numeric"
          placeholder="Enter answer"
          onSubmitEditing={checkAnswer}
        />
        <TouchableOpacity style={gameStyles.submitButton} onPress={checkAnswer}>
          <Text style={gameStyles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <View style={gameStyles.timeBar}>
        <View style={[gameStyles.timeFill, { width: `${(timeLeft / 30) * 100}%` }]} />
      </View>
    </View>
  );
};

const CookingGame = ({ onComplete, onScoreUpdate }: { onComplete: (score: number) => void; onScoreUpdate: (score: number) => void }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showSequence, setShowSequence] = useState(true);

  const ingredientList = ['🥚', '🥛', '🍞', '🧈', '🍎', '🍌', '🥔', '🥕'];

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const newSequence = Array.from({ length: 5 }, () => 
      ingredientList[Math.floor(Math.random() * ingredientList.length)]
    );
    setSequence(newSequence);
    setUserSequence([]);
    setIngredients([...ingredientList].sort(() => Math.random() - 0.5));
    setCurrentStep(0);
    setScore(0);
    setShowSequence(true);

    setTimeout(() => {
      setShowSequence(false);
    }, 3000);
  };

  const handleIngredientPress = (ingredient: string) => {
    if (showSequence) return;

    const newUserSequence = [...userSequence, ingredient];
    setUserSequence(newUserSequence);

    if (ingredient === sequence[newUserSequence.length - 1]) {
      const newScore = score + 50;
      setScore(newScore);
      onScoreUpdate(newScore);

      if (newUserSequence.length === sequence.length) {
        onComplete(newScore + 500);
      }
    } else {
      Alert.alert('Wrong!', 'That\'s not the correct ingredient in the sequence!');
      setUserSequence([]);
    }
  };

  return (
    <View style={gameStyles.container}>
      <View style={gameStyles.header}>
        <Text style={gameStyles.title}>Cooking Memory</Text>
        <View style={gameStyles.stats}>
          <Text style={gameStyles.statText}>Score: {score}</Text>
          <Text style={gameStyles.statText}>Step: {userSequence.length}/{sequence.length}</Text>
        </View>
      </View>

      {showSequence ? (
        <View style={gameStyles.sequenceDisplay}>
          <Text style={gameStyles.sequenceTitle}>Remember the recipe:</Text>
          <View style={gameStyles.sequenceRow}>
            {sequence.map((ingredient, index) => (
              <Text key={index} style={gameStyles.sequenceIngredient}>
                {ingredient}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        <View style={gameStyles.ingredientsGrid}>
          <Text style={gameStyles.instructions}>Repeat the recipe sequence:</Text>
          <View style={gameStyles.ingredientsRow}>
            {ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                style={gameStyles.ingredientButton}
                onPress={() => handleIngredientPress(ingredient)}
              >
                <Text style={gameStyles.ingredientText}>{ingredient}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={gameStyles.userSequence}>
            <Text style={gameStyles.sequenceTitle}>Your sequence:</Text>
            <View style={gameStyles.sequenceRow}>
              {userSequence.map((ingredient, index) => (
                <Text key={index} style={gameStyles.sequenceIngredient}>
                  {ingredient}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={gameStyles.resetButton} onPress={startGame}>
        <Text style={gameStyles.resetButtonText}>Restart Game</Text>
      </TouchableOpacity>
    </View>
  );
};

// Add the missing import for TextInput
import { TextInput } from 'react-native';

// Rest of the GamesScreen component remains exactly the same as before...
export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [showLevels, setShowLevels] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    const scores = await StorageService.getGameScores();
    setGameScores(scores);
  };

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setShowLevels(true);
    setCurrentScore(0);
  };

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setShowLevels(false);
  };

  const handleGameComplete = async (bonusScore: number = 0) => {
    const game = games.find((g) => g.id === selectedGame);
    if (!game) return;

    const totalScore = currentScore + bonusScore;
    const score: GameScore = {
      gameType: game.title,
      score: totalScore,
      date: new Date().toISOString(),
      difficulty: game.difficulty,
    };

    await StorageService.saveGameScore(score);
    await loadScores();

    const badges = await StorageService.getBadges();
    if (!badges.includes('game_master') && totalScore > 500) {
      await StorageService.addBadge('game_master');
    }

    Alert.alert(
      '🎉 Level Complete!',
      `You scored ${totalScore} points!\n\nGreat job on completing ${game.title}!`,
      [
        {
          text: 'Play Again',
          onPress: () => startLevel(selectedLevel),
        },
        {
          text: 'Back to Games',
          onPress: () => {
            setSelectedGame(null);
            setShowLevels(false);
          },
        },
      ]
    );
  };

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score);
  };

  const renderGame = () => {
    const game = games.find((g) => g.id === selectedGame);
    if (!game) return null;

    switch (game.id) {
      case 'memory':
        return <MemoryGame onComplete={handleGameComplete} onScoreUpdate={handleScoreUpdate} />;
      case 'puzzle':
        return <PuzzleGame onComplete={handleGameComplete} onScoreUpdate={handleScoreUpdate} />;
      case 'math':
        return <MathGame onComplete={handleGameComplete} onScoreUpdate={handleScoreUpdate} />;
      case 'cooking':
        return <CookingGame onComplete={handleGameComplete} onScoreUpdate={handleScoreUpdate} />;
      default:
        return null;
    }
  };

  const renderLevelsModal = () => {
    const game = games.find((g) => g.id === selectedGame);
    if (!game) return null;

    const Icon = game.icon;

    return (
      <Modal
        visible={showLevels}
        animationType="slide"
        onRequestClose={() => setShowLevels(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{game.title}</Text>
            <TouchableOpacity onPress={() => setShowLevels(false)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.levelsContent}>
            <View style={[styles.gameIconLarge, { backgroundColor: `${game.color}20` }]}>
              <Icon color={game.color} size={64} />
            </View>

            <Text style={styles.levelsTitle}>Select Level</Text>
            <Text style={styles.levelsDescription}>
              Start with Level 1 and unlock more challenges as you progress!
            </Text>

            <View style={styles.levelsGrid}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    level === 1 ? styles.levelUnlocked : styles.levelLocked,
                  ]}
                  onPress={() => level === 1 && startLevel(level)}
                  disabled={level !== 1}
                >
                  {level === 1 ? (
                    <View style={styles.levelContent}>
                      <Text style={styles.levelNumber}>{level}</Text>
                      <Text style={styles.levelText}>Start</Text>
                    </View>
                  ) : (
                    <View style={styles.levelContent}>
                      <Lock color="#95A5A6" size={24} />
                      <Text style={styles.levelLockedText}>Level {level}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.gameInstructions}>
              <Text style={styles.instructionsTitle}>How to Play</Text>
              <Text style={styles.instructionsText}>
                {game.id === 'memory' && 'Match the pairs of numbers. Find all matches with the fewest moves!'}
                {game.id === 'puzzle' && 'Slide the image pieces to recreate the complete picture. Use directional arrows to move tiles!'}
                {game.id === 'math' && 'Solve math problems quickly. You have 30 seconds to get as many correct as possible!'}
                {game.id === 'cooking' && 'Memorize the ingredient sequence and repeat it in the correct order!'}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderGameModal = () => {
    if (!selectedGame || showLevels) return null;

    return (
      <Modal
        visible={!!selectedGame}
        animationType="slide"
        onRequestClose={() => setSelectedGame(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {games.find(g => g.id === selectedGame)?.title} - Level {selectedLevel}
            </Text>
            <TouchableOpacity onPress={() => setSelectedGame(null)}>
              <X color="#2C3E50" size={24} />
            </TouchableOpacity>
          </View>
          {renderGame()}
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

      {renderLevelsModal()}
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

const gameStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  // Puzzle Master specific styles
  puzzleFrame: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  frameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 15,
  },
  puzzleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  referenceSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  referenceImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  puzzleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    height: 300,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 3,
    borderColor: '#2C3E50',
  },
  puzzleTile: {
    width: 96,
    height: 96,
    margin: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyTile: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#BDC3C7',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '600',
  },
  imageTile: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  movableTile: {
    borderColor: '#27AE60',
    borderWidth: 2,
  },
  tileImage: {
    position: 'absolute',
  },
  tileNumber: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
    color: 'rgba(44, 62, 80, 0.6)',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 2,
    borderRadius: 4,
  },
  directionOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  arrowUp: { top: 2 },
  arrowDown: { bottom: 2 },
  arrowLeft: { left: 2 },
  arrowRight: { right: 2 },
  arrowUpLeft: { top: 2, left: 2 },
  arrowUpRight: { top: 2, right: 2 },
  arrowDownLeft: { bottom: 2, left: 2 },
  arrowDownRight: { bottom: 2, right: 2 },
  instructionsBox: {
    backgroundColor: '#E8F4F8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  hintButton: {
    backgroundColor: '#F39C12',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Other game styles remain the same
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  cardHidden: {
    backgroundColor: '#4A90E2',
  },
  cardFlipped: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cardHiddenText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  mathProblem: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  problemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  answerContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  answerInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeBar: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timeFill: {
    height: '100%',
    backgroundColor: '#E74C3C',
    borderRadius: 5,
  },
  sequenceDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sequenceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  sequenceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sequenceIngredient: {
    fontSize: 32,
    marginHorizontal: 5,
  },
  ingredientsGrid: {
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
    textAlign: 'center',
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  ingredientButton: {
    width: 70,
    height: 70,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F39C12',
  },
  ingredientText: {
    fontSize: 32,
  },
  userSequence: {
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

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
  levelsContent: {
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
  levelsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  levelsDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  levelButton: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUnlocked: {
    backgroundColor: '#4A90E2',
  },
  levelLocked: {
    backgroundColor: '#E9ECEF',
  },
  levelContent: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  levelLockedText: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
    fontWeight: '600',
  },
  gameInstructions: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
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
});