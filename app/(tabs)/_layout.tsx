import { Tabs } from 'expo-router';
import { Home, BookOpen, AlertCircle, Gamepad2, Users } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: {
          height: 80,
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ focused }) => (
            <View style={styles.emergencyButton}>
              <AlertCircle size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ size, color }) => <Gamepad2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      
      {/* Hidden routes */}
      <Tabs.Screen
        name="quick-scan"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="full-scan"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="specialists"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="improvement"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
});