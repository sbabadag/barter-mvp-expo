import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 'small',
  color = '#ff4444',
  textColor = '#fff',
  position = 'top-right'
}) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  const sizeStyles = {
    small: { minWidth: 16, height: 16, borderRadius: 8, fontSize: 10 },
    medium: { minWidth: 20, height: 20, borderRadius: 10, fontSize: 12 },
    large: { minWidth: 24, height: 24, borderRadius: 12, fontSize: 14 }
  };

  const positionStyles = {
    'top-right': { position: 'absolute' as const, top: -8, right: -8 },
    'top-left': { position: 'absolute' as const, top: -8, left: -8 },
    'bottom-right': { position: 'absolute' as const, bottom: -8, right: -8 },
    'bottom-left': { position: 'absolute' as const, bottom: -8, left: -8 }
  };

  return (
    <View style={[
      styles.badge, 
      positionStyles[position],
      {
        backgroundColor: color,
        minWidth: sizeStyles[size].minWidth,
        height: sizeStyles[size].height,
        borderRadius: sizeStyles[size].borderRadius,
      }
    ]}>
      <Text style={[
        styles.text, 
        { 
          color: textColor,
          fontSize: sizeStyles[size].fontSize
        }
      ]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default NotificationBadge;
