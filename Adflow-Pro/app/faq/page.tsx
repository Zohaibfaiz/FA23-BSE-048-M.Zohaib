import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  ['How does approval work?', 'Drafts are submitted by clients, reviewed by moderators, then passed to payment verification before admins schedule or publish them.'],
  ['When does payment happen?', 'Payment is required after moderation approval. Clients submit a transaction reference and screenshot URL for manual admin verification.'],
  ['What becomes public?', 'Only ads in the published state and still within their validity window appear in public marketplace queries.'],
  ['Can clients publish directly?', 'No. Clients can create and submit listings, but only admins can publish or schedule ads after verification.'],
  ['How are ads ranked?', 'Featured state, package weight, freshness, admin boost, and verified seller trust all contribute to final ranking order.'],
  ['What media is accepted?', 'Only https image URLs in JPG/PNG format and YouTube links are supported. Invalid media falls back to a placeholder thumbnail.'],
  ['What happens at expiry?', 'Ads are automatically expired by cron, removed from public queries, and users receive expiry notifications.'],
  ['Do all changes get logged?', 'Yes. Status changes, audit events, cron actions, and key workflow operations are logged for accountability.'],
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <div className="flex items-center gap-3">
            <Link href="/contact"><Button variant="ghost" className="rounded-full">Contact</Button></Link>
            <Link href="/auth/register"><Button className="rounded-full bg-slate-950 hover:bg-slate-800">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.22)] lg:px-10">
          <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Knowledge Base</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Answers for clients, moderators, and marketplace operators.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            These are the most common questions around the AdFlow Pro workflow, public visibility rules, payments, and ranking.
          </p>
        </section>

        <div className="mt-8 space-y-4">
          {faqs.map(([question, answer]) => (
            <Card key={question} className="rounded-[1.75rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{question}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
