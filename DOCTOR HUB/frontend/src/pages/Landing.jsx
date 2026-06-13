import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Star,
  Search,
  MapPin,
  ArrowRight,
  FlaskConical,
  Heart,
  Leaf,
  Calendar,
  Upload,
  CheckCircle,
  Quote,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
import { PublicHeader } from '../components/public/PublicHeader';
import { PublicFooter } from '../components/public/PublicFooter';
import { PublicDoctorCard } from '../components/public/PublicDoctorCard';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  PAKISTAN_CITIES,
  POPULAR_DISEASES,
  DOCTOR_CATEGORIES,
  TREATMENT_SPECIALTIES,
  ROLE_DASHBOARD,
} from '../utils/constants';

const categoryIcons = {
  allopathic: FlaskConical,
  homeopathic: Heart,
  herbal: Leaf,
};

const stats = [
  { value: '50K+', label: 'Patients' },
  { value: '500+', label: 'Doctors' },
  { value: '100+', label: 'Clinics' },
  { value: '99%', label: 'Satisfaction' },
];

const steps = [
  { icon: Search, title: 'Search Doctor', description: 'Find doctors by disease, specialty, or city across Pakistan.' },
  { icon: Calendar, title: 'Book Appointment', description: 'Choose a convenient time slot and book instantly.' },
  { icon: Upload, title: 'Upload Payment', description: 'Submit your payment screenshot for quick verification.' },
  { icon: CheckCircle, title: 'Get Confirmed', description: 'Once verified, receive confirmation and visit your doctor.' },
];

const testimonials = [
  { name: 'Ahmed Hassan', city: 'Karachi', text: 'Booked a cardiologist in DHA within minutes. Payment verification was quick and my records are all in one place.', rating: 5 },
  { name: 'Fatima Malik', city: 'Lahore', text: 'Found an excellent dermatologist in Gulberg. The whole process felt professional and trustworthy.', rating: 5 },
  { name: 'Zainab Ahmed', city: 'Karachi', text: 'Verifying payments through the dashboard saves our clinic team hours every week. Enterprise-grade platform.', rating: 5 },
];

const faqs = [
  { q: 'How do I book an appointment?', a: 'Search for a doctor by disease or specialty, select an available time slot, and confirm your booking. Upload your payment screenshot to complete the process.' },
  { q: 'How long does payment verification take?', a: 'Our assistants typically verify payments within 2-4 hours during business hours. You will receive a notification once verified.' },
  { q: 'Can I access my medical history?', a: 'Yes! All your medical records, prescriptions, and reports are securely stored in your patient dashboard.' },
  { q: 'What types of doctors are available?', a: 'Doctor Hub features Allopathic, Homeopathic, and Herbal medicine practitioners across various specialties in Pakistan.' },
  { q: 'Is my health data secure?', a: 'Absolutely. We use enterprise-grade encryption and role-based access control to ensure your medical data is protected.' },
];

