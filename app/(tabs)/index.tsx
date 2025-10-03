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
import { Zap, Activity, Gamepad2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { StorageService, UserProfile, ScanProgress } from '../../utils/storage';
import Chatbot from '../../components/Chatbot';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ quickScans: 0, fullScans: 0 });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await StorageService.getUserProfile();
    const progress = await StorageService.getScanProgress();
    setProfile(userProfile);
    setScanProgress(progress);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{profile?.username || 'User'}</Text>
          </View>
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
        </View>

        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => router.push('/(tabs)/emergency' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIcon}>
            <AlertCircle color="#fff" size={24} />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
            <Text style={styles.emergencySubtitle}>Quick access to help</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Zap color="#4A90E2" size={24} />
            </View>
            <Text style={styles.statNumber}>{scanProgress.quickScans}</Text>
            <Text style={styles.statLabel}>Quick Scans</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Activity color="#27AE60" size={24} />
            </View>
            <Text style={styles.statNumber}>{scanProgress.fullScans}</Text>
            <Text style={styles.statLabel}>Full Scans</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={[styles.actionCard, styles.primaryCard]}
            onPress={() => router.push('/(tabs)/quick-scan' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Zap color="#fff" size={32} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Quick Scan</Text>
              <Text style={styles.cardDescription}>
                Fast 5-minute cognitive assessment
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.secondaryCard]}
            onPress={() => router.push('/(tabs)/full-scan' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Activity color="#fff" size={32} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Full Scan</Text>
              <Text style={styles.cardDescription}>
                Comprehensive cognitive evaluation
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.tertiaryCard]}
            onPress={() => router.push('/(tabs)/games' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Gamepad2 color="#fff" size={32} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Games Hub</Text>
              <Text style={styles.cardDescription}>
                Fun brain training activities
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Daily Tip</Text>
          <Text style={styles.tipText}>
            Regular mental exercises can help maintain cognitive function. Try playing a game today!
          </Text>
        </View>
      </ScrollView>

      <Chatbot />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
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
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: '#4A90E2',
  },
  secondaryCard: {
    backgroundColor: '#27AE60',
  },
  tertiaryCard: {
    backgroundColor: '#9B59B6',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 100,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F7DC6F',
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
