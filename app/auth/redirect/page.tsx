'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (data.userType === 'CREATOR') {
          router.push('/creator/dashboard');
        } else if (data.userType === 'BRAND') {
          router.push('/brand/discover');
        } else {
          router.push('/');
        }
      } catch (error) {
        router.push('/');
      }
    };

    redirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting...</div>
    </div>
  );
}
