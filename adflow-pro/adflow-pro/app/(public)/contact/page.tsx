import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata = { title: 'Contact' };
export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 mesh-bg">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Contact Us</h1>
          <p className="text-white/40 mb-10">We typically respond within 24 hours.</p>
          <div className="glass rounded-2xl p-8 border border-white/10 text-left space-y-4">
            <div><p className="text-xs text-white/40 mb-1">WhatsApp</p><a href="https://wa.me/923001234567" className="text-violet-400 hover:text-violet-300">+92 300 1234567</a></div>
            <div><p className="text-xs text-white/40 mb-1">Email</p><a href="mailto:support@adflowpro.pk" className="text-violet-400 hover:text-violet-300">support@adflowpro.pk</a></div>
            <div><p className="text-xs text-white/40 mb-1">Hours</p><p className="text-white/60 text-sm">Mon–Sat, 9 AM – 9 PM PKT</p></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
