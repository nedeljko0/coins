import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { formatDateTime } from '../utils/dateUtils';
import { Transaction } from '../store/features/portfolio';

export function TransactionList() {
  const transactions = useSelector(
    (state: RootState) => state.portfolio.transactions,
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === 'buy';
    const btcAmount = `${isPositive ? '+' : '-'}${item.amount.toFixed(4)} BTC`;
    const totalEurAmount = item.amount * item.price;
    const eurAmount = `${isPositive ? '+' : '-'}${totalEurAmount} €`;

    return (
      <View style={styles.transactionItem}>
        <View style={styles.leftContent}>
          <Text style={styles.type}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.amount}>
            {btcAmount} / {eurAmount}
          </Text>
        </View>
        <View style={styles.rightContent}>
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
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 16,
    flexGrow: 0,
    flexShrink: 1,
    marginVertical: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  type: {
    fontSize: 13,
    width: 28,
  },
  amount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 11,
    color: '#000000',
    textAlign: 'right',
  },
});
