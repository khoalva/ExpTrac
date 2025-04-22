
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import Avatar from '@/components/ui/Avartar';
import { Bell, Settings, Search, X, Plus } from 'lucide-react-native';
import subScriptionStore from '@/stores/subscriptionStore';
import { Subscription } from '@/types';
import SubscriptionCard from '@/components/cards/SubscriptionCard';


export default function SubscriptionScreen() {
  const router = useRouter();
    const user = useUserStore(state => state.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Initialize and load subscriptions
    useEffect(() => {
        const initialize = async () => {
            // Let subScriptionStore handle database initialization internally
            const data = await subScriptionStore.fetchAllSubscriptions();
            
            setSubscriptions(data);
            setIsLoading(false);
        };
        initialize();
    }, []);

    // Load subscriptions - simplified
    const loadSubscriptions = async () => {
        
        const data = await subScriptionStore.fetchAllSubscriptions();
        
        setSubscriptions(data);
    };

    // Handle search - simplified
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setIsLoading(true);
        
        const data = query
            ? await subScriptionStore.searchSubscriptions(query)
            : await subScriptionStore.fetchAllSubscriptions();
        
        setSubscriptions(data);
        setIsLoading(false);
    };

    // Handle add subscription - simplified
    const handleAddSubscription = async (formData) => {
        await subScriptionStore.createSubscription({
          name: formData.name,
          amount: parseInt(formData.amount),
          currency: formData.currency,
          billing_date: formData.billing_date,
          reminder_before: formData.reminder,
          category: formData.category,
          repeat: formData.repeat,
        });
        
        await loadSubscriptions();
        setModalVisible(false);
    };

    // Handle edit subscription
    const handleEditSubscription = (subscription : Subscription) => {
        setEditingSubscription(subscription);
        setModalVisible(true);
    };

    // Handle update subscription - simplified
    const handleUpdateSubscription = async (formData) => {
        if (!editingSubscription) return;
        await subScriptionStore.updateSubscription(editingSubscription.name, {
            name: formData.name,
            amount: parseInt(formData.amount),
            currency: formData.currency,
            billing_date: formData.billing_date,
            reminder_before: formData.reminder,
            category: formData.category,
            repeat: formData.repeat,
        });
        
        await loadSubscriptions();
        setModalVisible(false);
        setEditingSubscription(null);
    };

    // Handle delete subscription - simplified
    const handleDeleteSubscription = async (id: string) => {
        await subScriptionStore.deleteSubscription(id);
        await loadSubscriptions();
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
              key={subscription.name} 
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
