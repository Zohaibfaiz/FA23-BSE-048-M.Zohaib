export const dynamic = 'force-dynamic';

import { requireRolePage } from '@/lib/auth';
import { UnifiedSidebar } from '@/components/unified-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRolePage(['admin', 'super_admin'], '/auth/login?redirect=/admin');

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
