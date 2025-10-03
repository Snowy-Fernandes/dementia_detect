import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Phone, User, Heart, MapPin, CircleAlert as AlertCircle, FileText } from 'lucide-react-native';
import { StorageService, UserProfile } from '../../utils/storage';

export default function EmergencyScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await StorageService.getUserProfile();
    setProfile(userProfile);
  };

  const handleEmergencyCall = (number: string, name: string) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert('Error', 'Unable to make call');
            });
          },
        },
      ]
    );
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
      name: profile?.emergencyContact?.name || 'Emergency Contact',
      number: profile?.emergencyContact?.phone || 'Not Set',
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
                <Text style={styles.infoValue}>{profile?.username || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{profile?.age || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Emergency Contact:</Text>
                <Text style={styles.infoValue}>
                  {profile?.emergencyContact?.name || 'Not set'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Health Notes:</Text>
                <Text style={styles.infoValue}>
                  {profile?.healthInfo || 'No health information provided'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Location', 'Sharing your current location...')}
          >
            <MapPin color="#4A90E2" size={24} />
            <Text style={styles.actionButtonText}>Share My Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Medical ID', 'Displaying your medical ID...')}
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
});
