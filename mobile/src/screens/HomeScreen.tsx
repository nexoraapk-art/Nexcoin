import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Nexcoin Wallet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundDark },
  text: { color: colors.textWhite, fontSize: 24 },
});
