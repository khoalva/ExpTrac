import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, FileText, Edit } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Subscription } from '@/types';


interface SubscriptionCardProps {
    subscription: Subscription;
    onDetail: (name: string) => void;
    onEdit: (subscription: SubscriptionCardProps['subscription']) => void;
    onDelete: (name: string) => void;
}

const SubscriptionCard = ({ subscription, onDetail, onEdit, onDelete }: SubscriptionCardProps) => {
    const { name, amount, currency, billing_date, repeat, reminder_before, category } = subscription;

    const formattedAmount = formatCurrency(amount) + ` /${repeat}`;
    const formattedDate = formatDate(billing_date);

    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={[colors.primaryDark, '#8A6BA6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardGradient}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{name}</Text>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Amount:</Text>
                        <Text style={styles.cardValue}>{formattedAmount}</Text>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onDetail(name)}
                        >
                            <FileText size={16} color="white" />
                            <Text style={styles.actionText}>Detail</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Next bill:</Text>
                        <Text style={styles.cardValue}>{formattedDate}</Text>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onEdit(subscription)}
                        >
                            <Edit size={16} color="white" />
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cardRow}>
                        <Text style={styles.cardLabel}>Reminder:</Text>
                        <Text style={styles.cardValue}>{reminder_before}</Text>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => onDelete(name)}
                        >
                            <Trash2 size={16} color="#FF8A8A" />
                            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    
    cardContainer: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardGradient: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardHeader: {
      padding: 16,
      paddingBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    cardContent: {
      padding: 16,
      paddingTop: 0,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardLabel: {
      fontSize: 16,
      color: 'white',
      marginRight: 8,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
      flex: 1,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    actionText: {
      color: 'white',
      marginLeft: 4,
      fontSize: 14,
    },
    deleteText: {
      color: '#FF8A8A',
    },
  });
  

export default SubscriptionCard;