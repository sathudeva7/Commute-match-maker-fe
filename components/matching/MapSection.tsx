import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Dimensions, StyleSheet } from 'react-native';

export default function MapSection({ location, mapRef }) {
  if (!location) return null;

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      region={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="You"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
  },
});
