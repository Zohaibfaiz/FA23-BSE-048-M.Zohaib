import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="page-shell">
      <header className="shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="brand-mark text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/faq"><Button variant="ghost" className="rounded-full">FAQ</Button></Link>
            <Link href="/auth/register"><Button className="rounded-full">Create Account</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-dark hero-outline rounded-[2.25rem] p-8 text-white">
            <p className="section-kicker">Support Desk</p>
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
                <div key={item.title} className="surface-dark-tile rounded-[1.5rem] p-4">
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

          <Card className="surface-card rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker-light">Send Message</p>
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
                <Button type="submit" className="w-full rounded-full py-6 text-base">
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
