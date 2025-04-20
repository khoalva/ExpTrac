import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import Avatar from '@/components/ui/Avartar';
import { Button } from '@/components/ui/button';
import SuccessModal from '@/components/modals/SuccessModal';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react-native';

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
            <TouchableOpacity style={styles.selectButton}>
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
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Pick date</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formRow}>
          <View style={styles.labelColumn}>
            <Text style={styles.label}>Repeat</Text>
          </View>
          
          <View style={styles.inputColumn}>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Repeat</Text>
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
        
        <View style={styles.formRow}>
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
  selectButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
  },
});