import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/start'); // Redirect root → start
  }, []);

  return null; // Nothing rendered
}
