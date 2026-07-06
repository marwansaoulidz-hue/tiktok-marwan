'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyProfileRedirect() {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      router.replace(`/profile/${user.id}`);
    } else {
      router.replace('/login');
    }
  }, [router, user.id]);

  return null;
}
