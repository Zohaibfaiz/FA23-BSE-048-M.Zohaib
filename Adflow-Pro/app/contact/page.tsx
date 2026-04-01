import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_26%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/faq"><Button variant="ghost" className="rounded-full">FAQ</Button></Link>
            <Link href="/auth/register"><Button className="rounded-full bg-slate-950 hover:bg-slate-800">Create Account</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Support Desk</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Talk to the team behind the marketplace workflow.</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              Need help with moderation, payments, package selection, or launch timing? Reach out and we will help unblock the next step.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: <Mail className="h-5 w-5 text-orange-400" />, title: 'Email support', value: 'support@adflowpro.com' },
                { icon: <PhoneCall className="h-5 w-5 text-orange-400" />, title: 'Operations line', value: '+1 (415) 555-0142' },
                { icon: <HelpCircle className="h-5 w-5 text-orange-400" />, title: 'Knowledge base', value: 'Browse policy, workflow, and package help' },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-sm text-slate-400">{item.title}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border-slate-200 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Send Message</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Contact support</h2>
                </div>
                <MessageSquare className="h-6 w-6 text-orange-500" />
              </div>

              <form className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Tell us what you need help with" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={7} placeholder="Share the issue, ad title, status, or payment reference if relevant." required />
                </div>
                <Button type="submit" className="w-full rounded-full bg-slate-950 py-6 text-base hover:bg-slate-800">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
