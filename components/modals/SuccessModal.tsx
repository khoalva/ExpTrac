import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Check } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
  buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  message,
  buttonText = 'Okay',
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentStyle={styles.modalContent}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Check size={40} color={colors.primary} />
        </View>
        
        <Text style={styles.title}>SUCCESS</Text>
        <Text style={styles.message}>{message}</Text>
        
        <Button
          title={buttonText}
          onPress={onClose}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(93, 66, 117, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
});

export default SuccessModal;