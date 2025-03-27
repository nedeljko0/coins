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
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { executeTrade } from '../../store/features/portfolio';
import { RootState } from '../../store';
import { fonts, fontWeights } from '../../theme/fonts';

interface TradeModalProps {
  visible: boolean;
  onClose: () => void;
  currentPrice: number;
}

const validateNumericInput = (value: string): boolean => {
  if (value === '') {
    return true;
  }
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
  const [error, setError] = useState<string | null>(null);

  const { balance, btcAmount: availableBtc } = useSelector(
    (state: RootState) => state.portfolio,
  );

  const handleEurChange = (value: string) => {
    setError(null);
    if (!validateNumericInput(value)) {
      setError('Please enter a valid number');
      return;
    }

    setEurAmount(value);
    const numValue = parseFloat(value) || 0;
    setBtcAmount(numValue === 0 ? '' : (numValue / currentPrice).toFixed(8));
  };

  const handleBtcChange = (value: string) => {
    setError(null);
    if (!validateNumericInput(value)) {
      setError('Please enter a valid number');
      return;
    }

    setBtcAmount(value);
    const numValue = parseFloat(value) || 0;
    setEurAmount(numValue === 0 ? '' : (numValue * currentPrice).toFixed(2));
  };

  const validateTrade = (type: 'buy' | 'sell', amount: number): boolean => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    const total = amount * currentPrice;
    if (type === 'buy' && total > balance) {
      setError('Insufficient balance');
      return false;
    }

    if (type === 'sell' && amount > availableBtc) {
      setError('Insufficient BTC');
      return false;
    }

    return true;
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    try {
      const amount = parseFloat(btcAmount);
      if (!validateTrade(type, amount)) {
        return;
      }

      dispatch(executeTrade({ type, amount, price: currentPrice }));
      onClose();
      setEurAmount('');
      setBtcAmount('');
      setError(null);
    } catch (err) {
      setError('Failed to execute trade. Please try again.');
      console.error('Trade error:', err);
    }
  };

  const handleClose = () => {
    setError(null);
    setEurAmount('');
    setBtcAmount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Image
              source={require('../../../assets/close.png')}
              style={styles.closeButtonImage}
            />
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

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
    margin: 26,
    borderRadius: 12,
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  closeButtonImage: {
    width: 24,
    height: 24,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0000000A',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 26,
    height: 48,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 16,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#0000003D',
    height: 28,
    marginTop: 1,
    fontFamily: fonts.regular,
  },
  currencyLabel: {
    color: '#74CDDC',
    fontSize: 12,
    marginLeft: 10,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 4,
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
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
});
