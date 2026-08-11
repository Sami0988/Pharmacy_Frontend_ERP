'use client';

import { useTranslations } from '@/lib/i18n';
import { Pill, ShieldCheck, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

function FloatingDot({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-emerald-400/20"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

function GlowOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function BrandPanel() {
  const { t } = useTranslations();

  const highlights = [
    t('auth.brand.highlights.0'),
    t('auth.brand.highlights.1'),
    t('auth.brand.highlights.2'),
    t('auth.brand.highlights.3'),
  ];

  const stats = [
    { icon: Pill, value: '10K+', label: t('auth.brand.stats.batchesTracked') },
    { icon: ShieldCheck, value: '99.9%', label: t('auth.brand.stats.complianceRate') },
    { icon: BarChart3, value: '24/7', label: t('auth.brand.stats.realTimeMonitoring') },
    { icon: Clock, value: '<2s', label: t('auth.brand.stats.searchSpeed') },
  ];

  return (
    <div className="relative hidden lg:flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 overflow-hidden min-h-screen">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <FloatingDot delay={0} x="15%" y="20%" size={6} />
      <FloatingDot delay={0.5} x="75%" y="15%" size={4} />
      <FloatingDot delay={1} x="40%" y="60%" size={5} />
      <FloatingDot delay={1.5} x="85%" y="45%" size={3} />
      <FloatingDot delay={2} x="25%" y="80%" size={5} />
      <FloatingDot delay={2.5} x="60%" y="30%" size={4} />
      <FloatingDot delay={3} x="50%" y="75%" size={6} />
      <FloatingDot delay={0.8} x="10%" y="50%" size={3} />
      <FloatingDot delay={1.8} x="90%" y="70%" size={4} />

      {/* Glow orbs */}
      <GlowOrb className="top-[-100px] right-[-100px] h-[400px] w-[400px] bg-emerald-500/20" />
      <GlowOrb className="bottom-[-80px] left-[-80px] h-[300px] w-[300px] bg-teal-500/15" />
      <GlowOrb className="top-[40%] left-[-60px] h-[250px] w-[250px] bg-cyan-500/10" />

      {/* Animated line accents */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 shadow-lg shadow-emerald-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Pill className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-white tracking-tight">PharmERP</span>
          </div>
        </motion.div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Headline */}
            <h1 className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
              {t('auth.brand.tagline')}
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed mb-10">
              {t('auth.brand.description')}
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-12">
              {highlights.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 group"
                >
                  <motion.div
                    className="rounded-full bg-emerald-400/10 p-1"
                    whileHover={{ scale: 1.2, backgroundColor: 'rgba(52, 211, 153, 0.2)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/5 hover:border-emerald-500/20 transition-colors group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 p-2.5 group-hover:from-emerald-400/30 group-hover:to-teal-400/30 transition-all">
                    <stat.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{t('auth.brand.security')}</span>
        </motion.div>
      </div>
    </div>
  );
}
