import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/Colors';
import { Notification } from '@/types';
import { formatTimeAgo } from '@/utils/formatters';
import { MoreHorizontal } from 'lucide-react-native';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  onOptions?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onOptions,
}) => {
  const { title, message, date, read, type } = notification;
  
  const getIconForType = () => {
    switch (type) {
      case 'reminder':
        return '⏰';
      case 'alert':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '📌';
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, read && styles.readContainer]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIconForType()}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{formatTimeAgo(new Date(date))}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <TouchableOpacity style={styles.optionsButton} onPress={onOptions}>
        <MoreHorizontal size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readContainer: {
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  optionsButton: {
    padding: 4,
  },
});

export default NotificationItem;