import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onCartClick,
  searchQuery,
  onSearchChange,
  onNotificationPress
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Row - Logo and Icons */}
        <View style={styles.topRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ESKICI</Text>
            <Text style={styles.logoSubtext}>Komşular Arası Takas</Text>
          </View>
          
          <View style={styles.iconsContainer}>
            {/* Notifications */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onNotificationPress}
            >
              <Ionicons name="notifications-outline" size={24} color="#374151" />
            </TouchableOpacity>
            
            {/* Cart/Offers */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onCartClick}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#374151" />
              {cartItemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ne arıyorsunuz?"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  logoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
});