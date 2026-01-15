/**
 * Analytics Screen - Task performance insights with AI
 * Ported from web app
 */

import { Colors } from '@/constants/colors';
import { TASK_STATUS } from '@/constants/taskStatus';
import { useTasks } from '@/contexts/TasksContext';
import { AIAnalysis, analyzeTaskPerformance } from '@/services/geminiService';
import { secondsToDisplay } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
  const { tasks } = useTasks();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED);

  const triggerAnalysis = useCallback(async () => {
    if (completedTasks.length === 0) return;
    setLoading(true);
    const result = await analyzeTaskPerformance(tasks);
    if (result) setAnalysis(result);
    setLoading(false);
  }, [tasks, completedTasks.length]);

  useEffect(() => {
    if (completedTasks.length > 0 && !analysis) {
      triggerAnalysis();
    }
  }, [completedTasks.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await triggerAnalysis();
    setRefreshing(false);
  };

  // Calculate stats
  const calculateStats = () => {
    if (completedTasks.length === 0) {
      return { avgAccuracy: 0, totalTime: 0, tasksCompleted: 0 };
    }

    let totalExpected = 0;
    let totalActual = 0;

    completedTasks.forEach((t) => {
      totalExpected += (t.estimated_minutes || 0) * 60;
      totalActual += t.actual_seconds || 0;
    });

    const avgAccuracy =
      totalExpected > 0
        ? Math.round((1 - Math.abs(totalActual - totalExpected) / totalExpected) * 100)
        : 100;

    return {
      avgAccuracy: Math.max(0, avgAccuracy),
      totalTime: totalActual,
      tasksCompleted: completedTasks.length,
    };
  };

  const stats = calculateStats();

  // Get last 5 tasks for chart display - cap at reasonable max for display
  const maxMinutes = Math.max(
    ...completedTasks
      .slice(0, 5)
      .map((t) => Math.max(t.estimated_minutes || 0, Math.round((t.actual_seconds || 0) / 60))),
    60
  );
  const chartData = completedTasks.slice(0, 5).map((t) => ({
    name: t.name.length > 12 ? t.name.substring(0, 12) + '...' : t.name,
    expected: t.estimated_minutes || 0,
    actual: Math.round((t.actual_seconds || 0) / 60),
  }));

  if (completedTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="trending-up-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete a few tasks to unlock AI-powered insights and scope analysis.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Pressable style={styles.refreshButton} onPress={triggerAnalysis}>
            <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{stats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{secondsToDisplay(stats.totalTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="analytics" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{stats.avgAccuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Recent Performance */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={20} color={Colors.primary} />
            <Text style={styles.chartTitle}>Recent Performance (min)</Text>
          </View>
          <View style={styles.chartContent}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.chartRow}>
                <Text style={styles.chartLabel} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.barsContainer}>
                  <View style={styles.barRow}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          styles.barExpected,
                          {
                            width: `${Math.min(100, (item.expected / maxMinutes) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{item.expected}</Text>
                  </View>
                  <View style={styles.barRow}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          styles.barActual,
                          {
                            width: `${Math.min(100, (item.actual / maxMinutes) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValue}>{item.actual}</Text>
                  </View>
                </View>
              </View>
            ))}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.barExpected]} />
                <Text style={styles.legendText}>Expected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.barActual]} />
                <Text style={styles.legendText}>Actual</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        {loading ? (
          <View style={styles.loadingCard}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
            <Text style={styles.loadingText}>Gemini is analyzing your scope...</Text>
          </View>
        ) : analysis ? (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightTitleRow}>
                <Ionicons name="sparkles" size={24} color={Colors.white} />
                <Text style={styles.insightTitle}>AI Insight</Text>
              </View>
              <View style={styles.accuracyBadge}>
                <Ionicons name="locate" size={14} color={Colors.white} />
                <Text style={styles.accuracyText}>{analysis.accuracyRating}% Accuracy</Text>
              </View>
            </View>

            <Text style={styles.summaryText}>"{analysis.summary}"</Text>

            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>KEY INSIGHTS</Text>
              {analysis.insights.map((insight, i) => (
                <View key={i} style={styles.insightItem}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightItemText}>{insight}</Text>
                </View>
              ))}
            </View>

            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>RECOMMENDATIONS</Text>
              {analysis.recommendations.map((rec, i) => (
                <View key={i} style={styles.recCard}>
                  <Ionicons name="alert-circle" size={16} color={Colors.warning} />
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  chartContent: {
    gap: 12,
  },
  chartRow: {
    gap: 6,
  },
  chartLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barsContainer: {
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    maxWidth: '80%',
  },
  bar: {
    height: 8,
    borderRadius: 4,
    minWidth: 4,
  },
  barExpected: {
    backgroundColor: Colors.textMuted,
  },
  barActual: {
    backgroundColor: Colors.primary,
  },
  barValue: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  loadingCard: {
    backgroundColor: `${Colors.primary}20`,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 12,
  },
  insightCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  summaryText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 20,
  },
  insightSection: {
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  insightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 7,
  },
  insightItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
  recCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recText: {
    flex: 1,
    fontSize: 12,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
