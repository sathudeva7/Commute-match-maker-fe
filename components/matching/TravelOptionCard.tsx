import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TravelOptionCardProps {
  icon: string;
  lines: string[];
  fare: string;
  duration: string;
  stopName: string;
  times: number[];
}

export default function TravelOptionCard({ icon, lines, fare, duration, stopName, times }: TravelOptionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.linesRow}>
          {lines.map(line => (
            <Text key={line} style={styles.lineBadge}>{line}</Text>
          ))}
        </View>
        <Text style={styles.fare}>{fare}</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>
      <Text style={styles.eta}>
        {`in ${times.join(', ')} min from ${stopName}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { fontSize: 22, marginRight: 8 },
  linesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  lineBadge: {
    backgroundColor: '#F3F4F6',
    color: '#222',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    fontWeight: 'bold',
    fontSize: 15,
  },
  fare: { color: '#2196F3', fontWeight: 'bold', marginLeft: 8 },
  duration: { color: '#888', fontWeight: 'bold', marginLeft: 8 },
  eta: { color: '#888', fontSize: 13, marginTop: 2 },
}); 