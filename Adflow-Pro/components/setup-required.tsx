import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Database, Key, Rocket } from 'lucide-react';

export function SetupRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-10 h-10 text-primary" />
            <div>
              <CardTitle className="text-2xl">Supabase Setup Required</CardTitle>
              <CardDescription>Configure your database to get started</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quick Setup (5 minutes)</AlertTitle>
            <AlertDescription>
              Follow these steps to connect your Supabase database and unlock all features.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Supabase Project</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Go to <a href="https://supabase.com" target="_blank" className="text-primary hover:underline">supabase.com</a> and create a new project (free tier available)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Run Database Migration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  In Supabase SQL Editor, run the migration file:
                </p>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                  supabase/migrations/001_initial_schema.sql
                </code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Get API Credentials</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  From Settings → API, copy:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Project URL</li>
                  <li>• anon public key</li>
                  <li>• service_role key</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Update Environment Variables</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Edit <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">.env.local</code> with your credentials:
                </p>
                <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Done!</h3>
                <p className="text-sm text-muted-foreground">
                  Server will auto-reload and all features will be available! 🎉
                </p>
              </div>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Key className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Need Help?</AlertTitle>
            <AlertDescription className="text-blue-800">
              Check <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">SETUP_NOW.md</code> for detailed instructions with screenshots.
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">What You&apos;ll Get:</h4>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>✅ User authentication</div>
              <div>✅ Ad management</div>
              <div>✅ Payment tracking</div>
              <div>✅ Moderation workflow</div>
              <div>✅ Analytics dashboard</div>
              <div>✅ Automated cron jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