function Section({ children, variant = 'white', id, className = '' }) {
  const variants = {
    white: 'section-white',
    blue: 'section-blue',
    gradient: 'section-gradient',
    glass: 'section-glass',
    accent: 'section-accent-band',
  };
  return (
    <section id={id} className={`relative overflow-hidden py-16 md:py-20 ${variants[variant]} ${className}`}>
      <div className="page-shell relative z-10">{children}</div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-10 md:mb-12 text-center mx-auto max-w-3xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-[#2563eb] mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172a]">{title}</h2>
      {description && (
        <p className="mt-3 text-lg text-muted-fg leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function useLandingActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goFindDoctors = useCallback(
    (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      navigate(qs ? `/doctors?${qs}` : '/doctors');
    },
    [navigate]
  );

  const goBookAppointment = useCallback(() => {
    if (user?.role === 'patient') {
      navigate('/patient/doctors');
      return;
    }
    if (user) {
      navigate(ROLE_DASHBOARD[user.role] || '/login');
      return;
    }
    const searchEl = document.getElementById('search');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/doctors');
    }
  }, [navigate, user]);

  return { goFindDoctors, goBookAppointment };
}

function HeroSection() {
  const { goFindDoctors, goBookAppointment } = useLandingActions();

  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Decorative layers — must not block clicks */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="pointer-events-none absolute top-20 right-[10%] h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-10 left-[5%] h-64 w-64 rounded-full bg-[#0d9488]/10 blur-3xl animate-float-delayed" />

      <div className="page-shell relative z-10 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 text-sm font-medium rounded-full border border-[#2563eb]/20 bg-[#2563eb]/10 text-[#2563eb]">
              <Sparkles className="h-3.5 w-3.5" /> Pakistan&apos;s #1 Healthcare Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] text-[#0f172a]">
              Find Trusted Doctors{' '}
              <span className="gradient-text">Across Pakistan</span>
            </h1>

            <p className="mt-5 text-lg text-muted-fg max-w-xl leading-relaxed">
              Search verified doctors in Karachi, Lahore, Islamabad and more. Book appointments,
              upload payment, and manage your health records — all in one place.
            </p>

            <div className="relative z-20 mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => goFindDoctors()} className="btn-primary-public px-7 py-3.5 cursor-pointer">
                Find Doctors <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={goBookAppointment} className="btn-secondary-public px-7 py-3.5 cursor-pointer">
                Book Appointment
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-fg">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#2563eb]" /> Secure & encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 average rating
              </span>
            </div>
          </div>

          {/* Preview card */}
          <div className="relative hidden lg:block">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#2563eb]/20 via-[#0d9488]/10 to-transparent blur-2xl" />
            <div className="relative glass-public glow-primary rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">Doctor Hub</p>
                  <p className="text-xs text-muted-fg">Patient Dashboard</p>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full gradient-cta">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{ label: 'Appointments', value: '12' }, { label: 'Verified', value: '98%' }].map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50 p-3 border border-[#e2e8f0]">
                    <p className="text-xl font-bold text-[#0f172a]">{s.value}</p>
                    <p className="text-xs text-muted-fg">{s.label}</p>
                  </div>
                ))}
              </div>
              {['Dr. Hassan Raza — Cardiology', 'Dr. Ayesha Malik — Dermatology'].map((line) => (
                <div key={line} className="flex items-center justify-between rounded-xl border border-[#e2e8f0] px-3 py-2.5 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-[#0f172a]">{line.split(' — ')[0]}</p>
                    <p className="text-[10px] text-muted-fg">{line.split(' — ')[1]}</p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-[#0d9488]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="relative z-10 border-y border-[#e2e8f0] bg-white">
      <div className="page-shell py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4">
              <p className="text-2xl md:text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-fg mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  const { goFindDoctors } = useLandingActions();
  const [disease, setDisease] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const params = {};
    if (disease.trim()) params.disease = disease.trim();
    if (city) params.city = city;
    goFindDoctors(params);
  };

  return (
    <Section id="search" variant="blue" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Start Here"
        title="Find the Right Doctor in Seconds"
        description="Search by condition, specialty, or city — then book your appointment online."
      />
      <form
        onSubmit={handleSearch}
        className="max-w-4xl mx-auto glass-public glow-primary rounded-2xl p-6 md:p-8 relative z-20"
      >
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div>
            <label htmlFor="disease-search" className="label-public">Disease or condition</label>
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg pointer-events-none" />
              <input
                id="disease-search"
                placeholder="e.g. Diabetes, Hypertension"
                className="input-public pl-11 h-12"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="city-search" className="label-public flex items-center gap-2">
              <MapPin className="h-4 w-4" /> City in Pakistan
            </label>
            <select
              id="city-search"
              className="input-public mt-2 h-12"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All cities</option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary-public h-12 px-8 cursor-pointer">
          <Search className="h-4 w-4" /> Search Doctors
        </button>
        <div className="mt-6 pt-5 border-t border-[#e2e8f0] flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-fg mr-1">Popular:</span>
          {POPULAR_DISEASES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => goFindDoctors({ disease: d })}
              className="rounded-full border border-[#2563eb]/15 bg-[#2563eb]/5 px-4 py-1.5 text-sm font-medium text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all cursor-pointer"
            >
              {d}
            </button>
          ))}
        </div>
      </form>
    </Section>
  );
}

