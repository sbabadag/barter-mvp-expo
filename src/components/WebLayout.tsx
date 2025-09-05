import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';

interface WebLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function WebLayout({ 
  children, 
  maxWidth = 1200, 
  padding = 16 
}: WebLayoutProps) {
  // Mobil cihazlarda normal layout
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webContainer}>
      <View style={[
        styles.webContent,
        {
          maxWidth,
          paddingHorizontal: screenWidth > maxWidth ? padding : padding,
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Web için açık gri background
    ...(Platform.OS === 'web' && {
      minHeight: Dimensions.get('window').height,
    }),
  },
  webContent: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
    // Web için shadow effect
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
});
