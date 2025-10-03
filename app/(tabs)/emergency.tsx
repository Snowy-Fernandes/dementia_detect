import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Modal,
  Animated,
} from 'react-native';
import { Phone, User, Heart, MapPin, CircleAlert as AlertCircle, FileText, X, PhoneCall } from 'lucide-react-native';
import { StorageService, UserProfile } from '../../utils/storage';

export default function EmergencyScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCallingModal, setShowCallingModal] = useState(false);
  const [currentCall, setCurrentCall] = useState<{name: string, number: string} | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (showCallingModal && !isConnecting) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [showCallingModal, isConnecting]);

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isConnecting]);

  const loadProfile = async () => {
    // Simulating loaded profile with Dad as emergency contact
    const userProfile: UserProfile = {
      id: '1',
      username: 'User',
      email: 'user@example.com',
      age: 25,
      emergencyContact: {
        name: 'Dad',
        phone: '+91 9922818382',
      },
      healthInfo: 'No known allergies',
    };
    setProfile(userProfile);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyCall = (number: string, name: string) => {
    setCurrentCall({ name, number });
    setShowCallingModal(true);
    setIsConnecting(true);
    setCallDuration(0);

    // Simulate connection after 2 seconds
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
  };

  const endCall = () => {
    setShowCallingModal(false);
    setCurrentCall(null);
    setCallDuration(0);
    setIsConnecting(false);
    
    Alert.alert(
      'Call Ended',
      `Call duration: ${formatCallDuration(callDuration)}`,
      [{ text: 'OK' }]
    );
  };

  const handleShareLocation = () => {
    setShowLocationModal(true);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setShowLocationModal(false);
    }, 3000);
  };

  const emergencyContacts = [
    {
      id: '911',
      name: 'Emergency Services',
      number: '911',
      icon: AlertCircle,
      color: '#E74C3C',
      description: 'Police, Fire, Medical',
    },
    {
      id: 'contact',
      name: profile?.emergencyContact?.name || 'Dad',
      number: profile?.emergencyContact?.phone || '+1 (555) 123-4567',
      icon: User,
      color: '#4A90E2',
      description: 'Your primary emergency contact',
    },
    {
      id: 'poison',
      name: 'Poison Control',
      number: '1-800-222-1222',
      icon: Heart,
      color: '#27AE60',
      description: '24/7 poison help',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertCircle color="#E74C3C" size={48} />
        <Text style={styles.headerTitle}>Emergency Assistance</Text>
        <Text style={styles.headerSubtitle}>Quick access to help when you need it</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningCard}>
          <AlertCircle color="#E74C3C" size={24} />
          <Text style={styles.warningText}>
            If you're experiencing a medical emergency, call 911 immediately
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { borderLeftColor: contact.color }]}
                onPress={() => handleEmergencyCall(contact.number, contact.name)}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${contact.color}20` }]}>
                  <Icon color={contact.color} size={32} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactDescription}>{contact.description}</Text>
                  <View style={styles.phoneContainer}>
                    <Phone color="#7F8C8D" size={16} />
                    <Text style={styles.contactNumber}>{contact.number}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <FileText color="#4A90E2" size={24} />
              <Text style={styles.infoHeaderText}>Your Medical Info</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{profile?.username || 'Snowyfernandes'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{profile?.age || '21'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Emergency Contact:</Text>
                <Text style={styles.infoValue}>
                  {profile?.emergencyContact?.name || 'Dad'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Health Notes:</Text>
                <Text style={styles.infoValue}>
                  {profile?.healthInfo || 'No known allergies'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareLocation}
          >
            <MapPin color="#4A90E2" size={24} />
            <Text style={styles.actionButtonText}>Share My Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Medical ID', 'Displaying your medical ID card with all critical health information.')}
          >
            <FileText color="#27AE60" size={24} />
            <Text style={styles.actionButtonText}>Show Medical ID</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Safety Tip</Text>
          <Text style={styles.tipText}>
            Make sure your emergency contact information is always up to date. You can update it in your profile settings.
          </Text>
        </View>
      </ScrollView>

      {/* Calling Modal */}
      <Modal
        visible={showCallingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={endCall}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.callingCard}>
            <TouchableOpacity style={styles.closeButton} onPress={endCall}>
              <X color="#fff" size={24} />
            </TouchableOpacity>

            <Animated.View style={[
              styles.callingIconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <PhoneCall color="#fff" size={48} />
            </Animated.View>

            <Text style={styles.callingStatus}>
              {isConnecting ? 'Connecting...' : 'Connected'}
            </Text>

            <Text style={styles.callingName}>{currentCall?.name}</Text>
            <Text style={styles.callingNumber}>{currentCall?.number}</Text>

            {!isConnecting && (
              <Text style={styles.callDuration}>{formatCallDuration(callDuration)}</Text>
            )}

            <View style={styles.callingActions}>
              <TouchableOpacity style={styles.muteButton}>
                <Text style={styles.muteButtonText}>🔇 Mute</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.speakerButton}>
                <Text style={styles.speakerButtonText}>🔊 Speaker</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
              <Phone color="#fff" size={28} />
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Location Shared Modal */}
      <Modal
        visible={showLocationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationCard}>
            <View style={styles.locationIconContainer}>
              <MapPin color="#4A90E2" size={48} />
            </View>
            <Text style={styles.locationTitle}>Location Shared!</Text>
            <Text style={styles.locationMessage}>
              Your current location has been shared with your emergency contacts
            </Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationDetailText}>📍 Shared with: {profile?.emergencyContact?.name || 'Dad'}</Text>
              <Text style={styles.locationDetailText}>📱 Help message: "I need assistance at my current location"</Text>
              <Text style={styles.locationDetailText}>✅ Location updates: Active</Text>
            </View>
            <TouchableOpacity 
              style={styles.locationOkButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.locationOkText}>Got it</Text>
            </TouchableOpacity>
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
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E74C3C',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#C62828',
    fontWeight: '600',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactNumber: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    gap: 12,
  },
  infoHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  infoContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    flex: 1,
    fontSize: 15,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  infoValue: {
    flex: 2,
    fontSize: 15,
    color: '#2C3E50',
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
    gap: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  callingCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  callingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  callingStatus: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    opacity: 0.9,
  },
  callingName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  callingNumber: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 24,
  },
  callDuration: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 32,
  },
  callingActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  muteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  muteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  speakerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  speakerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endCallButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  endCallText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  locationMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  locationDetails: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationDetailText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationOkButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  locationOkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});