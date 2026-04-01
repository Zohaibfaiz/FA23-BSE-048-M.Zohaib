import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  ['Acceptance of Terms', 'Using AdFlow Pro means you agree to the marketplace workflow, moderation rules, payment verification process, and public listing policies.'],
  ['Account Responsibility', 'Users are responsible for account security, submitted content, and the accuracy of listing, business, and payment information.'],
  ['Content Guidelines', 'All sponsored listings must be lawful, accurate, non-misleading, and free from abusive, duplicate, or prohibited content.'],
  ['Payments and Refunds', 'Payments are reviewed manually. Refund decisions are made before publication; once a listing goes live, refund eligibility is limited.'],
  ['Moderation Rights', 'AdFlow Pro may approve, reject, archive, or request revisions for any listing that does not meet quality or policy requirements.'],
  ['Expiry and Visibility', 'Only published, non-expired ads are public. Expired listings are removed from public results automatically.'],
  ['Liability Limits', 'The service is provided as-is. We are not responsible for indirect or consequential losses resulting from platform usage.'],
  ['Policy Updates', 'Terms may change over time. Continued use of the platform constitutes acceptance of the latest published version.'],
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_26%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-slate-950">AdFlow Pro</Link>
          <Link href="/">
            <Button variant="ghost" className="rounded-full">Back Home</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.22)] lg:px-10">
          <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Legal Framework</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of service for the AdFlow Pro marketplace.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            These terms govern how listings are submitted, reviewed, paid for, published, and retired from the public marketplace.
          </p>
        </section>

        <div className="mt-8 space-y-4">
          {sections.map(([title, body], index) => (
            <Card key={title} className="rounded-[1.75rem] border-slate-200 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Section {index + 1}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">Last updated: March 30, 2026</p>
      </main>
    </div>
  );
}
