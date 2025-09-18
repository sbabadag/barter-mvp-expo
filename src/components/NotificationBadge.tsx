import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  maxCount?: number;
  showZero?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'small',
  color = '#EF4444',
  textColor = '#FFFFFF',
  position = 'top-right',
  maxCount = 99,
  showZero = false,
  style,
  textStyle
}) => {
  if (count <= 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeStyles = {
    small: { minWidth: 16, height: 16, borderRadius: 8, fontSize: 10, paddingHorizontal: 4 },
    medium: { minWidth: 20, height: 20, borderRadius: 10, fontSize: 12, paddingHorizontal: 5 },
    large: { minWidth: 24, height: 24, borderRadius: 12, fontSize: 14, paddingHorizontal: 6 }
  };

  const positionStyles = {
    'top-right': { position: 'absolute' as const, top: -8, right: -8 },
    'top-left': { position: 'absolute' as const, top: -8, left: -8 },
    'bottom-right': { position: 'absolute' as const, bottom: -8, right: -8 },
    'bottom-left': { position: 'absolute' as const, bottom: -8, left: -8 },
    'inline': {} // No positioning for inline badges
  };

  return (
    <View style={[
      styles.badge, 
      position !== 'inline' && positionStyles[position],
      {
        backgroundColor: color,
        minWidth: sizeStyles[size].minWidth,
        height: sizeStyles[size].height,
        borderRadius: sizeStyles[size].borderRadius,
        paddingHorizontal: sizeStyles[size].paddingHorizontal,
      },
      style
    ]}>
      <Text style={[
        styles.text, 
        { 
          color: textColor,
          fontSize: sizeStyles[size].fontSize,
        },
        textStyle
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

// Enhanced notification icon with badge
interface NotificationIconWithBadgeProps {
  icon: React.ReactNode;
  count: number;
  onPress?: () => void;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeSize?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const NotificationIconWithBadge: React.FC<NotificationIconWithBadgeProps> = ({
  icon,
  count,
  onPress,
  badgeColor = '#EF4444',
  badgeTextColor = '#FFFFFF',
  badgeSize = 'small',
  style
}) => {
  return (
    <View style={[styles.iconContainer, style]}>
      {icon}
      <NotificationBadge
        count={count}
        size={badgeSize}
        color={badgeColor}
        textColor={badgeTextColor}
        position="top-right"
      />
    </View>
  );
};

// Badge for tab bar items
interface TabBadgeProps {
  count: number;
  focused?: boolean;
}

export const TabBadge: React.FC<TabBadgeProps> = ({ count, focused }) => {
  if (count <= 0) return null;

  return (
    <NotificationBadge
      count={count}
      size="small"
      color={focused ? '#F0A500' : '#EF4444'}
      textColor="#FFFFFF"
      position="top-right"
      style={styles.tabBadge}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  iconContainer: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
});

export default NotificationBadge;
