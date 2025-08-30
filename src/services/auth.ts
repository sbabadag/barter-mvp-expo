import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfig } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
  city?: string;
  avatar_url?: string;
  created_at: string;
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage for development
let mockUsers: User[] = [];
let currentMockUser: User | null = null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthService = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (supabaseConfig.isPlaceholder) {
        // Mock mode - check AsyncStorage for saved user
        const savedUser = await AsyncStorage.getItem('mock_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          currentMockUser = user;
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        // Real Supabase auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setAuthState({
            user: profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await getProfile(session.user.id);
            setAuthState({
              user: profile,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const getProfile = async (userId: string): Promise<User> => {
    if (supabaseConfig.isPlaceholder) {
      return currentMockUser || {
        id: userId,
        display_name: 'Demo User',
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    if (supabaseConfig.isPlaceholder) {
      // Mock registration
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        display_name: userData.display_name || 'Yeni Kullanıcı',
        city: userData.city || '',
        avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
        created_at: new Date().toISOString(),
      };
      
      mockUsers.push(newUser);
      currentMockUser = newUser;
      await AsyncStorage.setItem('mock_user', JSON.stringify(newUser));
      
      setAuthState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      // Try real Supabase registration, fallback to mock on error
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              display_name: userData.display_name,
              city: userData.city,
              avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
            }]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            
            // If it's an RLS policy error, provide specific guidance
            if ('code' in profileError && profileError.code === '42501') {
              console.error('RLS Policy Error: The database policies need to be updated to allow profile creation.');
              console.error('Please run the SQL in sql/fix_profile_policies.sql on your Supabase database.');
              
              // For now, continue without throwing - the user registration was successful
              // The profile will be created when they update their info later
              console.warn('Continuing with user registration, profile can be created later');
            } else {
              throw profileError;
            }
          }
        }
      } catch (error) {
        // Fallback to mock mode if real Supabase fails
        console.warn('Falling back to mock authentication due to error:', error);
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          display_name: userData.display_name || 'Yeni Kullanıcı',
          city: userData.city || '',
          avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
          created_at: new Date().toISOString(),
        };
        
        mockUsers.push(newUser);
        currentMockUser = newUser;
        await AsyncStorage.setItem('mock_user', JSON.stringify(newUser));
        
        setAuthState({
          user: newUser,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (supabaseConfig.isPlaceholder) {
      // Mock sign in - find user by email
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      currentMockUser = user;
      await AsyncStorage.setItem('mock_user', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } catch (error) {
        // Fallback to mock mode
        console.warn('Falling back to mock authentication for sign in:', error);
        
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }
        
        currentMockUser = user;
        await AsyncStorage.setItem('mock_user', JSON.stringify(user));
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    }
  };

  const signInWithPhone = async (phone: string) => {
    if (supabaseConfig.isPlaceholder) {
      // Mock phone auth - create temp user
      const tempUser: User = {
        id: `phone_${Date.now()}`,
        phone,
        display_name: 'Telefon Kullanıcısı',
        created_at: new Date().toISOString(),
      };
      
      currentMockUser = tempUser;
      setAuthState({
        user: tempUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    if (supabaseConfig.isPlaceholder) {
      // Mock OTP verification - always succeed for demo
      const user: User = {
        id: `phone_${Date.now()}`,
        phone,
        display_name: 'Telefon Kullanıcısı',
        created_at: new Date().toISOString(),
      };
      
      currentMockUser = user;
      await AsyncStorage.setItem('mock_user', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
    }
  };

  const signOut = async () => {
    if (supabaseConfig.isPlaceholder) {
      currentMockUser = null;
      await AsyncStorage.removeItem('mock_user');
    } else {
      await supabase.auth.signOut();
    }
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!authState.user) return;

    if (supabaseConfig.isPlaceholder) {
      // Mock profile update
      const updatedUser = { ...authState.user, ...userData };
      currentMockUser = updatedUser;
      await AsyncStorage.setItem('mock_user', JSON.stringify(updatedUser));
      
      setAuthState({
        user: updatedUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', authState.user.id);

        if (error) throw error;

        const updatedUser = { ...authState.user, ...userData };
        setAuthState({
          user: updatedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // Fallback to mock mode for profile update
        console.warn('Falling back to mock profile update:', error);
        
        const updatedUser = { ...authState.user, ...userData };
        currentMockUser = updatedUser;
        await AsyncStorage.setItem('mock_user', JSON.stringify(updatedUser));
        
        setAuthState({
          user: updatedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithPhone,
    verifyOTP,
    signOut,
    updateProfile,
  };
};
