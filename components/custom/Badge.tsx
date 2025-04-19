import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/Colors';

interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  return (
    <View style={[
      styles.badge,
      styles[`${variant}Badge`],
      styles[`${size}Badge`],
      style,
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        textStyle,
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  
  // Variants
  primaryBadge: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: 'white',
  },
  
  successBadge: {
    backgroundColor: colors.success,
  },
  successText: {
    color: 'white',
  },
  
  errorBadge: {
    backgroundColor: colors.error,
  },
  errorText: {
    color: 'white',
  },
  
  warningBadge: {
    backgroundColor: colors.warning,
  },
  warningText: {
    color: 'white',
  },
  
  infoBadge: {
    backgroundColor: colors.info,
  },
  infoText: {
    color: 'white',
  },
  
  // Sizes
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  smallText: {
    fontSize: 10,
  },
  
  mediumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
  },
  mediumText: {
    fontSize: 12,
  },
  
  largeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 28,
  },
  largeText: {
    fontSize: 14,
  },
});

export default Badge;