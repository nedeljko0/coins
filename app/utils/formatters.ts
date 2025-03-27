import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { fonts, fontWeights } from '../theme/fonts';

export const formatCurrency = (amount: number, currency: string): string => {
  const formattedNumber = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: currency === 'BTC' ? 8 : 0,
    maximumFractionDigits: currency === 'BTC' ? 8 : 2,
    useGrouping: false,
  }).format(amount);

  return `${formattedNumber} ${currency}`;
};

export const formatPrice = (amount: number): string => {
  // First format with 2 decimal places
  const withDecimals = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);

  // If it ends with .00, remove the decimals
  const finalNumber = withDecimals.endsWith('.00')
    ? withDecimals.slice(0, -3)
    : withDecimals;

  return `${finalNumber} €`;
};

interface StyledCurrencyTextProps {
  amount: number;
  currency: string;
  style?: TextStyle;
}

export const StyledCurrencyText: React.FC<StyledCurrencyTextProps> = props => {
  const formattedNumber = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: props.currency === 'BTC' ? 8 : 0,
    maximumFractionDigits: props.currency === 'BTC' ? 8 : 2,
    useGrouping: false,
  }).format(props.amount);

  return React.createElement(
    Text,
    { style: [props.style] },
    React.createElement(Text, { style: styles.numberPart }, formattedNumber),
    React.createElement(
      Text,
      { style: styles.currencyPart },
      ` ${props.currency}`,
    ),
  );
};

const styles = StyleSheet.create({
  numberPart: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.regular,
  },
  currencyPart: {
    fontFamily: fonts.regular,
    fontWeight: fontWeights.semiBold,
  },
});
