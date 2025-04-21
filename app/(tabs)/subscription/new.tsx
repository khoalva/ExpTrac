import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import Avatar from '@/components/ui/Avartar';
import { Button } from '@/components/ui/button';
import SuccessModal from '@/components/modals/SuccessModal';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewSubscriptionScreen() {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('VND');
  const [billingDate, setBillingDate] = useState('');
  const [repeat, setRepeat] = useState('');
  const [reminder, setReminder] = useState('');
  const [category, setCategory] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  
  // Add these new states for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
    // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    
    if (event.type === 'set' || Platform.OS === 'ios') {
      // Format date as DD/MM/YYYY
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      setBillingDate(`${day}/${month}/${year}`);
    }
  };

  // Currency options
  const currencies = [
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  const repeatOptions = [
    { id: 'once', label: 'Once' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  // Currency selection handler
  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency.code);
    setShowCurrencyPicker(false);
  };

  const handleRepeatSelect = (selectedRepeat) => {
    setRepeat(selectedRepeat.label);
    setShowRepeatPicker(false);
  };

  const handleAddSubscription = () => {
    // Validate inputs
    if (!name || !amount) {
      // Show error
      return;
    }
    
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
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>New Subscription</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Subscription Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Subscription Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.formColumn}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formColumn, styles.currencyColumn]}>
            <Text style={styles.label}>Currency</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowCurrencyPicker(true)}
            >
              <Text style={styles.selectButtonText}>{currency}</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Billing date</Text>
          </View>
          
          <View style={styles.inputColumn}>
            <TouchableOpacity style={styles.selectButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={billingDate ? styles.selectButtonTextSelected : styles.selectButtonText}>
                {billingDate || "Pick date"}
              </Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Repeat</Text>
          </View>
          
          <View style={styles.inputColumn}>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowRepeatPicker(true)}
            >
              <Text style={repeat ? styles.selectButtonTextSelected : styles.selectButtonText}>
                {repeat || "Repeat"}
              </Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Reminder before</Text>
          </View>
          
          <View style={styles.inputColumn}>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Reminder</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formRow}>``
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Category</Text>
          </View>
          
          <View style={styles.inputColumn}>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Category</Text>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Button
          title="Add Subscription"
          onPress={handleAddSubscription}
          style={styles.addButton}
        />
      </ScrollView>
       {/* Currency Selection Modal */}
       <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    currency === item.code && styles.selectedCurrencyItem
                  ]}
                  onPress={() => handleCurrencySelect(item)}
                >
                  <Text style={[
                    styles.currencyCode, 
                    currency === item.code && styles.selectedCurrencyText
                  ]}>
                    {item.code}
                  </Text>
                  <Text style={[
                    styles.currencyName,
                    currency === item.code && styles.selectedCurrencyText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      {/* Repeat Selection Modal */}
      <Modal
        visible={showRepeatPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRepeatPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Repeat</Text>
              <TouchableOpacity onPress={() => setShowRepeatPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={repeatOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    repeat === item.label && styles.selectedOptionItem
                  ]}
                  onPress={() => handleRepeatSelect(item)}
                >
                  <Text style={[
                    styles.optionText, 
                    repeat === item.label && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        message="You have added a new subscription successfully."
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  selectButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  selectButtonTextSelected: {
    fontSize: 16,
    color: colors.text,
  },
  notificationIcon: {
    fontSize: 24,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: colors.text,
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  formColumn: {
    flex: 1,
    marginRight: 12,
  },
  currencyColumn: {
    flex: 0.5,
    marginRight: 0,
  },
  labelColumn: {
    flex: 0.4,
    justifyContent: 'center',
  },
  inputColumn: {
    flex: 0.6,
  },
  label: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingVertical: 14,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
  },
  // Add new styles for currency modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 4,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedCurrencyItem: {
    backgroundColor: colors.primaryLight,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    width: 60,
  },
  currencyName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  selectedCurrencyText: {
    color: colors.primaryDark,
  },
  // Add these styles if they don't already exist
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOptionItem: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
});