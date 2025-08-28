'use client';

import { usePathname } from 'next/navigation';
// comment out if you don’t want auth elsewhere yet
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bypassAuth = pathname?.startsWith('/draw') || pathname?.startsWith('/workspace-editor'); // bypass on /draw and /workspace-editor while we dev

  if (bypassAuth) {
    return <>{children}</>;
  }

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
