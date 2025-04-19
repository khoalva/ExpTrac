import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacity, 
  TouchableOpacityProps 
} from 'react-native';
import { colors } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default' 
}) => {
  return (
    <View style={[
      styles.card, 
      styles[`${variant}Card`],
      style
    ]}>
      {children}
    </View>
  );
};

interface TouchableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const TouchableCard: React.FC<TouchableCardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  ...rest
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        styles[`${variant}Card`],
        style
      ]}
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'white',
  },
  defaultCard: {
    backgroundColor: 'white',
  },
  elevatedCard: {
    backgroundColor: 'white',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  outlinedCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default { Card, TouchableCard };