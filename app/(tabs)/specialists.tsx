import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { MapPin, Phone, Clock, Star, ListFilter as Filter, Calendar } from 'lucide-react-native';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  phone: string;
  address: string;
  availability: string;
}

const specialists: Specialist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Neurologist',
    rating: 4.8,
    distance: '2.3 mi',
    phone: '555-0101',
    address: '123 Medical Plaza, Suite 200',
    availability: 'Available Today',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Psychiatrist',
    rating: 4.9,
    distance: '3.1 mi',
    phone: '555-0102',
    address: '456 Health Center Blvd',
    availability: 'Next Available: Tomorrow',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Geriatric Specialist',
    rating: 4.7,
    distance: '4.5 mi',
    phone: '555-0103',
    address: '789 Care Drive, Building A',
    availability: 'Available Today',
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Neuropsychologist',
    rating: 4.9,
    distance: '5.2 mi',
    phone: '555-0104',
    address: '321 Brain Health Institute',
    availability: 'Next Available: Mon',
  },
  {
    id: '5',
    name: 'Dr. Lisa Martinez',
    specialty: 'Memory Care Specialist',
    rating: 4.8,
    distance: '6.0 mi',
    phone: '555-0105',
    address: '654 Memory Lane Medical',
    availability: 'Available Today',
  },
];

const specialties = ['All', 'Neurologist', 'Psychiatrist', 'Geriatric', 'Neuropsychologist', 'Memory Care'];

export default function SpecialistsScreen() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

  const filteredSpecialists = specialists
    .filter((s) => selectedSpecialty === 'All' || s.specialty.includes(selectedSpecialty))
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else {
        return b.rating - a.rating;
      }
    });

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Call Specialist',
      `Would you like to call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert('Error', 'Unable to make call');
            });
          },
        },
      ]
    );
  };

  const handleBooking = (specialist: Specialist) => {
    Alert.alert(
      'Book Appointment',
      `Book an appointment with ${specialist.name}?\n\n${specialist.availability}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Appointment request sent! The office will call you to confirm.');
          },
        },
      ]
    );
  };

  const handleViewMap = () => {
    Alert.alert(
      'Map View',
      'Opening map with nearby specialists...',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Specialists</Text>
        <Text style={styles.headerSubtitle}>Connect with healthcare professionals</Text>

        <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
          <MapPin color="#4A90E2" size={20} />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyFilters}>
          {specialties.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.specialtyButton,
                selectedSpecialty === specialty && styles.specialtyButtonActive,
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text
                style={[
                  styles.specialtyButtonText,
                  selectedSpecialty === specialty && styles.specialtyButtonTextActive,
                ]}
              >
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <Filter color="#7F8C8D" size={20} />
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'distance' ? 'rating' : 'distance')}
          >
            <Text style={styles.sortText}>
              Sort by: {sortBy === 'distance' ? 'Distance' : 'Rating'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {filteredSpecialists.map((specialist) => (
          <View key={specialist.id} style={styles.specialistCard}>
            <View style={styles.specialistHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {specialist.name.split(' ').map((n) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>{specialist.name}</Text>
                <Text style={styles.specialistSpecialty}>{specialist.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Star color="#F39C12" size={16} fill="#F39C12" />
                  <Text style={styles.ratingText}>{specialist.rating}</Text>
                  <View style={styles.distanceBadge}>
                    <MapPin color="#4A90E2" size={14} />
                    <Text style={styles.distanceText}>{specialist.distance}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <MapPin color="#7F8C8D" size={16} />
                <Text style={styles.detailText}>{specialist.address}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock color="#7F8C8D" size={16} />
                <Text style={styles.detailText}>{specialist.availability}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(specialist.phone, specialist.name)}
              >
                <Phone color="#4A90E2" size={20} />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBooking(specialist)}
              >
                <Calendar color="#fff" size={20} />
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  filtersSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  specialtyFilters: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  specialtyButtonActive: {
    backgroundColor: '#4A90E2',
  },
  specialtyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  specialtyButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  sortButton: {
    flex: 1,
  },
  sortText: {
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
  specialistCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specialistHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  specialistSpecialty: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  detailsSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
