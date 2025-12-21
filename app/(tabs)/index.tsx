import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export default function HomeScreen() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    setTesting(true);
    setStatus('Testing...');

    try {
      // Try to query the tasks table
      const { data, error } = await supabase.from('tasks').select('count');

      if (error) {
        setStatus(`❌ Error: ${error.message}`);
        Alert.alert('Connection Failed', error.message);
      } else {
        setStatus('✅ Connected successfully!');
        Alert.alert('Success', 'Supabase is connected!');
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
      Alert.alert('Error', String(err));
    }

    setTesting(false);
  };

  return (
    // <View className="flex-1 items-center justify-center p-6">
    //   <Text className="mb-2 text-4xl font-bold text-white">⏱️ ScopeIt</Text>
    //   <Text className="mb-8 text-lg text-white/90">Time Estimation Tracker</Text>

    //   {/* Test Supabase Button */}
    //   <TouchableOpacity
    //     className="mb-4 rounded-xl bg-white px-8 py-4"
    //     onPress={testConnection}
    //     disabled={testing}>
    //     <Text className="text-center font-bold text-purple-600">
    //       {testing ? 'Testing...' : 'Test Supabase Connection'}
    //     </Text>
    //   </TouchableOpacity>

    //   {/* Status Message */}
    //   {status ? (
    //     <View className="mt-4 rounded-lg bg-white/10 p-4">
    //       <Text className="text-center text-white">{status}</Text>
    //     </View>
    //   ) : null}
    // </View>
    <View></View>
  );
}
