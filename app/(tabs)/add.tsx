import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// This is just a placeholder screen that redirects to the transaction creation screen
export default function AddScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to transaction creation screen
    router.replace('/transaction/new');
  }, []);
  
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});