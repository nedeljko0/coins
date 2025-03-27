import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useBitcoinPrice } from '../hooks/useBitcoinPrice';
import { PriceChart } from '../components/Chart';
import { formatCurrency, formatPrice } from '../utils/formatters';
import TradeModal from '../components/modals/TradeModal';
import { RootState } from '../store';
import { TransactionList } from '../components/TransactionList';
import { fonts, fontWeights } from '../theme/fonts';

export default function HomeScreen() {
  const [isTradeModalVisible, setTradeModalVisible] = useState(false);
  const { currentPrice, historicalData, prevClose, priceChange } =
    useBitcoinPrice();
  const { btcAmount, profitLoss, balance } = useSelector(
    (state: RootState) => state.portfolio,
  );

  console.log('currentPrice is', currentPrice);

  const [priceAnimation] = useState(new Animated.Value(1));

  const animatePrice = useCallback(() => {
    Animated.sequence([
      Animated.timing(priceAnimation, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(priceAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [priceAnimation]);

  React.useEffect(() => {
    if (currentPrice) {
      animatePrice();
    }
  }, [currentPrice, animatePrice]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require('../../assets/bison.png')}
              style={styles.logoImage}
            />
          </View>
          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceAmount}>
              <Text style={styles.numberPart}>
                {Number(btcAmount).toLocaleString('en-US', {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8,
                  useGrouping: false,
                })}
              </Text>
              <Text style={styles.currencyPart}> BTC</Text>
            </Text>
            <Text style={styles.balanceEur}>
              <Text style={styles.numberPart}>
                {Number(balance).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                  useGrouping: false,
                })}
              </Text>
              <Text style={styles.currencyPart}> EUR</Text>
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.btcLabel}>BTC</Text>
          <Animated.Text
            style={[
              styles.priceText,
              { transform: [{ scale: priceAnimation }] },
            ]}>
            {currentPrice ? formatPrice(currentPrice) : '...'}
          </Animated.Text>

          <Text
            style={[
              styles.pnlLabel,
              profitLoss >= 0 ? styles.profit : styles.loss,
            ]}>
            PnL:{' '}
            <Text style={styles.pnlText}>
              {formatCurrency(profitLoss, '€')}
            </Text>
          </Text>
        </View>
        {historicalData && (
          <PriceChart
            data={historicalData}
            prevClose={prevClose}
            priceChange={priceChange}
          />
        )}

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
    paddingHorizontal: 26,
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
    fontFamily: fonts.regular,
  },
  balanceAmount: {
    color: '#000000',
    fontSize: 12,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
  balanceEur: {
    color: '#000000',
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  btcLabel: {
    color: '#202020',
    fontSize: 24,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
  priceText: {
    color: '#202020',
    fontSize: 24,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
    marginVertical: 8,
  },
  pnlLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.regular,
  },
  pnlText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
  profit: {
    color: '#4CAF50',
  },
  loss: {
    color: '#F44336',
  },
  tradeButton: {
    backgroundColor: '#153243',
    marginHorizontal: 26,
    marginVertical: 4,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
  numberPart: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.regular,
  },
  currencyPart: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
});
