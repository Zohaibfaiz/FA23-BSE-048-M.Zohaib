import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata = { title: 'Terms of Service' };
export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 mesh-bg">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-display font-bold text-white mb-8">Terms of Service</h1>
          {[
            ['1. Acceptance', 'By using AdFlow Pro, you agree to these terms. If you disagree, do not use our platform.'],
            ['2. Listings', 'All ads must be legal, accurate, and not misleading. We reserve the right to remove any listing.'],
            ['3. Payments', 'All payments are final. We verify payment proofs manually and may reject fraudulent submissions.'],
            ['4. Prohibited Content', 'No weapons, drugs, illegal services, adult content, or scam listings. Violations result in immediate ban.'],
            ['5. Moderation', 'AdFlow Pro reserves the right to approve, reject, or remove any ad without prior notice.'],
            ['6. Liability', 'AdFlow Pro is a marketplace and not responsible for transactions between buyers and sellers.'],
          ].map(([title, text]) => (
            <div key={title} className="mb-6">
              <h2 className="font-display font-bold text-white mb-2">{title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
