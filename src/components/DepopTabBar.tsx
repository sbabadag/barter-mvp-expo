import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DepopTheme } from '../styles/DepopTheme';

interface DepopTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const DepopTabBar: React.FC<DepopTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getIcon = (routeName: string, focused: boolean) => {
    const iconSize = 24;
    const color = focused ? DepopTheme.colors.primary : DepopTheme.colors.text.tertiary;

    switch (routeName) {
      case 'index':
        return <Ionicons name="home" size={iconSize} color={color} />;
      case 'search':
        return <Ionicons name="search" size={iconSize} color={color} />;
      case 'sell':
        return (
          <View style={[styles.sellButton, focused && styles.sellButtonFocused]}>
            <Ionicons name="add" size={iconSize} color={DepopTheme.colors.text.inverse} />
          </View>
        );
      case 'inbox':
        return <Ionicons name="chatbubble-outline" size={iconSize} color={color} />;
      case 'profile':
        return <Ionicons name="person-outline" size={iconSize} color={color} />;
      default:
        return <Ionicons name="help-outline" size={iconSize} color={color} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'search':
        return 'Search';
      case 'sell':
        return 'Sell';
      case 'inbox':
        return 'Inbox';
      case 'profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = getLabel(route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
          >
            {getIcon(route.name, isFocused)}
            {route.name !== 'sell' && (
              <Text style={[
                styles.label,
                { color: isFocused ? DepopTheme.colors.primary : DepopTheme.colors.text.tertiary }
              ]}>
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: DepopTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: DepopTheme.colors.border,
    paddingBottom: 20, // For iPhone safe area
    paddingTop: 8,
    height: 80,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  
  sellButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DepopTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  sellButtonFocused: {
    backgroundColor: DepopTheme.colors.accent,
  },
  
  label: {
    fontSize: DepopTheme.typography.sizes.xs,
    marginTop: 4,
    fontWeight: DepopTheme.typography.weights.normal,
  },
});
