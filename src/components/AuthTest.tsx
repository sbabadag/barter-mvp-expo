import React, { useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useAuth } from '../state/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthTest() {
  const { user, isAuthenticated, refresh } = useAuth();

  useEffect(() => {
    console.log('Auth Test - User:', user);
    console.log('Auth Test - Is Authenticated:', isAuthenticated);
    checkAndCreateUser();
  }, []);

  const checkAndCreateUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('mock_user');
      console.log('Saved user in AsyncStorage:', savedUser);
      
      if (!savedUser) {
        console.log('No user found, creating test user...');
        await createTestUser();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const createTestUser = async () => {
    try {
      const testUser = {
        id: `user_${Date.now()}`,
        email: 'test@example.com',
        display_name: 'Test Kullanıcı',
        city: 'İstanbul',
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem('mock_user', JSON.stringify(testUser));
      console.log('Test user created:', testUser);
      
      // Refresh auth state
      await refresh();
      
      Alert.alert('Test Kullanıcı Oluşturuldu', 'Artık teklif verebilirsiniz!');
    } catch (error) {
      console.error('Error creating test user:', error);
    }
  };

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem('mock_user');
      await refresh();
      Alert.alert('Kullanıcı Silindi', 'Mock kullanıcı silindi.');
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Auth Test</Text>
      
      <Text>User: {user ? user.display_name || user.id : 'null'}</Text>
      <Text>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</Text>
      <Text>User ID: {user?.id || 'none'}</Text>
      
      <Pressable
        style={{
          backgroundColor: '#00d4aa',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={createTestUser}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Create Test User</Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: '#f44336',
          padding: 16,
          borderRadius: 8,
          marginTop: 10,
        }}
        onPress={clearUser}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Clear User</Text>
      </Pressable>
    </View>
  );
}
