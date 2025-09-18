import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NotificationIconWithBadge } from '../NotificationBadge';

interface HeaderProps {
  cartItemCount?: number;
  notificationCount?: number;
  onCartClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNotificationPress?: () => void;
  onFavoritesPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  notificationCount = 0,
  onCartClick,
  searchQuery,
  onSearchChange,
  onNotificationPress,
  onFavoritesPress
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Single Row - Search and Icons */}
        <View style={styles.mainRow}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ara..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>
          
          {/* Icons Container */}
          <View style={styles.iconsContainer}>
            {/* Notification Bell */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <NotificationIconWithBadge
                icon={<Ionicons name="notifications-outline" size={24} color="#374151" />}
                count={notificationCount}
                badgeColor="#F0A500"
                badgeSize="small"
              />
            </TouchableOpacity>
            
            {/* Favorites/Heart */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onFavoritesPress}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={24} color="#374151" />
            </TouchableOpacity>
            
            {/* Shopping Bag */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onCartClick}
              activeOpacity={0.7}
            >
              <NotificationIconWithBadge
                icon={<Ionicons name="bag-outline" size={24} color="#374151" />}
                count={cartItemCount}
                badgeColor="#EF4444"
                badgeSize="small"
              />
            </TouchableOpacity>
          </View>
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
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 19,
    paddingHorizontal: 12,
    height: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
});