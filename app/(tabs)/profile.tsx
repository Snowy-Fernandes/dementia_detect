import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Download,
  Settings,
  LogOut,
  TrendingUp,
  Activity,
} from 'lucide-react-native';
import { StorageService, UserProfile, ScanProgress, GameScore } from '../../utils/storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ quickScans: 0, fullScans: 0 });
  const [gameScores, setGameScores] = useState<GameScore[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await StorageService.getUserProfile();
    const progress = await StorageService.getScanProgress();
    const scores = await StorageService.getGameScores();
    const userBadges = await StorageService.getBadges();

    setProfile(userProfile);
    setScanProgress(progress);
    setGameScores(scores);
    setBadges(userBadges);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDownloadReport = () => {
    Alert.alert(
      'Download Report',
      'Your comprehensive cognitive health report is being prepared. This feature simulates report generation.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await StorageService.saveCurrentUser('');
            router.replace('/' as any);
          },
        },
      ]
    );
  };

  const totalGamesPlayed = gameScores.length;
  const averageGameScore = totalGamesPlayed > 0
    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / totalGamesPlayed)
    : 0;

  const badgeInfo = [
    { id: 'first_scan', name: 'First Scan', emoji: '🎯', description: 'Completed your first scan' },
    { id: 'full_scan_complete', name: 'Full Assessment', emoji: '🏆', description: 'Completed a full scan' },
    { id: 'game_master', name: 'Game Master', emoji: '🎮', description: 'Scored over 500 in a game' },
    { id: 'week_streak', name: '7 Day Streak', emoji: '🔥', description: 'Maintained 7 day streak' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: profile?.avatarColor || '#4A90E2' },
            ]}
          >
            <Text style={styles.avatarText}>
              {profile?.username ? getInitials(profile.username) : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{profile?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <User color="#7F8C8D" size={20} />
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{profile?.age || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar color="#7F8C8D" size={20} />
            <Text style={styles.infoLabel}>Language</Text>
            <Text style={styles.infoValue}>{profile?.language || 'English'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone color="#7F8C8D" size={20} />
            <Text style={styles.infoLabel}>Emergency Contact</Text>
            <Text style={styles.infoValue}>
              {profile?.emergencyContact?.name || 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Activity color="#4A90E2" size={24} />
              </View>
              <Text style={styles.statNumber}>{scanProgress.quickScans}</Text>
              <Text style={styles.statLabel}>Quick Scans</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp color="#27AE60" size={24} />
              </View>
              <Text style={styles.statNumber}>{scanProgress.fullScans}</Text>
              <Text style={styles.statLabel}>Full Scans</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Award color="#F39C12" size={24} />
              </View>
              <Text style={styles.statNumber}>{totalGamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp color="#9B59B6" size={24} />
              </View>
              <Text style={styles.statNumber}>{averageGameScore}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgesContainer}>
            {badgeInfo.map((badge) => {
              const earned = badges.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !earned && styles.badgeCardLocked]}
                >
                  <Text style={styles.badgeEmoji}>{earned ? badge.emoji : '🔒'}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadReport}
          >
            <Download color="#4A90E2" size={24} />
            <Text style={styles.actionButtonText}>Download Health Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Settings color="#7F8C8D" size={24} />
            <Text style={styles.actionButtonText}>Settings & Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <LogOut color="#E74C3C" size={24} />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
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
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
    color: '#7F8C8D',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#FFEBEE',
    marginBottom: 40,
  },
  logoutText: {
    color: '#E74C3C',
  },
});
