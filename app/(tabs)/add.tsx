import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AddScreen() {
  const router = useRouter();

  useEffect(() => {
    // Show your modal/bottom sheet here
    // For now, just go back
    router.back();
  }, []);

  return null;
}
