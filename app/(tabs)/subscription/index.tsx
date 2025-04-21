
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import Avatar from '@/components/ui/Avartar';
import { Bell, Settings, Search, X, Plus, FileText, Edit, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { subscriptionService } from '@/service/Subcription';
import { db } from '@/service/database';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Subscription } from '@/types';
// Mock subscription data
// const subscriptions = [
//   {
//     id: '1',
//     name: 'Netflix',
//     amount: 200000,
//     frequency: 'month',
//     billing_date: new Date('2025-04-20'),
//     reminder: '3 days before',
//   },
//   {
//     id: '2',
//     name: 'Electricity',
//     amount: 100000,
//     frequency: 'month',
//     billing_date: new Date('2025-04-12'),
//     reminder: '2 days before',
//   },
//   {
//     id: '3',
//     name: 'ChatGPT Premium',
//     amount: 600000,
//     frequency: 'month',
//     billing_date: new Date('2025-04-12'),
//     reminder: 'No reminder',
//   },
// ];

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

export default function SubscriptionScreen() {
    const router = useRouter();
    const user = useUserStore(state => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);

    // Initialize database and load subscriptions
    useEffect(() => {
        const initialize = async () => {
            try {
                await db.initDatabase();
                await loadSubscriptions();
            } catch (error) {
                console.error('Error initializing database:', error);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, []);

    // Load subscriptions
    const loadSubscriptions = async () => {
        try {
            const data = await subscriptionService.getAllSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    };

    // Handle search
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setIsLoading(true);
        try {
            const data = query
                ? await subscriptionService.searchSubscriptionsByName(query)
                : await subscriptionService.getAllSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error searching subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle add subscription
    const handleAddSubscription = async (formData) => {
        try {
            await subscriptionService.createSubscription({
                name: formData.name,
                amount: parseInt(formData.amount),
                frequency: formData.frequency,
                billing_date: formData.billing_date,
                reminder: formData.reminder,
            });
            await loadSubscriptions();
            setModalVisible(false);
        } catch (error) {
            console.error('Error adding subscription:', error);
        }
    };

    // Handle edit subscription
    const handleEditSubscription = (subscription) => {
        setEditingSubscription(subscription);
        setModalVisible(true);
    };

    // Handle update subscription
    const handleUpdateSubscription = async (formData) => {
        try {
            await subscriptionService.updateSubscription(editingSubscription.id, {
                name: formData.name,
                amount: parseInt(formData.amount),
                frequency: formData.frequency,
                billing_date: formData.billing_date,
                reminder: formData.reminder,
            });
            await loadSubscriptions();
            setModalVisible(false);
            setEditingSubscription(null);
        } catch (error) {
            console.error('Error updating subscription:', error);
        }
    };

    // Handle delete subscription
    const handleDeleteSubscription = async (id: string) => {
        try {
            await subscriptionService.deleteSubscription(id);
            await loadSubscriptions();
        } catch (error) {
            console.error('Error deleting subscription:', error);
        }
    };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar source={user?.avatar} name={user?.name} size={48} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userDate}>01/01/2004</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/profile')}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.curvedEdge} />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your Subscriptions</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.addButtonContainer}>
          <Text style={styles.addButtonText}>Add subscriptions</Text>
          <TouchableOpacity style={styles.addButton}
            onPress={() => router.push('./subscription/new')}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.subscriptionsList}>
          {subscriptions.map((subscription) => (
            <SubscriptionCard 
              key={subscription.id} 
              subscription={subscription}
              onDetail={(id) => router.push(`./subscription/${id}`)}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  userDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  curvedEdge: {
    height: 20,
    backgroundColor: colors.background,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionsList: {
    marginBottom: 20,
  },
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
