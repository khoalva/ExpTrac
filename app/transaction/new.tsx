import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Input from '@/components/ui/Input';
import SuccessModal from '@/components/modals/SuccessModal';
import { ChevronDown, ChevronRight, Calendar, Plus } from 'lucide-react-native';

export default function NewTransactionScreen() {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const addTransaction = useTransactionStore(state => state.addTransaction);
  
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [wallet, setWallet] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const handleAddTransaction = () => {
    // Validate inputs
    if (!amount || !category || !wallet) {
      // Show error
      return;
    }
    
    // Create transaction object
    const transaction = {
      amount: parseFloat(amount),
      type: transactionType as 'income' | 'expense',
      category,
      categoryId: '1', // This would be selected from a list
      date,
      walletId: '1', // This would be selected from a list
      wallet,
      note,
      isRecurring,
    };
    
    // Add transaction
    addTransaction(transaction);
    
    // Show success modal
    setShowSuccessModal(true);
  };
  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
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
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>New Transaction</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Type</Text>
          <SegmentedControl
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
            selectedValue={transactionType}
            onChange={setTransactionType}
            style={styles.segmentedControl}
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.formColumn}>
            <Text style={styles.sectionLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formColumn}>
            <Text style={styles.sectionLabel}>Curency</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>VND</Text>
              <ChevronDown size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Pick date</Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Wallet</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Choose Wallet</Text>
            <ChevronRight size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Category</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Category</Text>
            <ChevronRight size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Repeat</Text>
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Repeat</Text>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Note"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Add a picture</Text>
          <TouchableOpacity style={styles.addPictureButton}>
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <Button
          title="Add Transaction"
          onPress={handleAddTransaction}
          style={styles.addButton}
        />
      </ScrollView>
      
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        message="You have ADD A TRANSACTION successfully. You can view your transaction in transaction history"
      />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
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
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  segmentedControl: {
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  noteInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addPictureButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});