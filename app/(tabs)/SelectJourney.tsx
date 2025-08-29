import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Button, TextInput, List, Divider } from 'react-native-paper';
import { apiClient } from '../../services';

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
  const [departureDate, setDepartureDate] = useState(new Date());
  const [dateStep, setDateStep] = useState(1); // 1: Quick times, 2: Date selection, 3: Time selection
  const router = useRouter();


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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
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
      </ScrollView>
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
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Select Route</Text>
          <TextInput
            mode="outlined"
            placeholder={`Enter ${mode} number or name`}
            value={routeSearch}
            onChangeText={setRouteSearch}
            style={styles.input}
          />
          <Text style={styles.subHeader}>Available Routes</Text>
        </View>
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
            contentContainerStyle={styles.flatListContent}
            ListFooterComponent={() => (
              <Button mode="contained" style={styles.button} disabled>
                Next
              </Button>
            )}
          />
        )}
      </View>
    );
  }

  // Step 3: Select Date and Time
  if (step === 3) {
    
    const quickTimes = [
      { label: 'in 30 min', minutes: 30 },
      { label: 'in 60 min', minutes: 60 },
      { label: 'in 90 min', minutes: 90 },
      { label: 'Tonight', time: '20:00' }
    ];

    const getQuickTimeDate = (minutes: number) => {
      const date = new Date();
      date.setMinutes(date.getMinutes() + minutes);
      return date;
    };

    const getTonightDate = () => {
      const date = new Date();
      date.setHours(20, 0, 0, 0);
      return date;
    };

    const handleQuickTimeSelect = (quickTime: any) => {
      if (quickTime.minutes) {
        setDepartureDate(getQuickTimeDate(quickTime.minutes));
      } else if (quickTime.time === 'Tonight') {
        setDepartureDate(getTonightDate());
      }
      setDateStep(3); // Go to time selection
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const formatDate = (date: Date) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
    };

    const generateDateOptions = () => {
      const options = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        options.push(date);
      }
      return options;
    };

    const generateTimeOptions = () => {
      const options = [];
      const startHour = 6; // 6 AM
      const endHour = 23; // 11 PM
      
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = new Date();
          time.setHours(hour, minute, 0, 0);
          options.push(time);
        }
      }
      return options;
    };

    const dateOptions = generateDateOptions();
    const timeOptions = generateTimeOptions();

    // Quick Time Selection Step
    if (dateStep === 1) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>When do you want to leave?</Text>
          <Text style={styles.subHeader}>Quick options</Text>
          
          <View style={styles.optionsContainer}>
            {quickTimes.map((quickTime, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionCard}
                onPress={() => handleQuickTimeSelect(quickTime)}
              >
                <Text style={styles.optionText}>{quickTime.label}</Text>
                <List.Icon icon="arrow-right" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setDateStep(2)}
          >
            <Text style={styles.customButtonText}>Choose custom time</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // Date Selection Step
    if (dateStep === 2) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Select Date</Text>
          
          <View style={styles.optionsContainer}>
            {dateOptions.map((date, index) => {
              const isSelected = date.toDateString() === departureDate.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionCard,
                    isSelected && styles.selectedOptionCard
                  ]}
                  onPress={() => {
                    const newDate = new Date(departureDate);
                    newDate.setDate(date.getDate());
                    newDate.setMonth(date.getMonth());
                    newDate.setFullYear(date.getFullYear());
                    setDepartureDate(newDate);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {formatDate(date)}
                  </Text>
                  {isSelected && <List.Icon icon="check" color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setDateStep(1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setDateStep(3)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    // Time Selection Step
    if (dateStep === 3) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Select Time</Text>
          <Text style={styles.subHeader}>For {formatDate(departureDate)}</Text>
          
          <ScrollView style={styles.timeOptionsScrollView} nestedScrollEnabled={true}>
            <View style={styles.optionsContainer}>
              {timeOptions.map((time, index) => {
                const isSelected = 
                  time.getHours() === departureDate.getHours() &&
                  time.getMinutes() === departureDate.getMinutes();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionCard,
                      isSelected && styles.selectedOptionCard
                    ]}
                    onPress={() => {
                      const newDate = new Date(departureDate);
                      newDate.setHours(time.getHours());
                      newDate.setMinutes(time.getMinutes());
                      setDepartureDate(newDate);
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {formatTime(time)}
                    </Text>
                    {isSelected && <List.Icon icon="check" color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setDateStep(2)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setStep(4)}
            >
              <Text style={styles.confirmButtonText}>
                Leave at {formatTime(departureDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
  }

  // Step 4: Select From/To
  if (step === 4) {
    const fromStations = stations.filter(s => s.name.toLowerCase().includes(fromStation.toLowerCase()));
    const toStations = stations.filter(s => s.name.toLowerCase().includes(toStation.toLowerCase()));
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
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
            <ScrollView style={styles.stationScrollView} nestedScrollEnabled={true}>
              {fromStations.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => setFromStation(item.name)}>
                  <Text style={styles.stationItem}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
            <ScrollView style={styles.stationScrollView} nestedScrollEnabled={true}>
              {toStations.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => setToStation(item.name)}>
                  <Text style={styles.stationItem}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        <Button
          mode="contained"
          style={styles.button}
          onPress={async () => {
            try {
              const payload = {
                start_point: fromStation,
                end_point: toStation,
                departure_time: departureDate.toISOString(),
                description: `Journey via ${selectedRoute?.name || mode}`,
                travel_mode: selectedRoute?.mode || 'bus',
                route_id: selectedRoute?.id,
              };
              console.log(payload,'paluo');

              const res = await apiClient.post<any>('/journey', payload);
              if (res?.success) {
                router.push(`/(tabs)/matches?departureTime=${departureDate.toISOString()}`);
              } else {
                console.warn('Failed to create journey', res?.error);
              }
            } catch (e) {
              console.warn('Error creating journey', e);
            }
          }}
          disabled={!fromStation || !toStation}
        >
          Next
        </Button>
      </ScrollView>
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
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 100,
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

  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 400, // Limit height to make it scrollable
  },
  timeOptionsScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  headerContainer: {
    padding: 24,
    paddingTop: 48,
  },
  flatListContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  stationScrollView: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  stationItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionCard: {
    backgroundColor: '#4F8EF7',
    borderWidth: 1,
    borderColor: '#4F8EF7',
  },
  selectedOptionText: {
    color: '#fff',
  },
  customButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 