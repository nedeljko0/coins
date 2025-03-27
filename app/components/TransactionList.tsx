import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { formatDateTime } from '../utils/dateUtils';
import { Transaction } from '../store/features/portfolio';
import { formatCurrency } from '../utils/formatters';
import { fonts, fontWeights } from '../theme/fonts';

export function TransactionList() {
  const transactions = useSelector(
    (state: RootState) => state.portfolio.transactions,
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === 'buy';
    const btcAmount = `${isPositive ? '+' : '-'}${item.amount.toFixed(5)} BTC`;
    const totalEurAmount = item.amount * item.price;
    const eurAmount = `${isPositive ? '+' : '-'}${formatCurrency(
      totalEurAmount,
      '€',
    )}`;

    return (
      <View style={styles.transactionItem}>
        <View style={styles.column}>
          <Text style={styles.type}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <View style={styles.middleColumn}>
          <Text style={styles.amount}>
            {btcAmount}
            <Text style={styles.separator}> / </Text>
            {eurAmount}
          </Text>
        </View>
        <View style={styles.dateColumn}>
          <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  if (!transactions.length) {
    return;
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={item => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F3F3',
    marginHorizontal: 26,
    borderRadius: 12,
    paddingVertical: 16,
    flexGrow: 0,
    flexShrink: 1,
    marginVertical: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  column: {
    width: 60,
    justifyContent: 'center',
  },
  type: {
    fontSize: 12,
    textAlign: 'left',
    fontFamily: fonts.regular,
  },
  amount: {
    fontSize: 12,
    textAlign: 'left',
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
  btcAmount: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.medium,
    color: '#000000',
  },
  eurAmount: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.medium,
    color: '#000000',
  },
  separator: {
    color: '#000000',
    opacity: 0.5,
    fontFamily: fonts.regular,
  },
  timestamp: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'left',
    fontFamily: fonts.regular,
  },
  dateColumn: {
    width: 55,
    justifyContent: 'center',
  },
  middleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
  },
});
