import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const TFL_SEARCH_URL = 'https://api.tfl.gov.uk/StopPoint/Search';

export interface TflPlace {
  id: string;
  name: string;
}

interface RouteHeaderProps {
  onStartSelected?: (place: TflPlace) => void;
  onEndSelected?: (place: TflPlace) => void;
}

export default function RouteHeader({ onStartSelected, onEndSelected }: RouteHeaderProps) {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startResults, setStartResults] = useState<TflPlace[]>([]);
  const [endResults, setEndResults] = useState<TflPlace[]>([]);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);

  const searchTfl = async (
    query: string,
    setResults: React.Dispatch<React.SetStateAction<TflPlace[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${TFL_SEARCH_URL}/${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data?.matches || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChange = (text: string) => {
    setStartQuery(text);
    searchTfl(text, setStartResults, setLoadingStart);
  };
  const handleEndChange = (text: string) => {
    setEndQuery(text);
    searchTfl(text, setEndResults, setLoadingEnd);
  };

  const selectStart = (item: TflPlace) => {
    setStartQuery(item.name);
    setStartResults([]);
    if (onStartSelected) onStartSelected(item);
  };
  const selectEnd = (item: TflPlace) => {
    setEndQuery(item.name);
    setEndResults([]);
    if (onEndSelected) onEndSelected(item);
  };

  return (
    <View>
      <Text style={styles.sectionHeader}>Start</Text>
      <TextInput
        style={styles.input}
        placeholder="Search start location"
        value={startQuery}
        onChangeText={handleStartChange}
      />
      {loadingStart && <ActivityIndicator size="small" color="#2196F3" />}
      {startResults.length > 0 && (
        <FlatList
          data={startResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectStart(item)} style={styles.suggestionItem}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionList}
        />
      )}

      <Text style={styles.sectionHeader}>End</Text>
      <TextInput
        style={styles.input}
        placeholder="Search end location"
        value={endQuery}
        onChangeText={handleEndChange}
      />
      {loadingEnd && <ActivityIndicator size="small" color="#2196F3" />}
      {endResults.length > 0 && (
        <FlatList
          data={endResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectEnd(item)} style={styles.suggestionItem}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontWeight: 'bold', fontSize: 14, marginTop: 8, color: '#333' },
  input: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  suggestionList: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 6,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
