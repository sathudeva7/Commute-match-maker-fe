import { useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, List, Divider } from 'react-native-paper';

const MODES = [
  { key: 'bus', label: 'Bus', icon: 'bus' },
  { key: 'tube', label: 'Tube', icon: 'subway-variant' },
  { key: 'overground', label: 'Overground', icon: 'train' },
];

export default function SelectJourneyScreen() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Grand Central Terminal', 'Penn Station']);
  const [stations, setStations] = useState<any[]>([]);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [stationLoading, setStationLoading] = useState(false);
  const navigation = useNavigation();


  // Fetch routes from TFL API
  const fetchRoutes = async (selectedMode: string) => {
    setLoading(true);
    let url = '';
    if (selectedMode === 'bus') url = 'https://api.tfl.gov.uk/Line/Mode/bus';
    else if (selectedMode === 'tube') url = 'https://api.tfl.gov.uk/Line/Mode/tube';
    else if (selectedMode === 'overground') url = 'https://api.tfl.gov.uk/Line/Mode/overground';
    try {
      const res = await fetch(url);
      const data = await res.json();
      setRoutes(data);
    } catch {
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations when a route is selected
  useEffect(() => {
    const fetchStations = async () => {
      if (!selectedRoute) return;
      setStationLoading(true);
      try {
        // Use 'inbound' or 'outbound' as needed
        const res = await fetch(`https://api.tfl.gov.uk/Line/${selectedRoute.id}/Route/Sequence/inbound`);
        const data = await res.json();
        // The stops are in data.stations or data.stopPointSequences[0].stopPoint
        const stops = data.stopPointSequences?.[0]?.stopPoint || [];
        setStations(stops);
      } catch {
        setStations([]);
      } finally {
        setStationLoading(false);
      }
    };
    if (selectedRoute) fetchStations();
  }, [selectedRoute]);

  // Step 1: Select Mode
  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Transport</Text>
        <View style={{ marginVertical: 16 }}>
          {MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              style={styles.modeCard}
              onPress={async () => {
                setMode(m.key);
                setStep(2);
                setRoutes([]);
                setSelectedRoute(null);
                setRouteSearch('');
                await fetchRoutes(m.key);
              }}
            >
              <List.Icon icon={m.icon} />
              <Text style={styles.modeLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button mode="contained" style={styles.button} disabled>
          Next
        </Button>
      </View>
    );
  }

  // Step 2: Select Route
  if (step === 2) {
    // Filter routes by search
    const filteredRoutes = routes.filter(
      r =>
        (r.id && r.id.toLowerCase().includes(routeSearch.toLowerCase())) ||
        (r.name && r.name.toLowerCase().includes(routeSearch.toLowerCase()))
    );
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Route</Text>
        <TextInput
          mode="outlined"
          placeholder={`Enter ${mode} number or name`}
          value={routeSearch}
          onChangeText={setRouteSearch}
          style={styles.input}
        />
        <Text style={styles.subHeader}>Available Routes</Text>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredRoutes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.routeCard}
                onPress={() => {
                  setSelectedRoute(item);
                  setStep(3);
                }}
              >
                <View style={styles.routeBadge}>
                  <Text style={styles.routeNumber}>{item.id}</Text>
                </View>
                <Text style={styles.routeName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
        <Button mode="contained" style={styles.button} disabled>
          Next
        </Button>
      </View>
    );
  }

  // Step 3: Select From/To
  if (step === 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Select Your Route</Text>
        {stationLoading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : (
          <>
            <Text style={styles.label}>From</Text>
            <TextInput
              mode="outlined"
              placeholder="Select starting station"
              value={fromStation}
              onChangeText={setFromStation}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="menu-down"
                  onPress={() => {
                    // Show a modal or dropdown with station options
                  }}
                />
              }
            />
            <FlatList
              data={stations.filter(s => s.name.toLowerCase().includes(fromStation.toLowerCase()))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setFromStation(item.name)}>
                  <Text style={{ padding: 8 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 120, backgroundColor: '#fff', borderRadius: 8 }}
            />

            <Text style={styles.label}>To</Text>
            <TextInput
              mode="outlined"
              placeholder="Select destination station"
              value={toStation}
              onChangeText={setToStation}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="menu-down"
                  onPress={() => {
                    // Show a modal or dropdown with station options
                  }}
                />
              }
            />
            <FlatList
              data={stations.filter(s => s.name.toLowerCase().includes(toStation.toLowerCase()))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setToStation(item.name)}>
                  <Text style={{ padding: 8 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 120, backgroundColor: '#fff', borderRadius: 8 }}
            />
          </>
        )}
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            // Use fromStation and toStation for journey planning
            navigation.navigate('matching')
          }}
          disabled={!fromStation || !toStation}
        >
          Next
        </Button>
      </View>
    );
  }

  // Step 4: Select From/To
  return ( 
    <View style={styles.container}>
      <Text style={styles.header}>Select Your Route</Text>
      <View style={styles.routeStep}>
        <View style={styles.dot} />
        <TextInput
          mode="outlined"
          placeholder="Enter starting point"
          value={from}
          onChangeText={setFrom}
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>
      <View style={styles.routeStep}>
        <View style={[styles.dot, { backgroundColor: '#BFD8F7' }]} />
        <TextInput
          mode="outlined"
          placeholder="Enter destination"
          value={to}
          onChangeText={setTo}
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
        />
      </View>
      <Text style={styles.subHeader}>Recent Searches</Text>
      {recentSearches.map((search, idx) => (
        <View key={idx} style={styles.recentRow}>
          <List.Icon icon="history" />
          <Text>{search}</Text>
        </View>
      ))}
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => {
          // Here you would call the TFL API with mode, selectedRoute, from, to
        }}
        disabled={!from || !to}
      >
        Add Journey
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 24,
    paddingTop: 48,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 18,
  },
  subHeader: {
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 15,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 1,
  },
  modeLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  button: {
    marginTop: 32,
    borderRadius: 14,
    backgroundColor: '#4F8EF7',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 8,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  routeBadge: {
    backgroundColor: '#BFD8F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  routeNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1976D2',
  },
  routeName: {
    fontSize: 16,
    color: '#222',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
    marginRight: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 15,
  },
}); 