import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore } from '@/stores/walletStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Avatar from '@/components/ui/Avatar';
import { formatCurrency } from '@/utils/formatters';
import { 
  Bell, 
  Settings, 
  BarChart3, 
  Target, 
  Wallet, 
  FileText, 
  FileSpreadsheet, 
  LightbulbIcon 
} from 'lucide-react-native';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const getTotalIncome = useTransactionStore(state => state.getTotalIncome);
  const getTotalExpense = useTransactionStore(state => state.getTotalExpense);
  const getTotalBalance = useWalletStore(state => state.getTotalBalance);
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Mock data for carousel
  const carouselData = [
    {
      id: '1',
      title: 'Today expense',
      amount: formatCurrency(500000),
      icon: '🔥',
      bgColor: colors.primaryDark,
    },
    {
      id: '2',
      title: 'Savings',
      amount: formatCurrency(1500000),
      icon: '🐷',
      bgColor: '#1A1625',
    },
    {
      id: '3',
      title: 'Investments',
      amount: formatCurrency(2500000),
      icon: '📈',
      bgColor: colors.primaryDark,
    },
  ];
  
  // Feature grid items
  const features = [
    {
      id: '1',
      title: 'Statistics',
      icon: <BarChart3 size={32} color="#FF6384" />,
      onPress: () => router.push('/(tabs)/statistics'),
    },
    {
      id: '2',
      title: 'Budget',
      icon: <Target size={32} color="#FF9F40" />,
      onPress: () => router.push('/(tabs)/budget'),
    },
    {
      id: '3',
      title: 'My Wallet',
      icon: <Wallet size={32} color="#FF9F40" />,
      onPress: () => router.push('/wallet'),
    },
    {
      id: '4',
      title: 'Transactions',
      icon: <FileText size={32} color="#36A2EB" />,
      onPress: () => router.push('/(tabs)/history'),
    },
    {
      id: '5',
      title: 'Subscription',
      icon: <FileSpreadsheet size={32} color="#4BC0C0" />,
      onPress: () => router.push('/subscription'),
    },
    {
      id: '6',
      title: 'Saving suggestion',
      icon: <LightbulbIcon size={32} color="#9966FF" />,
      onPress: () => router.push('/saving-tips'),
    },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar source={user?.avatar} name={user?.name} size={48} />
            <View style={styles.greeting}>
              <Text style={styles.welcomeText}>Have a nice day!</Text>
              <Text style={styles.nameText}>{user?.name}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/profile')}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Summary Cards Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.carousel}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / (event.nativeEvent.layoutMeasurement.width - 40)
            );
            setCurrentSlide(slideIndex);
          }}
        >
          {carouselData.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.summaryCard, 
                { backgroundColor: item.bgColor }
              ]}
            >
              {/* Circular background elements */}
              <View style={styles.circleBackground}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardIcon}>{item.icon}</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>{item.amount}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        {/* Carousel Indicators */}
        <View style={styles.indicators}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
        
        {/* Curved bottom edge */}
        <View style={styles.curvedEdge} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={feature.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconContainer}>
                {feature.icon}
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Notification Permission Modal */}
      <Modal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="Allow Notification Access?"
        showCloseButton={false}
      >
        <Text style={styles.modalText}>
          To automatically track your expenses from transaction notifications, ExpTrac needs access to your device's notifications.
        </Text>
        
        <View style={styles.modalButtons}>
          <Button
            title="Allow"
            onPress={() => setShowNotificationModal(false)}
            style={styles.allowButton}
          />
          <Button
            title="Maybe Later"
            variant="outline"
            onPress={() => setShowNotificationModal(false)}
            style={styles.laterButton}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    backgroundColor: colors.background,
    paddingBottom: 30,
    position: 'relative',
    zIndex: 1,
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
  greeting: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  carousel: {
    paddingHorizontal: 20,
  },
  summaryCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -20,
    left: -20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  cardIcon: {
    fontSize: 24,
  },
  amountContainer: {
    marginTop: 16,
    zIndex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  curvedEdge: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    transform: [{ scaleY: -1 }],
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allowButton: {
    flex: 1,
    marginRight: 8,
  },
  laterButton: {
    flex: 1,
    marginLeft: 8,
  },
});