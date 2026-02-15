/**
 * Floating Tab Bar - 4 icon-only tabs + center FAB
 */

import { Colors } from '@/constants/colors';
import { FLOATING_TAB_BAR_BOTTOM, FLOATING_TAB_BAR_HEIGHT } from '@/constants/layout';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: string;
  route: string;
  icon: { focused: IoniconName; unfocused: IoniconName };
}[] = [
  {
    name: 'index',
    route: 'index',
    icon: { focused: 'list', unfocused: 'list-outline' },
  },
  {
    name: 'projects',
    route: 'projects',
    icon: { focused: 'folder', unfocused: 'folder-outline' },
  },
  {
    name: 'analytics',
    route: 'analytics',
    icon: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  },
  {
    name: 'settings',
    route: 'settings',
    icon: { focused: 'settings', unfocused: 'settings-outline' },
  },
];

export function FloatingTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const router = useRouter();
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.container}>
        {/* Tasks */}
        <TabButton
          icon={TABS[0].icon}
          focused={state.index === 0}
          onPress={() => navigation.navigate(TABS[0].route)}
        />
        {/* Manage */}
        <TabButton
          icon={TABS[1].icon}
          focused={state.index === 1}
          onPress={() => navigation.navigate(TABS[1].route)}
        />
        {/* FAB */}
        <AddTabButton onPress={() => router.push('/add-task')} />
        {/* Insights */}
        <TabButton
          icon={TABS[2].icon}
          focused={state.index === 2}
          onPress={() => navigation.navigate(TABS[2].route)}
        />
        {/* Settings */}
        <TabButton
          icon={TABS[3].icon}
          focused={state.index === 3}
          onPress={() => navigation.navigate(TABS[3].route)}
        />
      </View>
    </View>
  );
}

function TabButton({
  icon,
  focused,
  onPress,
}: {
  icon: { focused: IoniconName; unfocused: IoniconName };
  focused: boolean;
  onPress: () => void;
}) {
  const iconName = focused ? icon.focused : icon.unfocused;

  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Ionicons name={iconName} size={24} color={focused ? Colors.primary : Colors.textMuted} />
      {focused && <View style={styles.indicator} />}
    </Pressable>
  );
}

const ADD_BUTTON_SIZE = 50;

function AddTabButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addButtonWrap, pressed && styles.addButtonPressed]}
      accessibilityLabel="Add task">
      <View style={styles.addIconWrap}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
    paddingTop: 12,
    paddingBottom: FLOATING_TAB_BAR_BOTTOM,
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
  },
  container: {
    maxWidth: '85%',
    height: FLOATING_TAB_BAR_HEIGHT,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'relative',
    flex: 1,
    minWidth: 0,
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  addButtonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  addIconWrap: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: {
        elevation: 14,
      },
    }),
  },
});

export default FloatingTabBar;
