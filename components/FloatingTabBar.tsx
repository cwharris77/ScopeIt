/**
 * Floating Tab Bar - Updated with Focus and Scope tabs
 */

import { Colors } from '@/constants/colors';
import { FLOATING_TAB_BAR_BOTTOM, FLOATING_TAB_BAR_HEIGHT } from '@/constants/layout';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: string;
  route: string;
  icon: { focused: IoniconName; unfocused: IoniconName };
  label: string;
}[] = [
  {
    name: 'index',
    route: 'index',
    icon: { focused: 'grid', unfocused: 'grid-outline' },
    label: 'Focus',
  },
  {
    name: 'analytics',
    route: 'analytics',
    icon: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
    label: 'Scope',
  },
];

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Left tab */}
      <TabButton
        icon={TABS[0].icon}
        label={TABS[0].label}
        focused={state.index === 0}
        onPress={() => navigation.navigate(TABS[0].route)}
      />

      {/* Center FAB */}
      <Pressable
        onPress={() => router.push('/add-task')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="add" size={32} color={Colors.backgroundSecondary} />
      </Pressable>

      {/* Right tab */}
      <TabButton
        icon={TABS[1].icon}
        label={TABS[1].label}
        focused={state.index === 1}
        onPress={() => navigation.navigate(TABS[1].route)}
      />
    </View>
  );
}

function TabButton({
  icon,
  label,
  focused,
  onPress,
}: {
  icon: { focused: IoniconName; unfocused: IoniconName };
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const iconName = focused ? icon.focused : icon.unfocused;

  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Ionicons name={iconName} size={24} color={focused ? Colors.primary : Colors.textMuted} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
      {focused && <View style={styles.indicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: FLOATING_TAB_BAR_BOTTOM,
    alignSelf: 'center',
    width: '85%',
    height: FLOATING_TAB_BAR_HEIGHT,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  tabLabelFocused: {
    color: Colors.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});

export default FloatingTabBar;
