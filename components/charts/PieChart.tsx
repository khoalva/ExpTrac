import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/Colors';
import Svg, { G, Path, Circle } from 'react-native-svg';

interface PieChartProps {
  data: {
    value: number;
    color: string;
    label: string;
  }[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentage?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLabels = false,
  showLegend = true,
  showPercentage = true,
}) => {
  const radius = size / 2;
  const innerRadius = radius * 0.6; // For donut chart
  
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate segments
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    return {
      ...item,
      percentage,
    };
  });
  
  // Generate SVG paths for pie segments
  const generatePieSegments = () => {
    let cumulativeAngle = 0;
    
    return segments.map((segment, index) => {
      const angle = (segment.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + angle;
      cumulativeAngle = endAngle;
      
      // Convert angles to radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate points
      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);
      
      // Create path
      const largeArcFlag = angle > 180 ? 1 : 0;
      const path = `
        M ${radius} ${radius}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
      
      return (
        <Path
          key={index}
          d={path}
          fill={segment.color}
        />
      );
    });
  };
  
  // Generate SVG paths for donut segments
  const generateDonutSegments = () => {
    let cumulativeAngle = 0;
    
    return segments.map((segment, index) => {
      const angle = (segment.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + angle;
      cumulativeAngle = endAngle;
      
      // Convert angles to radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate outer points
      const outerX1 = radius + radius * Math.cos(startRad);
      const outerY1 = radius + radius * Math.sin(startRad);
      const outerX2 = radius + radius * Math.cos(endRad);
      const outerY2 = radius + radius * Math.sin(endRad);
      
      // Calculate inner points
      const innerX1 = radius + innerRadius * Math.cos(startRad);
      const innerY1 = radius + innerRadius * Math.sin(startRad);
      const innerX2 = radius + innerRadius * Math.cos(endRad);
      const innerY2 = radius + innerRadius * Math.sin(endRad);
      
      // Create path
      const largeArcFlag = angle > 180 ? 1 : 0;
      const path = `
        M ${outerX1} ${outerY1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}
        L ${innerX2} ${innerY2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
        Z
      `;
      
      return (
        <Path
          key={index}
          d={path}
          fill={segment.color}
        />
      );
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G>
            {generateDonutSegments()}
            <Circle
              cx={radius}
              cy={radius}
              r={innerRadius}
              fill="white"
            />
          </G>
        </Svg>
        
        {showPercentage && segments.length > 0 && (
          <View style={styles.centerLabel}>
            <Text style={styles.centerValue}>
              {Math.round(segments[0].percentage)}%
            </Text>
            <Text style={styles.centerText}>{segments[0].label}</Text>
          </View>
        )}
      </View>
      
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: segment.color }
                ]} 
              />
              <Text style={styles.legendText}>
                {segment.label} {showPercentage && `(${Math.round(segment.percentage)}%)`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  centerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  legend: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
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

export default PieChart;