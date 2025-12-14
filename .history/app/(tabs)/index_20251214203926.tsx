import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Only redirect after component mounts
    router.replace('/start');
  }, [router]);

  return null; // nothing to render
}

