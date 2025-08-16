import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Switch, Button, TextInput } from 'react-native-paper';

export default function AvailabilityScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [busRoute, setBusRoute] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Availability</Text>
        <Text style={styles.title}>Set your availability</Text>
        <Text style={styles.subtitle}>
          Update your status to start connecting with fellow commuters.
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>I'm Available</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            color="#4F8EF7"
          />
        </View>
        <Text style={styles.helper}>Make yourself visible for matching</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Bus Route</Text>
        <TextInput
          mode="outlined"
          placeholder="Select your bus route"
          value={busRoute}
          onChangeText={setBusRoute}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#4F8EF7"
        />

        <Text style={styles.label}>Current Location</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter or detect your location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#4F8EF7"
          left={<TextInput.Icon icon="map-marker-outline" />}
        />

        <Text style={styles.label}>Estimated Travel Duration</Text>
        <TextInput
          mode="outlined"
          placeholder="e.g., 30 minutes"
          value={duration}
          onChangeText={setDuration}
          style={styles.input}
          outlineColor="#E5E7EB"
          activeOutlineColor="#4F8EF7"
          left={<TextInput.Icon icon="clock-outline" />}
        />

        <Button
          mode="contained"
          style={styles.button}
          contentStyle={{ height: 50 }}
          labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
          onPress={() => {/* handle update status */}}
        >
          Update Status
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#222',
  },
  subtitle: {
    color: '#7A7A7A',
    fontSize: 15,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 4,
    color: '#222',
  },
  helper: {
    color: '#7A7A7A',
    fontSize: 13,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#BFD8F7',
  },
}); 