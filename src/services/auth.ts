import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase, supabaseConfig } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  home_address?: string;
  home_postal_code?: string;
  work_address?: string;
  work_postal_code?: string;
  created_at: string;
  updated_at?: string;
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
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<User | null>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  signOut: (clearSavedCredentials?: boolean) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refresh: () => Promise<void>;
  autoLogin: () => Promise<boolean>;
  getSavedCredentials: () => Promise<{email: string; password: string} | null>;
  clearSavedCredentials: () => Promise<void>;
};

// Mock user storage for development
let mockUsers: User[] = [
  // Pre-populate with a test user for easier testing
  {
    id: 'test-user-123',
    email: 'test@example.com',
    display_name: 'Test Kullanıcı',
    city: 'İstanbul',
    created_at: new Date().toISOString(),
  }
];
let currentMockUser: User | null = null;

// Constants for credential storage
const STORAGE_KEYS = {
  SAVED_EMAIL: 'saved_email',
  SAVED_PASSWORD: 'saved_password_encrypted', // Note: In production, use proper encryption
  REMEMBER_ME: 'remember_me',
  AUTO_LOGIN: 'auto_login_enabled',
  MOCK_USER: 'mock_user',
  ENCRYPTION_SALT: 'barter_app_salt_2024',
};

// Simple encryption/decryption (for demo - use proper encryption in production)
const encryptPassword = (password: string): string => {
  // Simple encoding using React Native compatible methods
  try {
    const saltedPassword = password + STORAGE_KEYS.ENCRYPTION_SALT;
    // Use simple string manipulation for basic obfuscation
    return saltedPassword.split('').map(char => char.charCodeAt(0).toString(16)).join('');
  } catch (error) {
    console.error('Encryption error:', error);
    return password; // Fallback to plain text
  }
};

