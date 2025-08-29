import { authService } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      router.replace('/profile');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={24} color="#222" />
        <Text style={styles.header}>CommuteConnect</Text>
        <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
      </View>

      {/* Welcome */}
      <Text style={styles.welcome}>Welcome Back!</Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Email or Username"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.divider} />
      </View>

      {/* Social Buttons */}
      <TouchableOpacity style={styles.socialButton}>
        <Image
          source={require('../../assets/images/google-icon.png')} // Replace with your Google icon
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Image
          source={require('../../assets/images/apple-icon.png')} // Replace with your Apple icon
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Apple</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <View style={styles.signupRow}>
        <Text style={{ color: '#222' }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/register')}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 24, justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 12,
  },
  header: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  welcome: { fontSize: 26, fontWeight: 'bold', marginBottom: 28, textAlign: 'center', color: '#222' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  forgotText: { color: '#2196F3', textAlign: 'center', marginVertical: 8 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E6ED' },
  dividerText: { marginHorizontal: 10, color: '#A0A4A8', fontSize: 13 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
    justifyContent: 'center',
  },
  socialIcon: { width: 22, height: 22, marginRight: 10 },
  socialText: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  signupText: { color: '#2196F3', fontWeight: 'bold' },
});