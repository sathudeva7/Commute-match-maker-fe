import { authService } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const profile = {
  name: 'Ethan Carter',
  profession: 'Software Engineer',
  age: 28,
  location: 'San Francisco',
  avatar: require('../../assets/images/profile-image.png'), // Replace with your image
  about:
    "I'm a software engineer passionate about technology and innovation. I enjoy exploring new ideas and solving complex problems. In my free time, I love hiking, reading, and playing guitar.",
  interests: [
    'Hiking', 'Reading', 'Guitar', 'Technology', 'Innovation', 'Coding', 'Travel', 'Photography'
  ],
  languages: ['English', 'Spanish'],
};

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authService.getProfile();
      setUser(user);
    } 
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Ionicons name="arrow-back" size={24} color="#222" />
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
        <Text style={styles.location}>{profile.age}, {profile.location}</Text>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{profile.about}</Text>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.badgeContainer}>
          {profile.interests.map((interest) => (
            <View key={interest} style={styles.badge}>
              <Text style={styles.badgeText}>{interest}</Text>
            </View>
          ))}
        </View>

        {/* Languages */}
        <Text style={styles.sectionTitle}>Languages</Text>
        <View style={styles.badgeContainer}>
          {profile.languages.map((lang) => (
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
});