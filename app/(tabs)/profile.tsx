import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { useAuth } from "../../src/state/AuthProvider";

export default function ProfileScreen(){
  const { user, signOut, isLoading } = useAuth();
  
  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Nasıl çıkış yapmak istiyorsunuz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Şifremi Hatırla',
          onPress: () => signOut(false),
          style: 'default'
        },
        {
          text: 'Şifremi Unut',
          onPress: () => signOut(true),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil</Text>
        
        {user ? (
          <View style={styles.profileSection}>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Ad Soyad:</Text>
              <Text style={styles.value}>{user.display_name || 'Belirtilmemiş'}</Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.label}>E-posta:</Text>
              <Text style={styles.value}>{user.email || 'Belirtilmemiş'}</Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.label}>Şehir:</Text>
              <Text style={styles.value}>{user.city || 'Belirtilmemiş'}</Text>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.label}>Telefon:</Text>
              <Text style={styles.value}>{user.phone || 'Belirtilmemiş'}</Text>
            </View>
            
            <Pressable 
              onPress={handleSignOut} 
              style={styles.signOutButton}
              disabled={isLoading}
            >
              <Text style={styles.signOutText}>
                {isLoading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.notAuthenticatedSection}>
            <Text style={styles.notAuthenticatedText}>
              Profil bilgilerinizi görmek için giriş yapmanız gerekmektedir.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  profileSection: {
    gap: 16,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  signOutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  notAuthenticatedSection: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
