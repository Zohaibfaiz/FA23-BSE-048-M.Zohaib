import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata = { title: 'FAQ' };
const FAQS = [
  { q: 'How do I post an ad?', a: 'Register an account, go to your dashboard, click "Post New Ad", fill in details, select a package, and submit. After moderator review, submit payment to go live.' },
  { q: 'How long does approval take?', a: 'Our moderators typically review ads within 2-4 hours during business hours (9 AM – 9 PM PKT).' },
  { q: 'What payment methods are accepted?', a: 'We accept JazzCash, EasyPaisa, HBL Bank Transfer, and Meezan Bank Transfer.' },
  { q: 'What is the ranking formula?', a: 'Ads are ranked by: Featured status (50 pts) + Package weight × 10 + Freshness + Admin boost + Verified seller bonus.' },
  { q: 'Can I cancel or get a refund?', a: 'We do not offer refunds once an ad is published. Please review your ad before submitting payment.' },
  { q: 'What is the Premium package?', a: 'Premium gives 30-day listing, homepage visibility, 3× ranking boost, and auto-refresh every 3 days for maximum exposure.' },
];
export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 mesh-bg">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-display font-bold text-white mb-2">FAQ</h1>
          <p className="text-white/40 mb-10">Frequently asked questions about AdFlow Pro.</p>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <div key={i} className="glass rounded-xl p-5 border border-white/8">
                <p className="font-display font-bold text-white mb-2">{f.q}</p>
                <p className="text-sm text-white/50 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
