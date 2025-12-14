import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Delay redirect until after mount
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      router.replace('/start');  // ✅ Safe redirect
    }
  }, [ready, router]);

  return null;
}
