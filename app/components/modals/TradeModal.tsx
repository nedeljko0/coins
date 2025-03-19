import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { executeTrade } from '../../store/features/portfolio';

interface TradeModalProps {
  visible: boolean;
  onClose: () => void;
  currentPrice: number;
}

const validateNumericInput = (value: string): boolean => {
  // Allow empty string
  if (value === '') {
    return true;
  }
  // Allow numbers with optional decimal point
  // This regex allows: "0", "1", "1.0", "0.01", but not ".", ".1", "1.", "1.1.1", "abc"
  return /^(?!0\d)\d*\.?\d*$/.test(value);
};

export default function TradeModal({
  visible,
  onClose,
  currentPrice,
}: TradeModalProps) {
  const dispatch = useDispatch();
  const [eurAmount, setEurAmount] = useState('');
  const [btcAmount, setBtcAmount] = useState('');

  const handleEurChange = (value: string) => {
    if (!validateNumericInput(value)) {
      return;
    }

    setEurAmount(value);
    const numValue = parseFloat(value) || 0;
    setBtcAmount(numValue === 0 ? '' : (numValue / currentPrice).toFixed(8));
  };

  const handleBtcChange = (value: string) => {
    if (!validateNumericInput(value)) {
      return;
    }

    setBtcAmount(value);
    const numValue = parseFloat(value) || 0;
    setEurAmount(numValue === 0 ? '' : (numValue * currentPrice).toFixed(2));
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(btcAmount);
    if (amount > 0) {
      dispatch(
        executeTrade({
          type,
          amount,
          price: currentPrice,
        }),
      );
      onClose();
      setEurAmount('');
      setBtcAmount('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={eurAmount}
              onChangeText={handleEurChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
            />
            <Text style={styles.currencyLabel}>EUR</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={btcAmount}
              onChangeText={handleBtcChange}
              keyboardType="decimal-pad"
              placeholder="0.00000000"
              placeholderTextColor="#999"
            />
            <Text style={styles.currencyLabel}>BTC</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buyButton]}
              onPress={() => handleTrade('buy')}>
              <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.sellButton]}
              onPress={() => handleTrade('sell')}>
              <Text style={styles.buttonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0000000A',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 24,
    padding: 15,
  },
  currencyLabel: {
    color: '#74CDDC',
    fontSize: 16,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buyButton: {
    backgroundColor: '#153243',
  },
  sellButton: {
    backgroundColor: '#153243',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
