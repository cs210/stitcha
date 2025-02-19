'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/kanban');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || user) {
    return null;
  }

  return children;
} 