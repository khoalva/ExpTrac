import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/Colors';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color: string;
      label: string;
    }[];
  };
  height?: number;
  width?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  width = screenWidth - 40,
  showLabels = true,
  showLegend = true,
  showValues = false,
}) => {
  const maxValue = Math.max(
    ...data.datasets.flatMap(dataset => dataset.data)
  );
  
  // Calculate bar width based on number of labels and datasets
  const barCount = data.labels.length * data.datasets.length;
  const barWidth = (width - 40) / barCount;
  const groupWidth = barWidth * data.datasets.length;
  
  return (
    <View style={[styles.container, { height, width }]}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={styles.axisLabel}>{maxValue}</Text>
        <Text style={styles.axisLabel}>{Math.round(maxValue * 0.75)}</Text>
        <Text style={styles.axisLabel}>{Math.round(maxValue * 0.5)}</Text>
        <Text style={styles.axisLabel}>{Math.round(maxValue * 0.25)}</Text>
        <Text style={styles.axisLabel}>0</Text>
      </View>
      
      <View style={styles.chartArea}>
        {/* Horizontal grid lines */}
        <View style={[styles.gridLine, { top: 0 }]} />
        <View style={[styles.gridLine, { top: '25%' }]} />
        <View style={[styles.gridLine, { top: '50%' }]} />
        <View style={[styles.gridLine, { top: '75%' }]} />
        <View style={[styles.gridLine, { top: '100%' }]} />
        
        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.labels.map((label, labelIndex) => (
            <View key={labelIndex} style={[styles.barGroup, { width: groupWidth }]}>
              {data.datasets.map((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex] || 0;
                const barHeight = (value / maxValue) * (height - 40);
                
                return (
                  <View 
                    key={`${labelIndex}-${datasetIndex}`} 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: dataset.color,
                        width: barWidth - 4,
                      }
                    ]}
                  >
                    {showValues && (
                      <Text style={styles.barValue}>{value}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* X-axis labels */}
        {showLabels && (
          <View style={styles.xAxis}>
            {data.labels.map((label, index) => (
              <View 
                key={index} 
                style={[styles.xAxisLabel, { width: groupWidth }]}
              >
                <Text style={styles.xAxisText}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {data.datasets.map((dataset, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: dataset.color }
                ]} 
              />
              <Text style={styles.legendText}>{dataset.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 10,
    paddingBottom: 20,
  },
  barGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bar: {
    marginHorizontal: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  xAxisLabel: {
    alignItems: 'center',
  },
  xAxisText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    position: 'absolute',
    bottom: -20,
    left: 40,
    right: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default BarChart;