import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
        <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Access Denied</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              You don&apos;t have permission to access this page. Your current role does not allow access to this section of the platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/login">
                <Button className="w-full rounded-full px-6 sm:w-auto">Go to Login</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full rounded-full px-6 sm:w-auto">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
