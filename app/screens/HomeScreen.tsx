import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { PriceChart } from '../components/Chart';

import { formatCurrency } from '../utils/formatters';
import TradeModal from '../components/modals/TradeModal';
import { RootState } from '../store';
import { TransactionList } from '../components/TransactionList';

export default function HomeScreen() {
  const [isTradeModalVisible, setTradeModalVisible] = useState(false);
  const { currentPrice, historicalData } = useBitcoinPrice();
  const { btcAmount, profitLoss, balance } = useSelector(
    (state: RootState) => state.portfolio,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require('../assets/bison.png')}
              style={styles.logoImage}
            />
          </View>
          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceAmount}>{btcAmount.toFixed(8)} BTC</Text>
            <Text style={styles.balanceEur}>
              {formatCurrency(balance, 'EUR')}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.btcLabel}>BTC</Text>
          <Text style={styles.priceText}>
            {currentPrice ? formatCurrency(currentPrice, 'EUR') : '...'}
          </Text>

          <Text
            style={[
              styles.pnlText,
              profitLoss >= 0 ? styles.profit : styles.loss,
            ]}>
            PnL: {formatCurrency(profitLoss, 'EUR')}
          </Text>
        </View>
        {historicalData && <PriceChart data={historicalData} />}

        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() => setTradeModalVisible(true)}>
          <Text style={styles.tradeButtonText}>Trade</Text>
        </TouchableOpacity>
        <TransactionList />

        <TradeModal
          visible={isTradeModalVisible}
          onClose={() => setTradeModalVisible(false)}
          currentPrice={currentPrice || 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logo: {
    width: 52,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 52,
    height: 32,
    position: 'absolute',
  },
  balance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: '#000000',
    fontSize: 12,
  },
  balanceAmount: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceEur: {
    color: '#000000',
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  btcLabel: {
    color: '#202020',
    fontSize: 18,
    fontWeight: '600',
  },
  priceText: {
    color: '#202020',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  pnlText: {
    fontSize: 16,
    fontWeight: '600',
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#F44336',
  },
  tradeButton: {
    backgroundColor: '#153243',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
