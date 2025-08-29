import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services';
import { useRouter } from 'expo-router';
import { User } from '@/types/api';

interface FormData {
  // User Profile Fields
  full_name: string;
  phone_number: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  date_of_birth: string;
  bio: string;
  profile_image_url?: string;
  
  // Matching Preference Fields
  profession: string;
  about_me: string;
  interests: string[];
  languages: string[];
  preferred_commute_time: {
    start: string;
    end: string;
  };
  preferred_commute_days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // User Profile Fields
    full_name: '',
    phone_number: '',
    gender: 'PREFER_NOT_TO_SAY',
    date_of_birth: '',
    bio: '',
    profile_image_url: undefined,
    
    // Matching Preference Fields
    profession: '',
    about_me: '',
    interests: [],
    languages: [],
    preferred_commute_time: { start: '', end: '' },
    preferred_commute_days: [],
  });

  const [currentInterest, setCurrentInterest] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useRouter();
  const [dobDayMonth, setDobDayMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Fetch existing user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userProfile = await authService.getCurrentUser();
        console.log('userProfile', userProfile);
        // Pre-fill the form with existing data
        setFormData({
          full_name: userProfile.full_name || '',
          phone_number: userProfile.phone_number || '',
          gender: userProfile.gender || 'PREFER_NOT_TO_SAY',
          date_of_birth: userProfile.date_of_birth || '',
          bio: userProfile.bio || '',
          profile_image_url: userProfile.profile_image_url,
          profession: userProfile.matching_preferences?.profession || '',
          about_me: userProfile.matching_preferences?.about_me || '',
          interests: userProfile.matching_preferences?.interests || [],
          languages: userProfile.matching_preferences?.languages || [],
          preferred_commute_time: userProfile.matching_preferences?.preferred_commute_time || { start: '', end: '' },
          preferred_commute_days: userProfile.matching_preferences?.preferred_commute_days || [],
        });
        // Pre-fill DOB split fields if available in YYYY-MM-DD
        const dob = userProfile.date_of_birth || '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
          const [y, m, d] = dob.split('-');
          setDobYear(y);
          setDobDayMonth(`${d}/${m}`);
        } else {
          setDobYear('');
          setDobDayMonth('');
        }
      } catch (error) {
        console.log('No existing profile found or error fetching profile:', error);
        // This is expected for new users, so we don't show an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const predefinedInterests = [
    'Technology', 'Reading', 'Hiking', 'Photography', 'Music', 'Travel', 
    'Cooking', 'Gaming', 'Sports', 'Art', 'Fitness', 'Dancing'
  ];

  const predefinedLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Arabic', 'Hindi', 'Russian', 'Dutch'
  ];

  const addInterest = (interest: string) => {
    if (!formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const addLanguage = (language: string) => {
    if (!formData.languages.includes(language)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, language]
      });
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(l => l !== language)
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.phone_number || !formData.gender || !formData.date_of_birth || !formData.bio) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.profession || !formData.about_me || formData.preferred_commute_time.start === '' || formData.preferred_commute_time.end === '' || formData.preferred_commute_days.length === 0) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await authService.updateProfile(formData);
      console.log(formData.full_name ? 'Profile updated successfully:' : 'Profile created successfully:', response);
      
      // Success feedback
      Alert.alert(
        'Success!', 
        formData.full_name ? 
          'Your profile has been updated successfully!' :
          'Your profile has been created successfully. You can now start finding commute matches!',
        [
          {
            text: 'Continue', 
            onPress: () => {
              // Navigate to main app - you can implement navigation here
              navigation.replace('/(tabs)/SelectJourney');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error(formData.full_name ? 'Error updating profile:' : 'Error creating profile:', error);
      
      // Error feedback
      Alert.alert(
        formData.full_name ? 'Error Updating Profile' : 'Error Creating Profile',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              // User can retry
            }
          }
        ]
      );
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>
        {formData.full_name ? 'Update your information' : 'Tell us about yourself'}
      </Text>

      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Image
          source={formData.profile_image_url ? { uri: formData.profile_image_url } : require('../../assets/images/profile-image.png')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={formData.full_name}
        onChangeText={(text) => setFormData({...formData, full_name: text})}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={formData.phone_number}
        onChangeText={(text) => setFormData({...formData, phone_number: text})}
        placeholderTextColor="#999"
        keyboardType="phone-pad"
      />

      <View style={styles.timeContainer}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="DD/MM"
          value={dobDayMonth}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/[^\d]/g, '').slice(0, 4);
            const formatted = digitsOnly.length > 2 
              ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
              : digitsOnly;
            setDobDayMonth(formatted);
            const [dd, mm] = formatted.split('/');
            const composed = dd && mm && dobYear.length === 4 
              ? `${dobYear}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
              : '';
            setFormData({ ...formData, date_of_birth: composed });
          }}
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="YYYY"
          value={dobYear}
          onChangeText={(text) => {
            const year = text.replace(/[^\d]/g, '').slice(0, 4);
            setDobYear(year);
            const [dd, mm] = dobDayMonth.split('/');
            const composed = dd && mm && year.length === 4 
              ? `${year}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
              : '';
            setFormData({ ...formData, date_of_birth: composed });
          }}
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      {/* Gender Selector */}
      <Text style={styles.sectionLabel}>Gender *</Text>
      <View style={styles.tagContainer}>
        {['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.suggestionTag,
              formData.gender === gender && styles.selectedTag
            ]}
            onPress={() => setFormData({...formData, gender: gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'})}
          >
            <Text style={[
              styles.suggestionText,
              formData.gender === gender && styles.selectedText
            ]}>
              {gender === 'PREFER_NOT_TO_SAY' ? 'Prefer not to say' : gender.charAt(0) + gender.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Bio - Tell us about yourself..."
        value={formData.bio}
        onChangeText={(text) => setFormData({...formData, bio: text})}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#999"
      />

      <Text style={styles.characterCount}>
        {formData.bio.length}/500 characters
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Profile Image URL (optional)"
        value={formData.profile_image_url || ''}
        onChangeText={(text) => setFormData({...formData, profile_image_url: text || undefined})}
        placeholderTextColor="#999"
      />

    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>About You</Text>
      <Text style={styles.stepSubtitle}>
        {formData.about_me ? 'Update your story' : 'Share your story'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Profession *"
        value={formData.profession}
        onChangeText={(text) => setFormData({...formData, profession: text})}
        placeholderTextColor="#999"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell us about yourself, your interests, and what you're looking for in a commute companion..."
        value={formData.about_me}
        onChangeText={(text) => setFormData({...formData, about_me: text})}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        placeholderTextColor="#999"
      />

      <Text style={styles.characterCount}>
        {formData.about_me.length}/500 characters
      </Text>

      {/* Commute Preferences */}
      <Text style={[styles.sectionLabel, styles.languageSection]}>
        {formData.preferred_commute_days.length > 0 ? 'Update Commute Preferences' : 'Commute Preferences'}
      </Text>
      
      <Text style={styles.sectionLabel}>Preferred Commute Time</Text>
      <View style={styles.timeContainer}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="Start Time (HH:MM)"
          value={formData.preferred_commute_time.start}
          onChangeText={(text) => setFormData({
            ...formData, 
            preferred_commute_time: { ...formData.preferred_commute_time, start: text }
          })}
          placeholderTextColor="#999"
        />
        <Text style={styles.timeSeparator}>to</Text>
        <TextInput
          style={[styles.input, styles.timeInput]}
          placeholder="End Time (HH:MM)"
          value={formData.preferred_commute_time.end}
          onChangeText={(text) => setFormData({
            ...formData, 
            preferred_commute_time: { ...formData.preferred_commute_time, end: text }
          })}
          placeholderTextColor="#999"
        />
      </View>

      <Text style={styles.sectionLabel}>Preferred Commute Days</Text>
      <View style={styles.tagContainer}>
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.suggestionTag,
              formData.preferred_commute_days.includes(day as any) && styles.selectedTag
            ]}
            onPress={() => {
              const currentDays = [...formData.preferred_commute_days];
              if (currentDays.includes(day as any)) {
                setFormData({
                  ...formData,
                  preferred_commute_days: currentDays.filter(d => d !== day)
                });
              } else {
                setFormData({
                  ...formData,
                  preferred_commute_days: [...currentDays, day as any]
                });
              }
            }}
          >
            <Text style={[
              styles.suggestionText,
              formData.preferred_commute_days.includes(day as any) && styles.selectedText
            ]}>
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Interests & Languages</Text>
      <Text style={styles.stepSubtitle}>
        {formData?.interests.length > 0 ? 'Update your preferences' : 'Help others connect with you'}
      </Text>

      {/* Interests Section */}
      <Text style={styles.sectionLabel}>
        {formData?.interests.length > 0 ? 'Your Current Interests' : 'Your Interests'}
      </Text>
      
      <View style={styles.inputWithButton}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          placeholder="Add an interest"
          value={currentInterest}
          onChangeText={setCurrentInterest}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            if (currentInterest.trim()) {
              addInterest(currentInterest.trim());
              setCurrentInterest('');
            }
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Predefined Interests */}
      <Text style={styles.suggestionsLabel}>Suggested:</Text>
      <View style={styles.tagContainer}>
        {predefinedInterests.map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.suggestionTag,
              formData.interests.includes(interest) && styles.selectedTag
            ]}
            onPress={() => addInterest(interest)}
          >
            <Text style={[
              styles.suggestionText,
              formData.interests.includes(interest) && styles.selectedText
            ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Interests */}
      {formData.interests.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Your Interests:</Text>
          <View style={styles.tagContainer}>
            {formData.interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={styles.selectedInterest}
                onPress={() => removeInterest(interest)}
              >
                <Text style={styles.selectedInterestText}>{interest}</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Languages Section */}
      <Text style={[styles.sectionLabel, styles.languageSection]}>
        {formData.languages.length > 0 ? 'Your Current Languages' : 'Languages'}
      </Text>
      
      <View style={styles.inputWithButton}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          placeholder="Add a language"
          value={currentLanguage}
          onChangeText={setCurrentLanguage}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            if (currentLanguage.trim()) {
              addLanguage(currentLanguage.trim());
              setCurrentLanguage('');
            }
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Predefined Languages */}
      <Text style={styles.suggestionsLabel}>Suggested:</Text>
      <View style={styles.tagContainer}>
        {predefinedLanguages.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.suggestionTag,
              formData.languages.includes(language) && styles.selectedTag
            ]}
            onPress={() => addLanguage(language)}
          >
            <Text style={[
              styles.suggestionText,
              formData.languages.includes(language) && styles.selectedText
            ]}>
              {language}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Languages */}
      {formData.languages.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Your Languages:</Text>
          <View style={styles.tagContainer}>
            {formData.languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={styles.selectedLanguage}
                onPress={() => removeLanguage(language)}
              >
                <Text style={styles.selectedLanguageText}>{language}</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => step > 1 ? setStep(step - 1) : null}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {formData.full_name ? 'Edit Profile' : 'Create Profile'}
              </Text>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>Step {step} of 3</Text>
            </View>

            {/* Step Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? (formData.full_name ? 'Update Profile' : 'Complete Profile') : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F8EF7',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  stepContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f3f4',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#4F8EF7',
    borderRadius: 18,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: -8,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  languageSection: {
    marginTop: 24,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  suggestionTag: {
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTag: {
    backgroundColor: '#4F8EF7',
    borderColor: '#4F8EF7',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedInterest: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedInterestText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  selectedLanguage: {
    backgroundColor: '#6f42c1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguageText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  timeSeparator: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
}); 