import { authService, redirectToLogin } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Helper to calculate age from date_of_birth (YYYY-MM-DD)
const calculateAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return undefined as unknown as number | undefined;
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return undefined as unknown as number | undefined;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Mock user data - in a real app, this would come from an API
const mockUsers = {
  '1': {
    id: '1',
    name: 'Ethan Carter',
    profession: 'Software Engineer',
    age: 28,
    location: 'San Francisco',
    avatar: require('../../assets/images/profile-image.png'),
    about:
      "I'm a software engineer passionate about technology and innovation. I enjoy exploring new ideas and solving complex problems. In my free time, I love hiking, reading, and playing guitar.",
    interests: [
      'Hiking', 'Reading', 'Guitar', 'Technology', 'Innovation', 'Coding', 'Travel', 'Photography'
    ],
    languages: ['English', 'Spanish'],
  },
  '2': {
    id: '2',
    name: 'Olivia Bennett',
    profession: 'Marketing Manager',
    age: 26,
    location: 'New York',
    avatar: require('../../assets/images/profile-image.png'),
    about:
      "Marketing professional with a passion for creative campaigns and brand storytelling. I love traveling, photography, and finding new coffee shops around the city.",
    interests: [
      'Travel', 'Photography', 'Yoga', 'Coffee', 'Branding', 'Social Media', 'Art', 'Fashion'
    ],
    languages: ['English', 'French'],
  },
  '3': {
    id: '3',
    name: 'Noah Thompson',
    profession: 'Data Scientist',
    age: 30,
    location: 'Seattle',
    avatar: require('../../assets/images/profile-image.png'),
    about:
      "Data scientist who loves turning complex data into meaningful insights. When I'm not analyzing data, I enjoy music, gaming, and experimenting with new recipes in the kitchen.",
    interests: [
      'Music', 'Gaming', 'Cooking', 'Data Analysis', 'Machine Learning', 'Piano', 'Board Games', 'Hiking'
    ],
    languages: ['English', 'German'],
  },
};

export default function ProfileScreen() {
  const { profileId } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (profileId) {
          // Load specific user profile
          const userProfile = mockUsers[profileId as keyof typeof mockUsers];
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Handle profile not found
            console.error('Profile not found');
          }
        } else {
          // Load current user's profile
          const user = await authService.getProfile();
          // Map API response to UI-friendly shape used below
          const mappedProfile = {
            avatar: user.profile_image_url
              ? { uri: user.profile_image_url }
              : require('../../assets/images/profile-image.png'),
            name: user.full_name,
            profession: (user as any).matching_preferences?.profession || (user as any).matching_preferences?.matching_preferences?.profession || '',
            age: calculateAge(user.date_of_birth),
            location: '',
            about: user.bio || (user as any).matching_preferences?.about_me || (user as any).matching_preferences?.matching_preferences?.about_me || '',
            interests: (user as any).matching_preferences?.interests || (user as any).matching_preferences?.matching_preferences?.interests || [],
            languages: (user as any).matching_preferences?.languages || (user as any).matching_preferences?.matching_preferences?.languages || [],
          } as any;
          setProfile(mappedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await authService.logout();
      console.log('Logout successful, tokens cleared');
      
      // Verify tokens are cleared
      const isStillAuthenticated = await authService.isAuthenticated();
      console.log('Authentication status after logout:', isStillAuthenticated);
      
      // Use navigation service instead of direct router navigation
      redirectToLogin();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleEditProfile = () => {
    // Navigate to onboarding screen for editing profile
    router.push('/(tabs)/onboarding');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Loading...</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Profile Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Profile</Text>
          <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
        </View>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Image source={profile.avatar} style={styles.avatar} />
        </View>
        {/* Name, Profession, Location */}
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.profession}>{profile.profession}</Text>
        <Text style={styles.location}>
          {profile.age ? `${profile.age}` : ''}{profile.age && profile.location ? ', ' : ''}{profile.location || ''}
        </Text>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{profile.about}</Text>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.badgeContainer}>
          {profile.interests?.map((interest: string) => (
            <View key={interest} style={styles.badge}>
              <Text style={styles.badgeText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Languages */}
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.badgeContainer}>
          {profile.languages?.map((lang: string) => (
            <View key={lang} style={styles.badge}>
              <Text style={styles.badgeText}>{lang}</Text>
            </View>
          ))}
        </View>

        {/* Start Chat Button */}
        <TouchableOpacity style={styles.chatButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#222" style={{ marginRight: 8 }} />
          <Text style={styles.chatButtonText}>Start Chat</Text>
        </TouchableOpacity>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color="#222" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 12, backgroundColor: '#F5D0C5' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#222', textAlign: 'center', marginTop: 8 },
  profession: { fontSize: 16, color: '#7A7A7A', textAlign: 'center', marginTop: 2 },
  location: { fontSize: 15, color: '#A0A4A8', textAlign: 'center', marginBottom: 18, marginTop: 2 },
  sectionTitle: { fontWeight: 'bold', fontSize: 18, marginTop: 18, marginBottom: 8, marginLeft: 18 },
  aboutText: { color: '#222', fontSize: 15, marginHorizontal: 18, marginBottom: 8, lineHeight: 22 },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 18,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: { color: '#222', fontSize: 15 },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CFE3F5',
    borderRadius: 28,
    paddingVertical: 16,
    justifyContent: 'center',
    margin: 18,
    marginBottom: 24,
  },
  chatButtonText: { color: '#222', fontWeight: 'bold', fontSize: 17 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8DDF9',
    borderRadius: 28,
    paddingVertical: 16,
    justifyContent: 'center',
    margin: 18,
    marginBottom: 24,
  },
  editButtonText: { color: '#222', fontWeight: 'bold', fontSize: 17 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderRadius: 28,
    paddingVertical: 16,
    justifyContent: 'center',
    margin: 18,
    marginBottom: 24,
  },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});