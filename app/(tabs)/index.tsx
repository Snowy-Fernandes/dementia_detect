// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Activity, MapPin, Calendar, X } from 'lucide-react-native';
import { StorageService, UserProfile } from '../../utils/storage';
import Chatbot from '../../components/Chatbot';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  experience: string;
  latitude: number;
  longitude: number;
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Neurologist',
    location: 'Downtown Medical Center',
    rating: 4.8,
    experience: '15 years',
    latitude: 37.78,
    longitude: -122.41,
  },
  {
    id: '2',
    name: 'Dr. James Chen',
    specialty: 'Cognitive Therapist',
    location: 'Brain Health Clinic',
    rating: 4.9,
    experience: '12 years',
    latitude: 37.79,
    longitude: -122.40,
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Psychiatrist',
    location: 'Mental Wellness Center',
    rating: 4.7,
    experience: '10 years',
    latitude: 37.77,
    longitude: -122.42,
  },
];

// Basic FAQ answers you'd like the chatbot to be able to handle.
// If your Chatbot component supports a `faqs` prop, it can use these responses.
// If your Chatbot is implemented differently, copy these Q/A pairs into its knowledge base.
const faqAnswers = [
  {
    q: 'what do i do if i have dementia',
    a:
      "If you suspect dementia, the first step is to see a healthcare professional (GP, neurologist or memory clinic) for an evaluation. They can assess symptoms, run tests, and recommend care, medication, therapies, and support services. Also: simplify daily routines, maintain structure, get social support, and keep active mentally and physically.",
  },
  {
    q: 'how will i know if i have dementia or not',
    a:
      "Dementia is diagnosed by doctors using medical history, cognitive tests, physical exams, and sometimes brain scans or blood tests. Signs include persistent memory loss that affects daily life, trouble with language or problem solving, and changes in behaviour. A clinical assessment is needed — one-off forgetfulness alone doesn't mean dementia.",
  },
  {
    q: 'i forgot to bath yesterday does that mean i have dementia',
    a:
      "Missing one bath is not a sign of dementia by itself — people forget things for many reasons (busy day, tiredness, mood). Dementia is about repeated, progressive changes that affect daily independence. If this happens often or other everyday skills are affected, discuss it with a clinician.",
  },
  {
    q: 'i forgot what i ate in lunch today does that mean i have dementia',
    a:
      "Forgetting small recent details (like what you ate) occasionally is normal, especially when distracted. Dementia-related memory problems are more consistent and impact day-to-day functioning (e.g., repeating questions, getting lost, forgetting important events). If you're worried, monitor patterns and consult a doctor.",
  },
  {
    q: 'i forgot my friends birthday does that mean i have dementia',
    a:
      "Forgetting a friend's birthday occasionally doesn't mean dementia. People forget dates for many reasons. Dementia typically causes more persistent memory loss and decline in other mental abilities. If memory lapses become frequent or cause functional problems, see a healthcare professional.",
  },
];

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await StorageService.getUserProfile();
    setProfile(userProfile);
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{profile?.username || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.avatar,
              { backgroundColor: profile?.avatarColor || '#4A90E2' },
            ]}
            onPress={() => router.push('/(tabs)/profile' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {profile?.username ? getInitials(profile.username) : 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scan Options */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={[styles.scanCard, styles.quickScanCard]}
            onPress={() => router.push('/(tabs)/quick-scan' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.scanIconContainer}>
              <Zap color="#4A90E2" size={28} />
            </View>
            <View style={styles.scanContent}>
              <Text style={styles.scanTitle}>Quick Scan</Text>
              <Text style={styles.scanDescription}>5-minute assessment</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanCard, styles.fullScanCard]}
            onPress={() => router.push('/(tabs)/full-scan' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.scanIconContainer}>
              <Activity color="#27AE60" size={28} />
            </View>
            <View style={styles.scanContent}>
              <Text style={styles.scanTitle}>Full Scan</Text>
              <Text style={styles.scanDescription}>Complete evaluation</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Interactive Map */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Find Specialists Near You</Text>
          <View style={styles.mapContainer}>
            {/* Use the Google maps placeholder image for an 'interactive map' look */}
            <Image
              source={{ uri: 'https://staticmapmaker.com/img/google-placeholder.png' }}
              style={styles.mapImage}
              resizeMode="cover"
            />

            {/* Doctor Pins */}
            <View style={styles.doctorPinsContainer}>
              {mockDoctors.map((doctor, index) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.doctorPin,
                    {
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`,
                    },
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pinDot} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Improvement Plan Card */}
        <View style={styles.improvementSection}>
          <Text style={styles.sectionTitle}>Your Progress Plan</Text>
          <View style={styles.improvementCard}>
            <View style={styles.improvementHeader}>
              <Text style={styles.improvementTitle}>Cognitive Enhancement</Text>
              <Text style={styles.improvementWeek}>Week 3 of 12</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '25%' }]} />
              </View>
              <Text style={styles.progressText}>25% Complete</Text>
            </View>

            <View style={styles.milestones}>
              <View style={styles.milestone}>
                <View style={[styles.milestoneIcon, styles.milestoneComplete]}>
                  <Text style={styles.milestoneCheck}>✓</Text>
                </View>
                <Text style={styles.milestoneText}>Initial Assessment</Text>
              </View>
              <View style={styles.milestone}>
                <View style={[styles.milestoneIcon, styles.milestoneActive]}>
                  <Text style={styles.milestoneNumber}>2</Text>
                </View>
                <Text style={styles.milestoneText}>Memory Training</Text>
              </View>
              <View style={styles.milestone}>
                <View style={styles.milestoneIcon}>
                  <Text style={styles.milestoneNumber}>3</Text>
                </View>
                <Text style={styles.milestoneText}>Focus Exercises</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewPlanButton} activeOpacity={0.8}>
              <Text style={styles.viewPlanText}>View Full Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Doctor Profile Modal */}
      <Modal
        visible={selectedDoctor !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDoctor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedDoctor(null)}
            >
              <X color="#7F8C8D" size={24} />
            </TouchableOpacity>

            {selectedDoctor && (
              <>
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>
                      {getInitials(selectedDoctor.name)}
                    </Text>
                  </View>
                  <Text style={styles.doctorName}>{selectedDoctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{selectedDoctor.specialty}</Text>
                </View>

                <View style={styles.doctorDetails}>
                  <View style={styles.detailRow}>
                    <MapPin color="#7F8C8D" size={20} />
                    <Text style={styles.detailText}>{selectedDoctor.location}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rating:</Text>
                    <Text style={styles.detailValue}>⭐ {selectedDoctor.rating}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Experience:</Text>
                    <Text style={styles.detailValue}>{selectedDoctor.experience}</Text>
                  </View>
                </View>

                {/* replaced Book Appointment with See All -> opens specialist screen */}
                <TouchableOpacity
                  style={styles.bookButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedDoctor(null);
                    // navigate to specialist screen — ensure this route exists in your app
                    router.push('/(tabs)/specialists' as any);
                  }}
                >
                  <Text style={styles.bookButtonText}>See All</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Pass the FAQ answers to Chatbot so the bot can respond to the dementia Q/A */}
      <Chatbot faqs={faqAnswers} />
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
    color: '#95A5A6',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#fff',
  },
  scanSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  scanCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickScanCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  fullScanCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanContent: {
    gap: 4,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  scanDescription: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  mapSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  mapContainer: {
    height: 280,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  mapImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
  },
  mapText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  doctorPinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  doctorPin: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  improvementSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  improvementCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  improvementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  improvementWeek: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8F4F8',
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
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  milestone: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneComplete: {
    backgroundColor: '#27AE60',
  },
  milestoneActive: {
    backgroundColor: '#4A90E2',
  },
  milestoneCheck: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  milestoneNumber: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  viewPlanButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewPlanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  doctorHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  doctorDetails: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#2C3E50',
  },
  detailLabel: {
    fontSize: 15,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
