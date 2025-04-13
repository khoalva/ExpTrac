import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import Avatar from '@/components/ui/Avatar';
import { formatCurrency } from '@/utils/formatters';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { Card } from '@/components/ui/Card';
import { ChevronDown } from 'lucide-react-native';

export default function StatisticsScreen() {
  console.log('StatisticsScreen rendered');
  const user = useUserStore(state => state.user);
  const getTotalIncome = useTransactionStore(state => state.getTotalIncome);
  const getTotalExpense = useTransactionStore(state => state.getTotalExpense);
  const getTotalBalance = useWalletStore(state => state.getTotalBalance);
  
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  
  // Mock data for charts
  const cashFlowData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [750, 250, 650, 250, 400, 320, 250],
        color: '#F8B195',
        label: 'Income',
      },
      {
        data: [450, 900, 150, 400, 200, 700, 500],
        color: '#6A8EAE',
        label: 'Expense',
      },
    ],
  };
  
  const expenseCategories = [
    { value: 45, color: '#FF6B6B', label: 'Transport' },
    { value: 25, color: '#4ECDC4', label: 'Food' },
    { value: 15, color: '#FFD166', label: 'Shopping' },
    { value: 10, color: '#6A0572', label: 'Entertainment' },
    { value: 5, color: '#1A535C', label: 'Others' },
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
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Current Balance</Text>
          <View style={styles.totalBalance}>
            <Text style={styles.balanceAmount}>
              {formatCurrency(1500000)}
            </Text>
            <TouchableOpacity style={styles.walletButton}>
              <Text style={styles.walletButtonText}>My Wallet</Text>
              <ChevronDown size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>All accounts</Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>{selectedPeriod}</Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, styles.incomeItem]}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(1500000)}
              </Text>
              <Text style={styles.summaryIcon}>🐷</Text>
            </View>
            
            <View style={[styles.summaryItem, styles.expenseItem]}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(500000)}
              </Text>
              <Text style={styles.summaryIcon}>🔥</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash Flow</Text>
          <BarChart data={cashFlowData} height={200} />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Analysis</Text>
          <PieChart data={expenseCategories} size={200} />
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  totalBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  walletButtonText: {
    color: 'white',
    marginRight: 4,
  },
  filterRow: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  incomeItem: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  expenseItem: {
    backgroundColor: colors.primaryDark,
    marginLeft: 8,
  },
  summaryLabel: {
    color: 'white',
    marginBottom: 4,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
});