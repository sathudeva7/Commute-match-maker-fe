import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TravelOption({ icon, title, subtitle }) {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.routeInfo}>{title}</Text>
        {subtitle && <Text style={styles.subtext}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6, gap: 8 },
  icon: { fontSize: 22, width: 32, textAlign: 'center' },
  routeInfo: { fontSize: 15, fontWeight: '500', color: '#333' },
  subtext: { fontSize: 13, color: '#777' },
});
