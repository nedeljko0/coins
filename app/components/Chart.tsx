import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { LineChart, yAxisSides } from 'react-native-gifted-charts';

interface PriceChartProps {
  data: number[];
  prevClose: number | null;
  priceChange: {
    value: number | null;
    percentage: number | null;
  };
}

const PointerLabel = ({ value }: { value: number }) => (
  <View style={styles.pointerView}>
    <Text style={styles.pointerText}>{value}</Text>
  </View>
);

const getPrevClosePosition = (
  prevClose: number,
  minValue: number,
  range: number,
) => ({
  bottom: ((prevClose - minValue) / range) * 100,
  //  transform: [{ translateY: -32 }],
});

export function PriceChart({ data, prevClose }: PriceChartProps) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(
    null,
  );
  const chartWidth = Dimensions.get('window').width - 80;

  if (data.length < 2) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>
          No data available to display the chart.
        </Text>
      </View>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;
  const lastPrice = data[data.length - 1];

  const normalizedData = data.map(value => ({
    value: value - minValue,
    showValue: value,
  }));

  console.log('prev close', prevClose);
  console.log('last price', lastPrice);

  // Calculate evenly distributed values for the y-axis
  const getYAxisLabels = () => {
    const step = range / 5; // 5 intervals for 6 labels
    const labels = [];
    const lastPricePosition = ((lastPrice - minValue) / range) * 5; // Calculate where lastPrice fits in the sequence

    for (let i = 0; i <= 5; i++) {
      const value = maxValue - step * i;
      const roundedValue = Math.round(value);

      // If this position is closest to lastPrice, use lastPrice instead
      if (
        Math.abs(i - (5 - lastPricePosition)) < 0.5 &&
        lastPrice !== maxValue &&
        lastPrice !== minValue
      ) {
        labels.push({
          value: lastPrice,
          isLastPrice: true,
        });
      } else {
        labels.push({
          value: roundedValue,
          isLastPrice: roundedValue === lastPrice,
        });
      }
    }

    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  const renderLabel = (label: { value: number; isLastPrice: boolean }) => {
    if (label.isLastPrice) {
      return (
        <View style={styles.lastPriceLabel}>
          <Text style={styles.lastPriceText}>{label.value}</Text>
        </View>
      );
    }
    return <Text style={styles.yAxisValue}>{label.value}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <LineChart
          data={normalizedData}
          width={chartWidth}
          height={220}
          spacing={chartWidth / (data.length - 1)}
          initialSpacing={5}
          endSpacing={0}
          color="#4ECDC4"
          thickness={3}
          hideDataPoints={false}
          dataPointsColor="#4ECDC4"
          dataPointsRadius={3}
          onFocus={(_: any, index: number) => setSelectedDataPoint(data[index])}
          focusEnabled
          textFontSize={12}
          textColor="#000"
          yAxisTextStyle={styles.yAxisText}
          yAxisLabelWidth={0}
          yAxisSide={yAxisSides.RIGHT}
          yAxisThickness={0}
          areaChart
          startFillColor="rgba(78, 205, 196, 0.3)"
          endFillColor="rgba(78, 205, 196, 0.05)"
          startOpacity={0.3}
          endOpacity={0.05}
          xAxisColor="transparent"
          yAxisColor="transparent"
          hideRules={true}
          maxValue={range}
          mostNegativeValue={0}
          noOfSections={4}
          showDataPointOnFocus
          showStripOnFocus
          stripColor="#4ECDC4"
          stripOpacity={0.1}
          stripWidth={1}
          disableScroll={true}
          adjustToWidth={true}
          formatYLabel={() => ''}
          showReferenceLine1={!!prevClose}
          referenceLine1Config={{
            thickness: 1,
            color: '#4ECDC4',
            dashWidth: 5,
            dashGap: 5,
          }}
          referenceLine1Position={prevClose ? prevClose - minValue : 0}
        />
        <View style={styles.rightLabelsContainer}>
          {/* Main y-axis labels */}
          <View style={styles.labelsStack}>
            {yAxisLabels.map((label, index) => (
              <View key={index} style={styles.labelRow}>
                {renderLabel(label)}
              </View>
            ))}
          </View>

          {/* Prev close label - positioned absolutely */}
          {prevClose && (
            <View
              style={[
                styles.prevCloseWrapper,
                getPrevClosePosition(prevClose, minValue, range),
              ]}>
              <View style={styles.prevCloseLabelBox}>
                <Text style={styles.prevCloseLabelText}>Prev close</Text>
              </View>
              <View style={styles.prevCloseValueBox}>
                <Text style={styles.prevCloseValueText}>{prevClose}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      {selectedDataPoint !== null && (
        <View style={styles.pointerLabelContainer}>
          <PointerLabel value={selectedDataPoint} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  noDataContainer: {
    height: 150,
    marginTop: 32,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'white',
  },
  pointerLabelContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  pointerView: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pointerText: {
    color: 'white',
    fontSize: 12,
  },
  yAxisText: {
    color: '#000000',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  prevCloseText: {
    fontSize: 12,
    color: '#666',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#4ECDC4',
  },
  negativeChange: {
    color: '#FF6B6B',
  },
  prevCloseLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevCloseLabelLeft: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  prevCloseLabelRight: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  prevCloseValueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  currentPriceLabel: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentPriceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  rightLabelsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
  },
  labelsStack: {
    height: '100%',
    paddingVertical: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 32,
  },
  labelRow: {
    height: 28,
    justifyContent: 'center',
  },
  prevCloseWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    position: 'absolute',
    right: 0,
  },
  prevCloseLabelBox: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  prevCloseLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  prevCloseValueBox: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  lastPriceLabel: {
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lastPriceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  yAxisValue: {
    fontSize: 12,
    color: '#000000',
    marginRight: 4,
  },
});
