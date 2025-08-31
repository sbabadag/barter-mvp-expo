import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../src/state/AuthProvider';

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'signup' | 'login' | 'phone'>('welcome');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
    city: '',
    phone: '',
    birthDate: '',
    gender: '',
    homeAddress: '',
    homePostalCode: '',
    workAddress: '',
    workPostalCode: '',
    otp: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signInWithPhone, verifyOTP, getSavedCredentials } = useAuth();

  // Load saved credentials when login screen opens
  useEffect(() => {
    const loadSavedCredentials = async () => {
      if (currentStep === 'login') {
        try {
          const savedCredentials = await getSavedCredentials();
          if (savedCredentials) {
            setFormData(prev => ({
              ...prev,
              email: savedCredentials.email,
              password: savedCredentials.password
            }));
            setRememberMe(true);
          }
        } catch (error) {
          console.error('Error loading saved credentials:', error);
        }
      }
    };

    loadSavedCredentials();
  }, [currentStep, getSavedCredentials]);

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun (Ad, Soyad, Email, Şifre)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Hata', 'Geçerli bir email adresi girin');
      return;
    }

    // Phone format validation (if provided)
    if (formData.phone && !/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Hata', 'Geçerli bir Türkiye telefon numarası girin (örn: 0555 123 45 67)');
      return;
    }

    // Birth date format validation (if provided)
    if (formData.birthDate) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = formData.birthDate.match(dateRegex);
      
      if (!match) {
        Alert.alert('Hata', 'Doğum tarihi formatı: GG/AA/YYYY (örn: 06/08/1975)');
        return;
      }
      
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Check if date is valid
      if (date.getDate() != parseInt(day) || 
          date.getMonth() != parseInt(month) - 1 || 
          date.getFullYear() != parseInt(year)) {
        Alert.alert('Hata', 'Geçersiz tarih. Lütfen geçerli bir tarih girin.');
        return;
      }
      
      // Check if date is reasonable (not in future, not too old)
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, 0, 1); // 120 years ago
      
      if (date > today) {
        Alert.alert('Hata', 'Doğum tarihi gelecekte olamaz.');
        return;
      }
      
      if (date < minDate) {
        Alert.alert('Hata', 'Lütfen geçerli bir doğum tarihi girin.');
        return;
      }
    }

    // Postal code validation (if provided)
    const postalCodeRegex = /^\d{5}$/;
    if (formData.homePostalCode && !postalCodeRegex.test(formData.homePostalCode)) {
      Alert.alert('Hata', 'Ev posta kodu 5 haneli rakam olmalıdır (örn: 34567)');
      return;
    }
    
    if (formData.workPostalCode && !postalCodeRegex.test(formData.workPostalCode)) {
      Alert.alert('Hata', 'İş posta kodu 5 haneli rakam olmalıdır (örn: 34567)');
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Format birth date for database (convert DD/MM/YYYY to YYYY-MM-DD)
      let formattedBirthDate = '';
      if (formData.birthDate) {
        const dateMatch = formData.birthDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          formattedBirthDate = `${year}-${month}-${day}`;
        }
      }
      
      await signUp(formData.email, formData.password, {
        display_name: fullName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        city: formData.city,
        phone: formData.phone,
        birth_date: formattedBirthDate || undefined,
        gender: formData.gender,
        home_address: formData.homeAddress || undefined,
        home_postal_code: formData.homePostalCode || undefined,
        work_address: formData.workAddress || undefined,
        work_postal_code: formData.workPostalCode || undefined,
      });
      Alert.alert('Başarılı!', 'Hesabınız oluşturuldu! Artık giriş yapabilirsiniz.');
      setCurrentStep('login');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Hata', 'Email ve şifre gereklidir');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(formData.email, formData.password, rememberMe);
      if (!result) {
        Alert.alert('Hata', 'Geçersiz email veya şifre');
      }
      // If result is truthy, user is successfully logged in and auth state will update
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!formData.phone) {
      Alert.alert('Hata', 'Telefon numarası gereklidir');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPhone(formData.phone);
      Alert.alert('SMS Gönderildi', 'Doğrulama kodu telefonunuza gönderildi');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'SMS gönderimi sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      Alert.alert('Hata', 'Doğrulama kodu gereklidir');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(formData.phone, formData.otp);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Doğrulama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Barter</Text>
        <Text style={styles.logoSubtext}>Turkish Marketplace</Text>
        <Text style={styles.title}>BarterTürk'e Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>
          Türkiye'nin en büyük takas ve alışveriş platformu
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, styles.primaryButton]}
          onPress={() => setCurrentStep('signup')}
        >
          <Text style={styles.primaryButtonText}>Yeni Hesap Oluştur</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setCurrentStep('login')}
        >
          <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.phoneButton]}
          onPress={() => setCurrentStep('phone')}
        >
          <Text style={styles.phoneButtonText}>📱 Telefon ile Giriş</Text>
        </Pressable>
      </View>

      <Text style={styles.features}>
        ✅ Güvenli alışveriş{'\n'}
        ✅ Takas imkanı{'\n'}
        ✅ Türkiye geneli teslimat{'\n'}
        ✅ 7/24 müşteri desteği
      </Text>
    </View>
  );

  const renderSignUpScreen = () => (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => setCurrentStep('welcome')}>
            <Text style={styles.backButton}>← Geri</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Hesap Oluştur</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Ad *"
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Soyad *"
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Telefon (örn: 0555 123 45 67)"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Şehir"
            value={formData.city}
            onChangeText={(text) => setFormData({...formData, city: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Doğum Tarihi (GG/AA/YYYY örn: 06/08/1975)"
            value={formData.birthDate}
            onChangeText={(text) => {
              // Auto-format the date input
              let formatted = text.replace(/\D/g, ''); // Remove non-digits
              if (formatted.length >= 2) {
                formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
              }
              if (formatted.length >= 5) {
                formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
              }
              setFormData({...formData, birthDate: formatted});
            }}
            keyboardType="numeric"
            maxLength={10}
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Cinsiyet:</Text>
            <View style={styles.genderButtons}>
              <Pressable 
                style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonSelected]}
                onPress={() => setFormData({...formData, gender: 'male'})}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'male' && styles.genderButtonTextSelected]}>Erkek</Text>
              </Pressable>
              <Pressable 
                style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonSelected]}
                onPress={() => setFormData({...formData, gender: 'female'})}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'female' && styles.genderButtonTextSelected]}>Kadın</Text>
              </Pressable>
              <Pressable 
                style={[styles.genderButton, formData.gender === 'other' && styles.genderButtonSelected]}
                onPress={() => setFormData({...formData, gender: 'other'})}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'other' && styles.genderButtonTextSelected]}>Diğer</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Adres Bilgileri (İsteğe Bağlı)</Text>

          <TextInput
            style={styles.input}
            placeholder="Ev Adresi"
            value={formData.homeAddress}
            onChangeText={(text) => setFormData({...formData, homeAddress: text})}
            multiline
            numberOfLines={2}
          />

          <TextInput
            style={styles.input}
            placeholder="Ev Posta Kodu (5 haneli, örn: 34567)"
            value={formData.homePostalCode}
            onChangeText={(text) => {
              // Only allow 5 digits
              const formatted = text.replace(/\D/g, '').substring(0, 5);
              setFormData({...formData, homePostalCode: formatted});
            }}
            keyboardType="numeric"
            maxLength={5}
          />

          <TextInput
            style={styles.input}
            placeholder="İş/Ofis Adresi"
            value={formData.workAddress}
            onChangeText={(text) => setFormData({...formData, workAddress: text})}
            multiline
            numberOfLines={2}
          />

          <TextInput
            style={styles.input}
            placeholder="İş Posta Kodu (5 haneli, örn: 34567)"
            value={formData.workPostalCode}
            onChangeText={(text) => {
              // Only allow 5 digits
              const formatted = text.replace(/\D/g, '').substring(0, 5);
              setFormData({...formData, workPostalCode: formatted});
            }}
            keyboardType="numeric"
            maxLength={5}
          />

          <Text style={styles.sectionTitle}>Güvenlik</Text>

          <TextInput
            style={styles.input}
            placeholder="Şifre *"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre Tekrar *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />

          <Text style={styles.formNote}>* Zorunlu alanlar</Text>

          <Pressable 
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderLoginScreen = () => (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => setCurrentStep('welcome')}>
            <Text style={styles.backButton}>← Geri</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Giriş Yap</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          <Pressable 
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Beni hatırla (otomatik giriş)</Text>
          </Pressable>

          <Pressable 
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </Pressable>

          <Pressable onPress={() => setCurrentStep('signup')}>
            <Text style={styles.linkText}>Hesabınız yok mu? Kayıt olun</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPhoneScreen = () => (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => setCurrentStep('welcome')}>
            <Text style={styles.backButton}>← Geri</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Telefon ile Giriş</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası (+90 5XX XXX XX XX)"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          {formData.phone && !formData.otp && (
            <Pressable 
              style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handlePhoneSignIn}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'SMS Gönderiliyor...' : 'SMS Kodu Gönder'}
              </Text>
            </Pressable>
          )}

          {formData.otp !== undefined && (
            <>
              <TextInput
                style={styles.input}
                placeholder="6 haneli doğrulama kodu"
                value={formData.otp}
                onChangeText={(text) => setFormData({...formData, otp: text})}
                keyboardType="number-pad"
                maxLength={6}
              />

              <Pressable 
                style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  switch (currentStep) {
    case 'signup':
      return renderSignUpScreen();
    case 'login':
      return renderLoginScreen();
    case 'phone':
      return renderPhoneScreen();
    default:
      return renderWelcomeScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 5,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#00d4aa',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneButton: {
    backgroundColor: '#007AFF',
  },
  phoneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 40,
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#00d4aa',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  disabledButton: {
    opacity: 0.6,
  },
  linkText: {
    textAlign: 'center',
    color: '#00d4aa',
    fontSize: 14,
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  checkboxChecked: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  genderContainer: {
    marginVertical: 10,
  },
  genderLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#00d4aa',
    borderColor: '#00d4aa',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  formNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
});