const decryptPassword = (encryptedPassword: string): string => {
  try {
    // Reverse the hex encoding
    const hexPairs = encryptedPassword.match(/.{1,2}/g) || [];
    const decoded = hexPairs.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
    return decoded.replace(STORAGE_KEYS.ENCRYPTION_SALT, '');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
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

  // Save credentials function
  const saveCredentials = async (email: string, password: string): Promise<void> => {
    try {
      const encryptedPassword = await encryptPassword(password);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.SAVED_EMAIL, email],
        [STORAGE_KEYS.SAVED_PASSWORD, encryptedPassword],
        [STORAGE_KEYS.REMEMBER_ME, 'true'],
        [STORAGE_KEYS.AUTO_LOGIN, 'true']
      ]);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  // Auto-login function
  const autoLogin = async (): Promise<boolean> => {
    try {
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
      const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);
      
      if (!savedEmail || !savedPassword) {
        console.log('No saved credentials found for auto-login');
        return false; // No saved credentials
      }

      const decryptedPassword = decryptPassword(savedPassword);
      if (!decryptedPassword) {
        console.log('Failed to decrypt saved password');
        await clearSavedCredentials(); // Clear corrupted credentials
        return false; // Failed to decrypt password
      }

      console.log('Attempting auto-login with saved credentials for:', savedEmail);
      const user = await signIn(savedEmail, decryptedPassword, false); // Don't save again
      
      if (user) {
        console.log('Auto-login successful');
        return true;
      } else {
        console.log('Auto-login failed - invalid credentials');
        await clearSavedCredentials(); // Clear invalid credentials
        return false;
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Clear potentially corrupted credentials on error
      await clearSavedCredentials();
      return false;
    }
  };

  // Get saved credentials function
  const getSavedCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
      const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);
      
      if (!savedEmail || !savedPassword) {
        return null;
      }

      const decryptedPassword = await decryptPassword(savedPassword);
      if (!decryptedPassword) {
        return null;
      }

      return {
        email: savedEmail,
        password: decryptedPassword
      };
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  };

  // Clear saved credentials function
  const clearSavedCredentials = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SAVED_EMAIL,
        STORAGE_KEYS.SAVED_PASSWORD,
        STORAGE_KEYS.REMEMBER_ME,
        STORAGE_KEYS.AUTO_LOGIN
      ]);
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  const initializeAuth = async () => {
    try {
      console.log('=== AUTH INITIALIZATION START ===');
      console.log('Platform:', Platform.OS);
      console.log('Supabase config:', { 
        isPlaceholder: supabaseConfig.isPlaceholder,
        url: supabaseConfig.url 
      });
      
      // Mobil ve web platformlarda aynı auth flow kullan
      const autoLoginEnabled = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN);
      console.log('Auto-login enabled:', autoLoginEnabled);
      
      if (autoLoginEnabled === 'true') {
        console.log('Auto-login is enabled, attempting...');
        const autoLoginSuccess = await autoLogin();
        if (autoLoginSuccess) {
          console.log('Auto-login completed successfully');
          return; // Auto-login successful, we're done
        } else {
          console.log('Auto-login failed, proceeding with normal initialization');
        }
      } else {
        console.log('Auto-login not enabled');
      }

      if (supabaseConfig.isPlaceholder) {
        console.log('Using mock mode - checking AsyncStorage for saved user');
        // Mock mode - check AsyncStorage for saved user
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_USER);
        console.log('Saved user from storage:', savedUser ? 'Found' : 'Not found');
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          console.log('Parsed user data:', { 
            id: user.id, 
            display_name: user.display_name,
            email: user.email 
          });
          currentMockUser = user;
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
          console.log('Mock user loaded successfully');
        } else {
          console.log('No saved user found, setting unauthenticated state');
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
      console.log('=== AUTH INITIALIZATION COMPLETE ===');
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      console.log('=== AUTH INITIALIZATION FAILED ===');
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

    try {
      // Get the current auth session to get email
      const { data: { session } } = await supabase.auth.getSession();
      const authEmail = session?.user?.email || undefined;
      
      // Also try to get email from saved credentials as fallback
      let savedEmail = undefined;
      try {
        const credentials = await getSavedCredentials();
        savedEmail = credentials?.email || undefined;
      } catch (e) {
        // Ignore errors getting saved credentials
      }
      
      const userEmail = authEmail || savedEmail;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle "profile not found" error specifically
        if (error.code === 'PGRST116') {
          console.warn('Profile not found for user:', userId, 'Creating a basic profile...');
          
          // Try to create a basic profile first
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{
                id: userId,
                display_name: 'Yeni Kullanıcı',
              }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              // Successfully created, return the new profile
              return {
                id: userId,
                display_name: 'Yeni Kullanıcı',
                email: userEmail,
                created_at: new Date().toISOString(),
              };
            }
          } catch (createError) {
            console.error('Error creating profile:', createError);
          }
          
          // Return a basic user object that can be used until profile is created
          return {
            id: userId,
            display_name: 'Yeni Kullanıcı',
            email: userEmail,
            created_at: new Date().toISOString(),
          };
        }
        
        console.error('Error fetching profile:', error);
        throw error;
      }

      // Include email in the profile data
      return {
        ...data,
        email: userEmail,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.warn('Falling back to basic user profile for:', userId);
      
      // Fallback to basic profile if any error occurs
      return {
        id: userId,
        display_name: 'Kullanıcı',
        email: undefined,
        created_at: new Date().toISOString(),
      };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    if (supabaseConfig.isPlaceholder) {
      // Mock registration
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Yeni Kullanıcı',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        city: userData.city || '',
        phone: userData.phone || '',
        birth_date: userData.birth_date || '',
        gender: userData.gender || '',
        avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
              display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Yeni Kullanıcı',
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              email: email,
              phone: userData.phone || '',
              city: userData.city || '',
              birth_date: userData.birth_date || null,
              gender: userData.gender || null,
              avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
            }]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            
            // Handle specific PostgREST errors
            if ('code' in profileError) {
              if (profileError.code === 'PGRST204') {
                console.warn('📋 Database schema not updated - missing new profile columns');
                console.warn('Please run: npm run update-profiles OR manually add columns to profiles table');
                console.warn('Falling back to mock mode for enhanced registration fields');
              } else if (profileError.code === '42501') {
                console.warn('📋 RLS Policy Error: The database policies need to be updated to allow profile creation.');
                console.warn('Please run the SQL in sql/fix_rls_policies.sql on your Supabase database.');
                console.warn('Continuing with user registration, profile can be updated later');
              } else if (profileError.code === '23505') {
                console.warn('📋 Profile already exists for this user - this is normal');
              } else if (profileError.code === '22008') {
                console.warn('📋 Date format error: Invalid birth date format');
                console.warn('Expected format: YYYY-MM-DD (e.g., 1975-08-06)');
                console.warn('User input may need better validation');
              } else {
                console.warn(`📋 Database error ${profileError.code}: ${profileError.message}`);
              }
              
              // For schema errors, continue with basic profile creation
              if (profileError.code === 'PGRST204') {
                console.log('Attempting basic profile creation without new fields...');
                const { error: basicProfileError } = await supabase
                  .from('profiles')
                  .insert([{
                    id: data.user.id,
                    display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Yeni Kullanıcı',
                    avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
                  }]);
                
                if (basicProfileError) {
                  console.warn('Basic profile creation also failed, continuing without profile');
                } else {
                  console.log('✅ Basic profile created successfully');
                }
              }
              
              // For date format errors, try creating profile without birth_date
              if (profileError.code === '22008') {
                console.log('Attempting profile creation without birth_date...');
                const { error: noBirthDateError } = await supabase
                  .from('profiles')
                  .insert([{
                    id: data.user.id,
                    display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Yeni Kullanıcı',
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: email,
                    phone: userData.phone || '',
                    city: userData.city || '',
                    gender: userData.gender || null,
                    avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
                  }]);
                
                if (noBirthDateError) {
                  console.warn('Profile creation without birth_date also failed, continuing without profile');
                } else {
                  console.log('✅ Profile created successfully (without birth_date)');
                }
              }
            } else {
              console.warn('Unknown profile creation error:', profileError);
            }
            
            // Continue with user registration regardless of profile creation status
            console.warn('Continuing with user registration, profile can be updated later');
          }
        }
      } catch (error) {
        // Fallback to mock mode if real Supabase fails
        console.warn('Falling back to mock authentication due to error:', error);
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Yeni Kullanıcı',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          city: userData.city || '',
          phone: userData.phone || '',
          birth_date: userData.birth_date || '',
          gender: userData.gender || '',
          avatar_url: userData.avatar_url || `https://i.pravatar.cc/100?u=${email}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      if (supabaseConfig.isPlaceholder) {
        // Mock sign in - find user by email
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          console.log('User not found in mock users for email:', email);
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return null; // Return null instead of throwing error
        }
        
        currentMockUser = user;
        await AsyncStorage.setItem(STORAGE_KEYS.MOCK_USER, JSON.stringify(user));

        // Save credentials if remember me is enabled
        if (rememberMe) {
          await saveCredentials(email, password);
        }
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });

        return user;
      } else {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.log('Supabase auth error:', error.message);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return null; // Return null instead of throwing error
          }

          if (data.user) {
            const profile = await getProfile(data.user.id);
            
            // Save credentials if remember me is enabled
            if (rememberMe) {
              await saveCredentials(email, password);
            }

            setAuthState({
              user: profile,
              isLoading: false,
              isAuthenticated: true,
            });

            return profile;
          }
        } catch (error) {
          // Fallback to mock mode
          console.log('Falling back to mock authentication for sign in:', error);
          
          const user = mockUsers.find(u => u.email === email);
          if (!user) {
            console.log('User not found in mock fallback for email:', email);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return null; // Return null instead of throwing error
          }
          
          currentMockUser = user;
          await AsyncStorage.setItem(STORAGE_KEYS.MOCK_USER, JSON.stringify(user));

          // Save credentials if remember me is enabled
          if (rememberMe) {
            await saveCredentials(email, password);
          }
          
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });

          return user;
        }
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return null;
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return null; // Return null instead of throwing error for auto-login compatibility
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

  const signOut = async (clearCredentials: boolean = false) => {
    if (supabaseConfig.isPlaceholder) {
      currentMockUser = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.MOCK_USER);
    } else {
      await supabase.auth.signOut();
    }
    
    // Clear saved credentials if requested
    if (clearCredentials) {
      await clearSavedCredentials();
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
        // Clean up the data before sending to Supabase
        const cleanedData: any = { ...userData };
        
        // Convert empty strings to null for date fields
        if (cleanedData.birth_date === '') {
          cleanedData.birth_date = null;
        }
        
        // Convert empty strings to null for other fields that might cause issues
        Object.keys(cleanedData).forEach(key => {
          if (cleanedData[key] === '') {
            cleanedData[key] = null;
          }
        });
        
        console.log('Updating profile with cleaned data:', cleanedData);
        
        const { error } = await supabase
          .from('profiles')
          .update(cleanedData)
          .eq('id', authState.user.id);

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }

        console.log('Profile updated successfully in Supabase');
        
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
    autoLogin,
    getSavedCredentials,
    clearSavedCredentials,
    refresh: initializeAuth,
  };
};
