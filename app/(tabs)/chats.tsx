import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const conversations = [
  { id: '1', name: 'Ethan Carter', lastMessage: 'See you at 8:30?', avatar: require('../../assets/images/profile-image.png') },
  { id: '2', name: 'Olivia Bennett', lastMessage: 'Route looks good!', avatar: require('../../assets/images/profile-image.png') },
  { id: '3', name: 'Noah Thompson', lastMessage: 'Let’s sync tomorrow', avatar: require('../../assets/images/profile-image.png') },
];

export default function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#E3F0FF' },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  lastMessage: { fontSize: 13, color: '#666', marginTop: 3 },
  separator: { height: 1, backgroundColor: '#F0F0F0' },
});
