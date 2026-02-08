import { Colors } from '@/constants/colors';
import { FLOATING_TAB_BAR_BOTTOM, FLOATING_TAB_BAR_HEIGHT } from '@/constants/layout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

const FAB_SIZE = 60;

// Center FAB over the floating bar: bar center = BOTTOM + HEIGHT/2, FAB bottom = that - FAB_SIZE/2
const FAB_BOTTOM = FLOATING_TAB_BAR_BOTTOM + FLOATING_TAB_BAR_HEIGHT / 2 - FAB_SIZE / 2;

export function AddTaskFAB() {
  const router = useRouter();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push('/add-task')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityLabel="Add task">
        <Ionicons name="add" size={32} color={Colors.backgroundSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: FAB_BOTTOM,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
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
