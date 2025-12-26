import { Text, View } from 'react-native';

export default function ErrorView({ error }: { error: Error }) {
  return (
    <View className="m-2 w-full rounded-lg bg-red-100 p-4">
      <Text className="text-lg font-semibold text-red-800">Error</Text>
      <Text className="text-red-700">{error.message}</Text>
    </View>
  );
}
