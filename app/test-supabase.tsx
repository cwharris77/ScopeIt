import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Not tested');

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('count');

      if (error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus('✅ Connected successfully!');
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-purple-600 p-6">
      <Text className="mb-4 text-2xl font-bold text-white">Supabase Test</Text>

      <Text className="mb-6 text-white">{status}</Text>

      <TouchableOpacity className="rounded-xl bg-white px-8 py-4" onPress={testConnection}>
        <Text className="font-bold text-purple-600">Test Connection</Text>
      </TouchableOpacity>
    </View>
  );
}
