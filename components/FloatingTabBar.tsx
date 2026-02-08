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
    icon: { focused: 'list', unfocused: 'list-outline' },
    label: 'Tasks',
  },
  {
    name: 'analytics',
    route: 'analytics',
    icon: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
    label: 'Insights',
  },
];

export function FloatingTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const router = useRouter();
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.container}>
        <TabButton
          icon={TABS[0].icon}
          label={TABS[0].label}
          focused={state.index === 0}
          onPress={() => navigation.navigate(TABS[0].route)}
        />
        <AddTabButton onPress={() => router.push('/add-task')} />
        <TabButton
          icon={TABS[1].icon}
          label={TABS[1].label}
          focused={state.index === 1}
          onPress={() => navigation.navigate(TABS[1].route)}
        />
      </View>
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

const ADD_BUTTON_SIZE = 64; // Prominent primary action; fits in 75px bar

function AddTabButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.addButtonWrap, pressed && styles.addButtonPressed]}
      accessibilityLabel="Add task">
      <View style={styles.addIconWrap}>
        <Ionicons name="add" size={36} color={Colors.white} />
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
    flex: 1,
    minWidth: 0,
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
  addButtonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
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
  tabLabelAdd: {
    color: Colors.textMuted,
    marginTop: 4,
  },
});

export default FloatingTabBar;
