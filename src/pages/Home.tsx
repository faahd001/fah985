import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Wrench, Zap, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full bg-[#f8fafc]">
      <section className="p-10">
        <div className="geo-hero-banner p-10 md:p-14 mb-10 flex flex-col gap-3">
          <h1 className="text-3xl md:text-[32px] font-extrabold max-w-[400px] leading-[1.1] z-10">
            Connecting Skills to Solutions.
          </h1>
          <p className="text-base opacity-90 z-10 max-w-lg">
            Find the world's most talented engineers for your next project. 
            ProFinder bridges the gap between customers and highly functional technical experts.
          </p>
          <div className="flex gap-4 mt-6 z-10">
            <Link to="/engineers" className="geo-btn bg-white text-primary hover:bg-gray-50 border-none">
              Find an Engineer
            </Link>
            <Link to="/dashboard" className="geo-btn bg-transparent border border-white text-white hover:bg-white/10">
              Join as Professional
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section styling updated to Geometric Balance */}
      <section className="px-10 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[20px] font-bold text-[#0f172a]">Why choose ProFinder?</h3>
          <Link to="/about" className="text-sm font-semibold text-primary decoration-transparent hover:underline hover:underline-offset-4">Learn More &rarr;</Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-5">
          <div className="geo-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 bg-[#eff6ff] rounded-[6px] flex items-center justify-center text-primary">
              <Search size={24} />
            </div>
            <h4 className="text-[16px] font-bold text-[#0f172a]">Verified Experts</h4>
            <p className="text-[13px] text-[#64748b]">Browse profiles of vetted engineers. See their past projects, skills, and genuine customer reviews.</p>
          </div>
          <div className="geo-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 bg-[#eff6ff] rounded-[6px] flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <h4 className="text-[16px] font-bold text-[#0f172a]">Instant Booking</h4>
            <p className="text-[13px] text-[#64748b]">Book services with a transparent process. Chat directly with your engineer to verify requirements.</p>
          </div>
          <div className="geo-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 bg-[#eff6ff] rounded-[6px] flex items-center justify-center text-primary">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-[16px] font-bold text-[#0f172a]">Quality Assured</h4>
            <p className="text-[13px] text-[#64748b]">Payments and ratings keep our community accountable. High quality solutions, guaranteed.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
