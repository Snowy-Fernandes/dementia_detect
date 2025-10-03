import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MapPin, Clock, Star, ListFilter as Filter, Calendar, Info, X } from 'lucide-react-native';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  phone: string;
  address: string;
  availability: string;
  experience: string;
  education: string;
  languages: string;
}

const specialists: Specialist[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'Neurologist',
    rating: 4.8,
    distance: '2.3 km',
    phone: '9876543210',
    address: 'Shop No. 12, Medical Plaza, Andheri West, Mumbai',
    availability: 'Available Today',
    experience: '15 years',
    education: 'MBBS, MD (Neurology), AIIMS Delhi',
    languages: 'Hindi, English, Marathi',
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Psychiatrist',
    rating: 4.9,
    distance: '3.1 km',
    phone: '9876543211',
    address: 'Health Center, Bandra West, Mumbai',
    availability: 'Next Available: Tomorrow',
    experience: '18 years',
    education: 'MBBS, MD (Psychiatry), KEM Hospital',
    languages: 'Hindi, English, Gujarati',
  },
  {
    id: '3',
    name: 'Dr. Sunita Patel',
    specialty: 'Geriatric Specialist',
    rating: 4.7,
    distance: '4.5 km',
    phone: '9876543212',
    address: 'Care Clinic, Juhu, Mumbai',
    availability: 'Available Today',
    experience: '12 years',
    education: 'MBBS, MD (Geriatrics), Mumbai University',
    languages: 'Hindi, English, Marathi, Gujarati',
  },
  {
    id: '4',
    name: 'Dr. Arjun Mehta',
    specialty: 'Neuropsychologist',
    rating: 4.9,
    distance: '5.2 km',
    phone: '9876543213',
    address: 'Brain Health Institute, Powai, Mumbai',
    availability: 'Next Available: Mon',
    experience: '20 years',
    education: 'MBBS, MD, DM (Neuropsychology), PGI Chandigarh',
    languages: 'Hindi, English',
  },
  {
    id: '5',
    name: 'Dr. Kavita Desai',
    specialty: 'Memory Care Specialist',
    rating: 4.8,
    distance: '6.0 km',
    phone: '9876543214',
    address: 'Memory Care Center, Goregaon East, Mumbai',
    availability: 'Available Today',
    experience: '14 years',
    education: 'MBBS, MD (Neurology), Specialty in Memory Disorders',
    languages: 'Hindi, English, Marathi',
  },
];

const specialties = ['All', 'Neurologist', 'Psychiatrist', 'Geriatric', 'Neuropsychologist', 'Memory Care'];

export default function SpecialistsScreen() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const filteredSpecialists = specialists
    .filter((s) => selectedSpecialty === 'All' || s.specialty.includes(selectedSpecialty))
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else {
        return b.rating - a.rating;
      }
    });

  const handleBooking = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setAppointmentDate('');
    setAppointmentTime('');
    setBookingModalVisible(true);
  };

  const handleViewDetails = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setDetailsModalVisible(true);
  };

  const confirmBooking = () => {
    if (!appointmentDate || !appointmentTime) {
      Alert.alert('Error', 'Please select date and time for your appointment');
      return;
    }

    setBookingModalVisible(false);
    Alert.alert(
      'Appointment Booked!',
      `Your appointment with ${selectedSpecialist?.name} is confirmed for ${appointmentDate} at ${appointmentTime}.\n\nYou will receive a confirmation call shortly.`,
      [{ text: 'OK' }]
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Specialists</Text>
        <Text style={styles.headerSubtitle}>Connect with healthcare professionals</Text>
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
                style={styles.detailsButton}
                onPress={() => handleViewDetails(specialist)}
              >
                <Info color="#4A90E2" size={20} />
                <Text style={styles.detailsButtonText}>Details</Text>
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

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <X color="#7F8C8D" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.doctorNameModal}>{selectedSpecialist?.name}</Text>
            <Text style={styles.specialtyModal}>{selectedSpecialist?.specialty}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Date (DD/MM/YYYY)</Text>
              <TextInput
                style={styles.input}
                placeholder={`e.g., ${getTodayDate()}`}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Time (IST)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10:00 AM"
                value={appointmentTime}
                onChangeText={setAppointmentTime}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setBookingModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmBooking}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doctor Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <X color="#7F8C8D" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarPlaceholderLarge}>
              <Text style={styles.avatarTextLarge}>
                {selectedSpecialist?.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>

            <Text style={styles.doctorNameModal}>{selectedSpecialist?.name}</Text>
            <Text style={styles.specialtyModal}>{selectedSpecialist?.specialty}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>{selectedSpecialist?.experience}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Education</Text>
                <Text style={styles.detailValue}>{selectedSpecialist?.education}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Languages</Text>
                <Text style={styles.detailValue}>{selectedSpecialist?.languages}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{selectedSpecialist?.phone}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{selectedSpecialist?.address}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Rating</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star color="#F39C12" size={16} fill="#F39C12" />
                  <Text style={styles.detailValue}>{selectedSpecialist?.rating}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailsButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  doctorNameModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  specialtyModal: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  avatarPlaceholderLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsGrid: {
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    color: '#2C3E50',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});