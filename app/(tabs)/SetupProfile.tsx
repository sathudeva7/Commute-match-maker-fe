import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  // Add more languages as needed
];

export default function SetUpProfile() {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [language, setLanguage] = useState('');
  const [showDropDown, setShowDropDown] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Set Up Profile</Text>

      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/images/profile-image.png')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Text style={styles.editIconText}>✎</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.uploadText}>Tap the camera to upload a photo</Text>

      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="e.g., Software Engineer, Designer"
        value={profession}
        onChangeText={setProfession}
      />

      {/* Interests & Preferences */}
      <Text style={styles.sectionTitle}>Interests & Preferences</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Tell us about your hobbies and interests (e.g., reading, hiking, photography)"
        value={hobbies}
        onChangeText={setHobbies}
        multiline
      />

      {/* Language Preference */}
      {/* <Dropdown
        label="Language Preference"
        mode="outlined"
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={language}
        setValue={setLanguage}
        list={languages}
        style={styles.input}
        placeholder="Select your preferred language"
      /> */}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5D0C5',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 6,
  },
  editIconText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadText: {
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});