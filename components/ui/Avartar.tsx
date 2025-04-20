import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/Colors';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  style,
}) => {
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  
  const textSize = {
    fontSize: size * 0.4,
  };
  
  return (
    <View style={[styles.container, avatarStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, avatarStyle]}
        />
      ) : (
        <Text style={[styles.initials, textSize]}>{getInitials()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Avatar;