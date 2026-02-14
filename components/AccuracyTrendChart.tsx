import { Colors } from '@/constants/colors';
import { calculatePerTaskAccuracy } from '@/utils/accuracy';
import { type TrendPoint, rollingAccuracyTrend, weeklyAccuracyTrend } from '@shared/utils/trends';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

interface TaskWithDates {
  estimated_minutes?: number | null;
  actual_seconds?: number | null;
  completed_at?: string | null;
}

interface AccuracyTrendChartProps {
  tasks: TaskWithDates[];
}

type TrendMode = 'weekly' | 'rolling';

const CHART_HEIGHT = 200;
const DOT_SIZE = 8;
const Y_TICKS = [0, 25, 50, 75, 100];
const Y_LABEL_WIDTH = 32;

export function AccuracyTrendChart({ tasks }: AccuracyTrendChartProps) {
  const [mode, setMode] = useState<TrendMode>('weekly');
  const [chartWidth, setChartWidth] = useState(0);

  const weeklyData = useMemo(() => weeklyAccuracyTrend(tasks), [tasks]);
  const rollingData = useMemo(() => rollingAccuracyTrend(tasks), [tasks]);

  const data: TrendPoint[] = mode === 'weekly' ? weeklyData : rollingData;

  const overallAccuracy = useMemo(() => calculatePerTaskAccuracy(tasks), [tasks]);

  if (data.length < 2) {
    return null;
  }

  const maxLabels = 6;
  const labelStep = Math.max(1, Math.floor(data.length / maxLabels));

  const handleChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const getX = (i: number) => {
    if (data.length <= 1) return chartWidth / 2;
    return (i / (data.length - 1)) * chartWidth;
  };

  const getY = (accuracy: number) => {
    return CHART_HEIGHT - (accuracy / 100) * CHART_HEIGHT;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="trending-up" size={20} color={Colors.primary} />
          <Text style={styles.title}>Accuracy Trend</Text>
        </View>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, mode === 'weekly' && styles.toggleButtonActive]}
          onPress={() => setMode('weekly')}
        >
          <Text style={[styles.toggleText, mode === 'weekly' && styles.toggleTextActive]}>
            Weekly
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, mode === 'rolling' && styles.toggleButtonActive]}
          onPress={() => setMode('rolling')}
        >
          <Text style={[styles.toggleText, mode === 'rolling' && styles.toggleTextActive]}>
            Rolling
          </Text>
        </Pressable>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[...Y_TICKS].reverse().map((tick) => (
            <Text key={tick} style={styles.yLabel}>
              {tick}%
            </Text>
          ))}
        </View>

        {/* Chart area */}
        <View style={styles.chartArea} onLayout={handleChartLayout}>
          {/* Grid lines */}
          {Y_TICKS.map((tick) => (
            <View key={`grid-${tick}`} style={[styles.gridLine, { top: getY(tick) }]} />
          ))}

          {/* Average reference line */}
          <View style={[styles.referenceLine, { top: getY(overallAccuracy) }]} />

          {/* Average label */}
          <View style={[styles.referenceLabel, { top: getY(overallAccuracy) - 18 }]}>
            <Text style={styles.referenceLabelText}>avg {overallAccuracy}%</Text>
          </View>

          {chartWidth > 0 && (
            <>
              {/* Line segments between dots */}
              {data.map((point, i) => {
                if (i === 0) return null;
                const prev = data[i - 1];
                const x1 = getX(i - 1);
                const y1 = getY(prev.accuracy);
                const x2 = getX(i);
                const y2 = getY(point.accuracy);

                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                return (
                  <View
                    key={`line-${i}`}
                    style={[
                      styles.line,
                      {
                        width: length,
                        left: x1,
                        top: y1,
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  />
                );
              })}

              {/* Data dots */}
              {data.map((point, i) => (
                <View
                  key={`dot-${i}`}
                  style={[
                    styles.dot,
                    {
                      left: getX(i) - DOT_SIZE / 2,
                      top: getY(point.accuracy) - DOT_SIZE / 2,
                    },
                  ]}
                />
              ))}
            </>
          )}
        </View>
      </View>

      {/* X-axis labels */}
      {chartWidth > 0 && (
        <View style={[styles.xAxis, { marginLeft: Y_LABEL_WIDTH }]}>
          {data.map((point, i) => {
            if (i % labelStep !== 0 && i !== data.length - 1) return null;
            return (
              <Text
                key={`x-${i}`}
                style={[
                  styles.xLabel,
                  {
                    left: getX(i),
                    transform: [{ translateX: -20 }],
                  },
                ]}
              >
                {point.label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    width: Y_LABEL_WIDTH,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  yLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.4,
  },
  referenceLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderStyle: 'dashed',
  },
  referenceLabel: {
    position: 'absolute',
    right: 0,
  },
  referenceLabelText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.primary,
  },
  xAxis: {
    height: 20,
    marginTop: 6,
    position: 'relative',
  },
  xLabel: {
    position: 'absolute',
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
});
