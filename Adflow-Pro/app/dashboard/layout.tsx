export const dynamic = 'force-dynamic';

import { requireAuthPage } from '@/lib/auth';
import { UnifiedSidebar } from '@/components/unified-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthPage('/auth/login?redirect=/dashboard');

  return (
    <UnifiedSidebar
      user={{
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </UnifiedSidebar>
  );
}
