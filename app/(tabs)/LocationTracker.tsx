import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function LocationTracker() {
  const [location, setLocation] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [nextBuses, setNextBuses] = useState([]);
  const mapRef = useRef(null);

  // Get permissions and initial location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      handleNewLocation(currentLocation);
    })();
  }, []);

  const fetchNearbyBusStops = async (latitude, longitude) => {
    const res = await fetch(
      `https://api.tfl.gov.uk/StopPoint?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&radius=300`
    );
    const data = await res.json();
    return data.stopPoints;
  };

  const fetchBusArrivals = async (stopId) => {
    const res = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`);
    return await res.json();
  };

  const handleNewLocation = async (newLocation) => {
    setLocation(newLocation);
    const { latitude, longitude } = newLocation.coords;

    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    const stops = await fetchNearbyBusStops(latitude, longitude);
    if (stops.length > 0) {
      const arrivals = await fetchBusArrivals(stops[0].id);
      const sorted = arrivals
        .sort((a, b) => new Date(a.expectedArrival) - new Date(b.expectedArrival))
        .slice(0, 5)
        .map(bus => ({
          line: bus.lineName,
          destination: bus.destinationName,
          time: new Date(bus.expectedArrival).toLocaleTimeString(),
        }));
      setNextBuses(sorted);
    }
  };

  const startTracking = async () => {
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 20,
      },
      handleNewLocation
    );
    setSubscription(sub);
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={
          location && {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You"
          />
        )}
      </MapView>

      <View style={styles.routeBox}>
        <Text style={styles.sectionHeader}>Start</Text>
        <Text style={styles.locationText}>📍 Current Location</Text>
        <Text style={styles.subtext}>Lodge Road, Sutton, United Kingdom</Text>

        <Text style={styles.sectionHeader}>End</Text>
        <Text style={styles.locationText}>🏛️ Sutton Central Library</Text>

        <Text style={styles.routeTitle}>A short trip...</Text>

        {/* Walk Option */}
        <View style={styles.optionRow}>
          <Text style={styles.icon}>🚶</Text>
          <Text style={styles.routeInfo}>Walk · 34 cal · 9 min</Text>
        </View>

        {/* Bus Options */}
        {nextBuses.length > 0 ? (
          <>
            <View style={styles.optionRow}>
              <Text style={styles.icon}>🚌</Text>
              <View>
                <Text style={styles.routeInfo}>
                  {nextBuses.slice(0, 3).map(b => b.line).join(' / ')} · £1.75 · ~15 min
                </Text>
                <Text style={styles.subtext}>
                  {nextBuses.slice(0, 3).map(b => b.time).join(', ')} from nearby stop
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.optionRow}>
            <Text style={styles.icon}>🚌</Text>
            <Text style={styles.routeInfo}>Loading bus info...</Text>
          </View>
        )}

        {/* Cycle Option */}
        <View style={styles.optionRow}>
          <Text style={styles.icon}>🚴</Text>
          <Text style={styles.routeInfo}>My Cycle · 17 cal · 5 min</Text>
        </View>

        {/* Forest Option */}
        <View style={styles.optionRow}>
          <Text style={styles.icon}>🌲</Text>
          <Text style={styles.routeInfo}>Forest · £2.20 · 5 min</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <Button title="Start Matching" onPress={startTracking} />
          <Button title="Stop Matching" onPress={stopTracking} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0F5' },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
  },
  routeBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -10,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    marginTop: 2,
  },
  subtext: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginVertical: 10,
    color: '#444',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    gap: 8,
  },
  icon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  routeInfo: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  buttonGroup: {
    marginTop: 16,
    gap: 10,
  },
});
