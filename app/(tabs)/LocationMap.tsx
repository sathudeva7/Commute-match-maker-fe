import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Button, Text } from 'react-native';
import * as Location from 'expo-location';
import MapSection from '../../components/matching/MapSection';
import RouteHeader, { TflPlace } from '../../components/matching/RouteHeader';
import TravelOptionCard from '../../components/matching/TravelOptionCard';

interface LocationMapProps {}

export default function LocationMap(props: LocationMapProps) {
  const [location, setLocation] = useState<any>(null);
  const [startPlace, setStartPlace] = useState<TflPlace | null>(null);
  const [endPlace, setEndPlace] = useState<TflPlace | null>(null);
  const [startNearbyStops, setStartNearbyStops] = useState<any[]>([]);
  const [startArrivals, setStartArrivals] = useState<any[]>([]);
  const [endArrivals, setEndArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return alert('Location permission denied');
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Fetch travel options when both start and end are set
  useEffect(() => {
    const fetchTravelOptions = async () => {
      if (!startPlace || !endPlace) return;
      setLoading(true);
      try {
        // 1. Get start stop details (for coordinates)
        // 2. Fetch nearby bus stops for start
        const stopRes = await fetch(`https://api.tfl.gov.uk/StopPoint/${startPlace.id}`);
        const stopData = await stopRes.json();
        let lat = stopData.lat;
        let lon = stopData.lon;
        if (!lat || !lon) {
          // fallback: use current location
          lat = location?.coords?.latitude;
          lon = location?.coords?.longitude;
        }
        // 3. Fetch nearby bus stops
        const nearbyRes = await fetch(
          `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lon}&stopTypes=NaptanPublicBusCoachTram&radius=300`
        );
        const nearbyStops = (await nearbyRes.json()).stopPoints || [];
        setStartNearbyStops(nearbyStops);
        // 4. Fetch arrivals for first nearby stop (start)
        let startStopId = nearbyStops.length > 0 ? nearbyStops[0].id : startPlace.id;
        const startArrivalsRes = await fetch(`https://api.tfl.gov.uk/StopPoint/${startStopId}/Arrivals`);
        const startArrivalsData = await startArrivalsRes.json();
        console.log(startArrivalsData);
	   setStartArrivals(startArrivalsData);
        // 5. Fetch arrivals for end stop
        const endArrivalsRes = await fetch(`https://api.tfl.gov.uk/StopPoint/${endPlace.id}/Arrivals`);
        const endArrivalsData = await endArrivalsRes.json();
        setEndArrivals(endArrivalsData);
      } catch (e) {
        setStartNearbyStops([]);
        setStartArrivals([]);
        setEndArrivals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTravelOptions();
  }, [startPlace, endPlace]);

  // Fetch journey options from TFL Journey Planner API
  const fetchJourneyOptions = async (from: string, to: string) => {
    setJourneyLoading(true);
    try {
      const res = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${to}`);
      const data = await res.json();
      setJourneys(data.journeys || []);
    } catch (e) {
      setJourneys([]);
    } finally {
      setJourneyLoading(false);
    }
  };

  // Fetch journey options when both start and end are set
  useEffect(() => {
    if (startPlace && endPlace) {
      fetchJourneyOptions(startPlace.id, endPlace.id);
    }
  }, [startPlace, endPlace]);

  // Helper to group arrivals by stop and line
  function groupArrivals(arrivals: any[]) {
    // Group by stopPointName
    const grouped: Record<string, { stopName: string; lines: string[]; times: number[] }> = {};
    arrivals?.forEach((a: any) => {
      const stop = a.stationName || a.towards || a.destinationName || a.stopPointName;
      if (!grouped[stop]) grouped[stop] = { stopName: stop, lines: [], times: [] };
      if (!grouped[stop].lines.includes(a.lineName)) grouped[stop].lines.push(a.lineName);
      // Calculate minutes until arrival
      const eta = Math.max(0, Math.round((new Date(a.expectedArrival).getTime() - Date.now()) / 60000));
      grouped[stop].times.push(eta);
    });
    // Convert to array and sort times
    return Object.values(grouped).map(g => ({
      ...g,
      times: g.times.sort((a, b) => a - b),
    }));
  }

  // Helper to display travel options
  const renderTravelOptions = () => {
    if (loading) return <Text>Loading travel options...</Text>;
    if (!startArrivals.length && !endArrivals.length) return <Text>No travel options found.</Text>;
    // Group arrivals for start and end
    const startGroups = groupArrivals(startArrivals);
    const endGroups = groupArrivals(endArrivals);
    return (
      <View>
        <Text style={{ fontWeight: 'bold', marginTop: 12 }}>From Start:</Text>
        {startGroups.map((group, idx) => (
          <TravelOptionCard
            key={group.stopName + idx}
            icon="🚌"
            lines={group.lines}
            fare="£1.75"
            duration={group.times.length > 0 ? `${group.times[0] + 10} min` : ''}
            stopName={group.stopName}
            times={group.times}
          />
        ))}
        <Text style={{ fontWeight: 'bold', marginTop: 12 }}>At Destination:</Text>
        {endGroups.map((group, idx) => (
          <TravelOptionCard
            key={group.stopName + idx}
            icon="🚌"
            lines={group.lines}
            fare="£1.75"
            duration={group.times.length > 0 ? `${group.times[0] + 10} min` : ''}
            stopName={group.stopName}
            times={group.times}
          />
        ))}
      </View>
    );
  };

  // Helper to display journey options
  const renderJourneyOptions = () => {
    if (journeyLoading) return <Text>Loading journey options...</Text>;
    if (!journeys.length) return <Text>No journey options found.</Text>;
    return (
      <View>
        <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Journey Options:</Text>
        {journeys.map((journey, idx) => (
          <View key={idx} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Duration: {journey.duration} min</Text>
            {journey.fare && journey.fare.totalCost && (
              <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Fare: £{(journey.fare.totalCost / 100).toFixed(2)}</Text>
            )}
            {journey.legs.map((leg: any, lidx: number) => (
              <View key={lidx} style={{ marginTop: 6, marginBottom: 6 }}>
                <Text style={{ fontWeight: 'bold' }}>{leg.mode.name.toUpperCase()} {leg.routeOptions && leg.routeOptions[0]?.name ? `(${leg.routeOptions[0].name})` : ''}</Text>
                {leg.instruction && <Text>{leg.instruction.summary}</Text>}
                {leg.departurePoint && <Text>From: {leg.departurePoint.commonName}</Text>}
                {leg.arrivalPoint && <Text>To: {leg.arrivalPoint.commonName}</Text>}
                {leg.duration && <Text>Leg Duration: {leg.duration} min</Text>}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <MapSection location={location} mapRef={mapRef} />
      <View style={styles.routeBox}>
        <RouteHeader onStartSelected={setStartPlace} onEndSelected={setEndPlace} />
        {renderJourneyOptions()}
        <View style={styles.buttonGroup}>
          <Button title="Start Matching" onPress={() => {}} />
          <Button title="Stop Matching" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F0F5' },
  routeBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: -10,
  },
  buttonGroup: {
    marginTop: 16,
    gap: 10,
  },
});
