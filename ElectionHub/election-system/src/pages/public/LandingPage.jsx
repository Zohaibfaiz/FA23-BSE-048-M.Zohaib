import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primaryBg">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-primaryBg/80 backdrop-blur-md border-b border-borderColor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-heading font-bold text-primaryGold">SecureVote<span className="text-textPrimary">Pro</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-textSecondary hover:text-primaryGold transition-colors font-medium">Log in</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading font-bold text-textPrimary mb-6 tracking-tight"
          >
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGold to-goldLight animate-pulse">Secure Voting</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-textSecondary"
          >
            Transparent, secure, and anonymous online elections for enterprise organizations. Powered by advanced encryption.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link to="/signup" className="btn-primary text-lg flex items-center gap-2">
              Start Voting <ChevronRight size={20} />
            </Link>
            <a href="#features" className="btn-secondary text-lg">Learn More</a>
          </motion.div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primaryGold/5 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Features */}
      <div id="features" className="py-20 bg-secondaryBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary">Enterprise-Grade Security</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="text-primaryGold w-8 h-8" />}
              title="End-to-End Encryption"
              description="Every vote is encrypted from the moment it leaves your device until it's counted."
            />
            <FeatureCard 
              icon={<Lock className="text-primaryGold w-8 h-8" />}
              title="Anonymous Voting"
              description="Secret voter IDs ensure that your identity is never linked to your ballot."
            />
            <FeatureCard 
              icon={<Activity className="text-primaryGold w-8 h-8" />}
              title="Real-Time Analytics"
              description="Watch election results unfold in real-time with our dynamic dashboards."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-8 text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primaryGold/10 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-textPrimary mb-3">{title}</h3>
      <p className="text-textSecondary">{description}</p>
    </motion.div>
  );
}
