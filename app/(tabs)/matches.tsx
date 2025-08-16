import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const matches = [
  {
    id: '1',
    name: 'Ethan Carter',
    profession: 'Software Engineer',
    avatar: require('../../assets/images/profile-image.png'), // Replace with your image
    interests: ['Tech', 'Reading', 'Hiking'],
  },
  {
    id: '2',
    name: 'Olivia Bennett',
    profession: 'Marketing Manager',
    avatar: require('../../assets/images/profile-image.png'), // Replace with your image
    interests: ['Travel', 'Photography', 'Yoga'],
  },
  {
    id: '3',
    name: 'Noah Thompson',
    profession: 'Data Scientist',
    avatar: require('../../assets/images/profile-image.png'), // Replace with your image
    interests: ['Music', 'Gaming', 'Cooking'],
  },
];

const MatchCard = ({ match }: { match: typeof matches[0] }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={match.avatar} style={styles.avatar} />
      <View style={{ marginLeft: 14 }}>
        <Text style={styles.name}>{match.name}</Text>
        <Text style={styles.profession}>{match.profession}</Text>
        <View style={styles.interestsRow}>
          {match.interests.map((interest) => (
            <View key={interest} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialCommunityIcons name="account-plus-outline" size={18} color="#2196F3" />
        <Text style={styles.actionText}>Connect</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="eye-outline" size={18} color="#888" />
        <Text style={[styles.actionText, { color: '#888' }]}>View Profile</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MatchesScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={24} color="#222" />
        <Text style={styles.header}>Matches</Text>
        <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </ScrollView>
      {/* Bottom Tab Bar (for context) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
          <Ionicons name="people-outline" size={24} color="#2196F3" />
          <Text style={[styles.tabText, { color: '#2196F3' }]}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#888" />
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F5D0C5' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  profession: { fontSize: 14, color: '#888', marginBottom: 8 },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  interestBadge: {
    backgroundColor: '#E3F0FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  interestText: { color: '#2196F3', fontSize: 13 },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  actionText: { marginLeft: 6, fontSize: 15, color: '#2196F3', fontWeight: '500' },
  divider: { width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 8 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: { alignItems: 'center', flex: 1, paddingTop: 6 },
  tabItemActive: { borderTopWidth: 3, borderTopColor: '#2196F3', backgroundColor: '#F5F7FA' },
  tabText: { fontSize: 12, color: '#888', marginTop: 2 },
});