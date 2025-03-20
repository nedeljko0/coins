import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { LineChart, yAxisSides } from 'react-native-gifted-charts';

interface PriceChartProps {
  data: number[];
}

const PointerLabel = ({ value }: { value: number }) => (
  <View style={styles.pointerView}>
    <Text style={styles.pointerText}>{value}</Text>
  </View>
);

export function PriceChart({ data }: PriceChartProps) {
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

  const normalizedData = data.map(value => ({
    value: value - minValue,
    showValue: value,
  }));

  return (
    <View style={styles.container}>
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
        yAxisLabelWidth={60}
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
        noOfSections={6}
        showDataPointOnFocus
        showStripOnFocus
        stripColor="#4ECDC4"
        stripOpacity={0.1}
        stripWidth={1}
        disableScroll={true}
        adjustToWidth={true}
        formatYLabel={label => Math.round(Number(label) + minValue).toString()}
      />
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
    right: 20,
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
});