function HowItWorksSection() {
  const { goBookAppointment } = useLandingActions();

  return (
    <Section id="how-it-works" variant="accent" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Simple Process"
        title="How It Works"
        description="From search to confirmed appointment in four easy steps"
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {steps.map((step, i) => (
          <div key={step.title} className="text-center bg-white/70 rounded-2xl p-6 border border-[#e2e8f0]">
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-cta text-white mb-4 shadow-lg">
              <step.icon className="h-7 w-7" />
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0d9488] text-xs font-bold text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="font-bold text-base mb-2 text-[#0f172a]">{step.title}</h3>
            <p className="text-sm text-muted-fg leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button type="button" onClick={goBookAppointment} className="btn-primary-public px-8 py-3 cursor-pointer">
          Start Booking Now <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Section>
  );
}

function CategoriesSection() {
  const { goFindDoctors } = useLandingActions();

  return (
    <Section id="categories" variant="white">
      <SectionHeader
        eyebrow="Specializations"
        title="Doctor Categories"
        description="Allopathic, Homeopathic, and Herbal practitioners — verified across Pakistan."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {DOCTOR_CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat.value];
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => goFindDoctors({ type: cat.value })}
              className="text-left group cursor-pointer"
            >
              <div className="premium-card p-7 h-full">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#0f172a]">{cat.label}</h3>
                <p className="text-sm text-muted-fg leading-relaxed mb-4">{cat.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">
                  Explore doctors <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function FeaturedDoctorsSection() {
  const { goFindDoctors } = useLandingActions();
  const { data, loading } = useFetch(async () => {
    const { data: res } = await api.get('/doctors?page=1&limit=4');
    return res;
  }, []);

  const doctors = data?.doctors?.slice(0, 4) || [];

  return (
    <Section variant="gradient">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Top Rated</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172a]">Featured Doctors</h2>
          <p className="mt-2 text-muted-fg">Verified professionals ready to help you today</p>
        </div>
        <button type="button" onClick={() => goFindDoctors()} className="btn-secondary-public shrink-0 cursor-pointer">
          View All Doctors
        </button>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card h-72 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-public p-10 text-center text-muted-fg">
          <p>No doctors listed yet.</p>
          <button type="button" onClick={() => goFindDoctors()} className="btn-primary-public mt-4 cursor-pointer">
            Browse Directory
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {doctors.map((doc, i) => (
            <PublicDoctorCard key={doc._id} doctor={doc} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

function TreatmentTypesSection() {
  const { goFindDoctors } = useLandingActions();

  return (
    <Section variant="glass">
      <SectionHeader
        eyebrow="Treatments"
        title="Browse by Specialty"
        description="Tap a specialty to find matching doctors"
      />
      <div className="flex flex-wrap justify-center gap-3">
        {TREATMENT_SPECIALTIES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => goFindDoctors({ disease: t })}
            className="rounded-full border border-[#2563eb]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm hover:bg-[#2563eb] hover:text-white hover:border-transparent transition-all cursor-pointer"
          >
            {t}
          </button>
        ))}
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  return (
    <Section variant="blue">
      <SectionHeader
        eyebrow="Testimonials"
        title="Trusted by Patients Nationwide"
        description="Real feedback from Karachi, Lahore, Islamabad and beyond"
      />
      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="premium-card p-7">
            <Quote className="h-8 w-8 text-[#2563eb]/30 mb-3" />
            <p className="text-sm text-muted-fg leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4 border-t border-[#e2e8f0]">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#0d9488]/20 flex items-center justify-center font-bold text-sm text-[#0f172a]">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#0f172a]">{t.name}</p>
                <p className="text-xs text-muted-fg">Patient · {t.city}</p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <Section id="faq" variant="white" className="scroll-mt-20">
      <SectionHeader
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Quick answers about booking and using Doctor Hub"
      />
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((item, i) => (
          <div key={item.q} className="glass-public rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left font-semibold text-[#0f172a] hover:bg-[#2563eb]/5 transition-colors cursor-pointer"
            >
              {item.q}
              <ChevronDown
                className={`h-5 w-5 text-[#2563eb] shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="px-5 pb-5 text-sm text-muted-fg leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function Landing() {
  return (
    <div className="public-site">
      <PublicHeader />
      <main>
        <HeroSection />
        <StatsStrip />
        <SearchSection />
        <HowItWorksSection />
        <CategoriesSection />
        <FeaturedDoctorsSection />
        <TreatmentTypesSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <PublicFooter />
    </div>
  );
}
