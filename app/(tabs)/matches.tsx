import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { apiClient, chatService } from '@/services';
import { API_CONFIG } from '@/constants/ApiConfig';
import ChatList from '@/components/matching/ChatList';

interface SemanticMatch {
  user: {
    _id: string;
    user: string;
    matching_preferences: {
      profession: string;
      about_me: string;
      interests: string[];
      languages: string[];
      preferred_commute_time: {
        start: string;
        end: string;
      };
      preferred_commute_days: string[];
      preferred_commute_times: string[];
    };
    createdAt: string;
    updatedAt: string;
  };
  hybridScore: number;
  semSim: number;
  timeRatio: number;
  dayJac: number;
  langJac: number;
  intsJac: number;
  profMatch: number;
}

interface SemanticMatchesResponse {
  success: boolean;
  data: {
    matches: SemanticMatch[];
    count: number;
    query: any;
  };
  message: string;
}

const MatchCard = ({ match, router, onStartChat }: { match: SemanticMatch; router: any; onStartChat: (userId: string) => void }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image 
        source={require('../../assets/images/profile-image.png')} 
        style={styles.avatar} 
      />
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={styles.name}>User {match.user._id.slice(-6)}</Text>
        <Text style={styles.profession}>{match.user.matching_preferences.profession || 'Not specified'}</Text>
        <Text style={styles.aboutMe} numberOfLines={2}>
          {match.user.matching_preferences.about_me || 'No description available'}
        </Text>
        
        {/* Interests */}
        {match.user.matching_preferences.interests && match.user.matching_preferences.interests.length > 0 && (
          <View style={styles.interestsRow}>
            {match.user.matching_preferences.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestBadge}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            {match.user.matching_preferences.interests.length > 3 && (
              <Text style={styles.moreInterests}>+{match.user.matching_preferences.interests.length - 3} more</Text>
            )}
          </View>
        )}

        {/* Languages */}
        {match.user.matching_preferences.languages && match.user.matching_preferences.languages.length > 0 && (
          <View style={styles.languagesRow}>
            <Text style={styles.languagesLabel}>Languages: </Text>
            <Text style={styles.languagesText}>
              {match.user.matching_preferences.languages.join(', ')}
            </Text>
          </View>
        )}

        {/* Commute Preferences */}
        <View style={styles.commuteInfo}>
          <Text style={styles.commuteLabel}>Commute: </Text>
          <Text style={styles.commuteText}>
            {match.user.matching_preferences.preferred_commute_time.start} - {match.user.matching_preferences.preferred_commute_time.end}
          </Text>
          <Text style={styles.commuteDays}>
            {match.user.matching_preferences.preferred_commute_days.join(', ')}
          </Text>
        </View>

        {/* Match Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Match Score: </Text>
          <Text style={[styles.scoreValue, { color: match.hybridScore > 0.7 ? '#4CAF50' : match.hybridScore > 0.4 ? '#FF9800' : '#F44336' }]}>
            {(match.hybridScore * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
    
    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionButton}>
        <MaterialCommunityIcons name="account-plus-outline" size={18} color="#2196F3" />
        <Text style={styles.actionText}>Connect</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => router.push(`/profile?profileId=${match.user._id}`)}
      >
        <Ionicons name="eye-outline" size={18} color="#888" />
        <Text style={[styles.actionText, { color: '#888' }]}>View Profile</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => onStartChat(match.user.user)}
      >
        <Ionicons name="chatbubble-outline" size={18} color="#4CAF50" />
        <Text style={[styles.actionText, { color: '#4CAF50' }]}>Chat</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MatchesScreen() {
  const router = useRouter();
  const { departureTime } = useLocalSearchParams<{ departureTime?: string }>();
  const [matches, setMatches] = useState<SemanticMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChats, setShowChats] = useState(false);

  const fetchMatches = async () => {
    try {
      setError(null);
      const requestBody: any = {
        "weights": {
          "time": 0.1,
          "days": 0.3,
          "lang": 0.10,
          "ints": 0.15,
          "sem": 0.20,
          "prof": 0.05
        }
      };
      
      // Add departure time if available
      if (departureTime) {
        requestBody.departure_time = departureTime;
      }
      console.log("requestBody",requestBody)
      
      const response = await apiClient.post<SemanticMatchesResponse>(
        `${API_CONFIG.ENDPOINTS.MATCHING.SEMANTIC_MATCHES}?limit=50&minScore=0.1`,
        requestBody
      );
      if (response.success) {
        console.log("asdd",response.result.matches)
        setMatches(response.result.matches);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Error loading matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleStartChat = async (userId: string) => {
    try {
      // Create a direct chat with the matched user
      const response = await chatService.createDirectChat(userId);
      if (response.success) {
        // Navigate to the chat
        router.push(`/chat/${response.result._id}` as any);
      } else {
        // If chat already exists, try to find it
        const chatsResponse = await chatService.getChats(1, 50);
        if (chatsResponse.success) {
          const existingChat = chatsResponse.result.chats.find(chat => 
            chat.chatType === 'direct' && 
            chat.participants.includes(userId)
          );
          if (existingChat) {
            router.push(`/chat/${existingChat._id}` as any);
          } else {
            console.error('Failed to create or find chat');
          }
        }
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Finding your matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMatches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={24} color="#222" />
        <Text style={styles.header}>Matches</Text>
        <TouchableOpacity 
          style={styles.chatToggleButton}
          onPress={() => setShowChats(!showChats)}
        >
          <Ionicons 
            name={showChats ? "people-outline" : "chatbubbles-outline"} 
            size={24} 
            color="#2196F3" 
          />
        </TouchableOpacity>
      </View>
      
      {showChats ? (
        <>
          {/* Show Chat List */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>Your Conversations</Text>
          </View>
          <ChatList showCreateChat={true} />
        </>
      ) : (
        <>
          {/* Show Matches */}
          {/* Match Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {matches.length} potential matches found
            </Text>
          </View>

          <ScrollView 
            contentContainerStyle={{ paddingVertical: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {matches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No matches found yet</Text>
                <Text style={styles.emptySubtext}>
                  Complete your profile to find better matches
                </Text>
              </View>
            ) : (
              matches.map((match) => (
                <MatchCard key={match.user._id} match={match} router={router} onStartChat={handleStartChat} />
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  countContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
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
  aboutMe: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 8,
    lineHeight: 18,
  },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 8 },
  interestBadge: {
    backgroundColor: '#E3F0FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  interestText: { color: '#2196F3', fontSize: 12 },
  moreInterests: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  languagesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  languagesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  languagesText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  commuteInfo: {
    marginBottom: 8,
  },
  commuteLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  commuteText: {
    fontSize: 12,
    color: '#666',
  },
  commuteDays: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
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
  chatToggleButton: {
    padding: 8,
  },
});