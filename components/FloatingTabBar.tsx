import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<'home' | 'tasks', { focused: IoniconName; unfocused: IoniconName }> = {
  home: {
    focused: 'home-sharp',
    unfocused: 'home-outline',
  },
  tasks: {
    focused: 'list-sharp',
    unfocused: 'list-outline',
  },
};

export function FloatingTabBar({ state, navigation }: { state: any; navigation: any }) {
  console.log('Rendering FloatingTabBar with state:', state);
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        width: '90%',
        height: 90,
        backgroundColor: '#1f2937',
        borderRadius: 60,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
          },
          android: {
            elevation: 12,
          },
        }),
      }}>
      {/* Left tab */}
      <TabIcon
        icon="home"
        focused={state.index === 0}
        onPress={() => navigation.navigate('index')}
      />

      {/* Center FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('add')} // TODO: add modal to add task
        activeOpacity={0.9}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        }}>
        <Ionicons name="add" size={32} color="#2d3748" />
      </TouchableOpacity>

      {/* Right tab */}
      <TabIcon
        icon="tasks"
        focused={state.index === 1}
        onPress={() => navigation.navigate('tasks')}
      />
    </View>
  );
}

function TabIcon({
  icon,
  focused,
  onPress,
}: {
  icon: 'home' | 'tasks';
  focused: boolean;
  onPress: () => void;
}) {
  const iconName = focused ? ICONS[icon].focused : ICONS[icon].unfocused;
  return (
    <TouchableOpacity onPress={onPress}>
      <Ionicons name={iconName} size={28} color={focused ? '#087f8c' : '#9ca3af'} />
    </TouchableOpacity>
  );
}
