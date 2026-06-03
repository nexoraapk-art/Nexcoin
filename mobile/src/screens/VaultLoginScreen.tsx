import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export default function VaultLoginScreen({ navigation }) {
  const [mnemonic, setMnemonic] = useState('');
  const correct = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const handleLogin = () => {
    if (mnemonic.trim() === correct) {
      navigation.replace('Home');
    } else {
      Alert.alert('Access Denied', 'Invalid 12-word phrase');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nexcoin Treasury</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 12 words"
        placeholderTextColor="#aaa"
        value={mnemonic}
        onChangeText={setMnemonic}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Unlock Vault</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.backgroundDark },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textWhite, marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: colors.cardDark, color: colors.textWhite, borderRadius: 16, padding: 16, marginBottom: 20, minHeight: 100 },
  button: { backgroundColor: colors.primary, borderRadius: 16, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
