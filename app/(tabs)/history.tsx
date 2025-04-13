import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import Avatar from '@/components/ui/Avatar';
import TransactionItem from '@/components/cards/TransactionItem';
import { Search, X, ChevronDown } from 'lucide-react-native';

export default function HistoryScreen() {
  const user = useUserStore(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock transaction data
  const transactions: Array<{
    id: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    categoryId: string;
    date: Date;
    walletId: string;
    wallet: string;
    isRecurring?: boolean;
    nextBillDate?: Date;
  }> = [
    {
      id: '1',
      amount: 200000,
      type: 'expense',
      category: 'Food',
      categoryId: '1',
      date: new Date('2025-04-20'),
      walletId: '1',
      wallet: 'Main Wallet',
    },
    {
      id: '2',
      amount: 50000,
      type: 'expense',
      category: 'Drink',
      categoryId: '2',
      date: new Date('2025-04-12'),
      walletId: '1',
      wallet: 'Main Wallet',
      isRecurring: true,
      nextBillDate: new Date('2025-04-12'),
    },
    {
      id: '3',
      amount: 600000,
      type: 'income',
      category: 'Scholarship',
      categoryId: '13',
      date: new Date('2025-04-10'),
      walletId: '1',
      wallet: 'Main Wallet',
      isRecurring: true,
      nextBillDate: new Date('2025-04-12'),
    },
    {
      id: '4',
      amount: 100000,
      type: 'income',
      category: 'Part-time job',
      categoryId: '14',
      date: new Date('2025-04-05'),
      walletId: '1',
      wallet: 'Main Wallet',
      isRecurring: true,
      nextBillDate: new Date('2025-04-08'),
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar source={user?.avatar} name={user?.name} size={40} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Transaction history</Text>
        
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
        
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Date Range</Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Category</Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.transactionList}
          showsVerticalScrollIndicator={false}
        >
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => {}}
              showActions
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  filterText: {
    color: colors.text,
    marginRight: 4,
  },
  transactionList: {
    flex: 1,
  },
});