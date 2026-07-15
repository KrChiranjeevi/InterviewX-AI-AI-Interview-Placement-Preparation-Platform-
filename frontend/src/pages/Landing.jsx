import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import {
  FaBrain, FaMicrophone, FaChartLine, FaFileAlt,
  FaCode, FaUsers, FaArrowRight, FaStar,
  FaLinkedin, FaGithub, FaTwitter, FaBolt,
  FaShieldAlt, FaTrophy, FaRocket, FaCheckCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* ── 3D Hero Scene ── */
function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#c084fc" />
      <pointLight position={[5, -3, 2]} intensity={0.6} color="#06b6d4" />

      <Stars radius={80} depth={40} count={3000} factor={3} fade speed={0.5} />

      {/* Main orb */}
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
        <Sphere args={[1.4, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#4f46e5"
            distort={0.45}
            speed={2}
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </Float>

      {/* Small accent orbs */}
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.2}>
        <Sphere args={[0.45, 32, 32]} position={[2.5, 1.2, -1]}>
          <MeshDistortMaterial color="#8b5cf6" distort={0.6} speed={3} roughness={0} metalness={1} transparent opacity={0.85} />
        </Sphere>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1}>
        <Sphere args={[0.3, 32, 32]} position={[-2.6, -0.8, -0.5]}>
          <MeshDistortMaterial color="#06b6d4" distort={0.5} speed={2.5} roughness={0} metalness={1} transparent opacity={0.8} />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={0.9}>
        <Sphere args={[0.22, 32, 32]} position={[-1.8, 2, -1.5]}>
          <MeshDistortMaterial color="#f59e0b" distort={0.7} speed={4} roughness={0} metalness={1} transparent opacity={0.75} />
        </Sphere>
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

/* ── Navbar ── */
function Navbar() {
  const navRef = useRef();
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDarkMode]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-glass shadow-lg border-b border-slate-200 dark:border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            InterviewX AI
          </span>
        </div>

        {/* Center menu links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="#stats" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Results</a>
          <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Reviews</a>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Sign In */}
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer"
          >
            Sign In
          </Link>

          {/* Get Started */}
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = '', duration = 2 }) {
  const ref = useRef();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toLocaleString() + suffix;
      },
    });
  }, [started, target, suffix, duration]);

  return <span ref={ref} className="stat-number">0{suffix}</span>;
}

/* ── Main Landing ── */
const Landing = () => {
  const heroRef      = useRef();
  const titleRef     = useRef();
  const subtitleRef  = useRef();
  const ctaRef       = useRef();
  const badgeRef     = useRef();
  const featuresRef  = useRef();
  const statsRef     = useRef();
  const testimonialsRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(badgeRef.current,   { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(titleRef.current,   { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9 }, '-=0.3')
        .fromTo(subtitleRef.current,{ opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(ctaRef.current,     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');

      /* Feature cards stagger */
      gsap.fromTo('.feature-card-item',
        { opacity: 0, y: 60, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' }
        }
      );

      /* Stats */
      gsap.fromTo('.stat-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' }
        }
      );

      /* Testimonials */
      gsap.fromTo('.testimonial-item',
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: testimonialsRef.current, start: 'top 80%' }
        }
      );

      /* Section titles */
      gsap.fromTo('.section-title',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: '.section-title', start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <FaBrain className="text-3xl" />,
      color: 'from-indigo-500 to-purple-600',
      glow: 'rgba(99,102,241,0.3)',
      title: 'AI Interview Simulator',
      desc: 'Practice with an intelligent AI interviewer that adapts to your skill level, providing real-time feedback and follow-up questions.'
    },
    {
      icon: <FaMicrophone className="text-3xl" />,
      color: 'from-purple-500 to-pink-600',
      glow: 'rgba(168,85,247,0.3)',
      title: 'Voice Practice Mode',
      desc: 'Speak your answers aloud. Our AI analyzes tone, clarity, pacing, and content for a truly realistic interview experience.'
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      color: 'from-cyan-500 to-blue-600',
      glow: 'rgba(6,182,212,0.3)',
      title: 'Smart Performance Reports',
      desc: 'Detailed analytics on every session — score breakdowns, weak areas, improvement trends, and personalized action plans.'
    },
    {
      icon: <FaFileAlt className="text-3xl" />,
      color: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16,185,129,0.3)',
      title: 'Resume Analyzer',
      desc: 'Upload your resume and get instant ATS score, keyword gaps, tailored suggestions, and questions based on your experience.'
    },
    {
      icon: <FaCode className="text-3xl" />,
      color: 'from-orange-500 to-red-600',
      glow: 'rgba(249,115,22,0.3)',
      title: 'Live Coding Interview',
      desc: 'Solve DSA problems in an embedded code editor with AI hints, complexity analysis, and guided walkthroughs.'
    },
    {
      icon: <FaUsers className="text-3xl" />,
      color: 'from-yellow-500 to-amber-600',
      glow: 'rgba(234,179,8,0.3)',
      title: 'Community & Peer Review',
      desc: 'Join study groups, share your interview experiences, and get peer feedback from a thriving community of job seekers.'
    },
  ];

  const stats = [
    { value: 50000, suffix: '+', label: 'Interviews Practiced' },
    { value: 95,    suffix: '%', label: 'Success Rate' },
    { value: 1200,  suffix: '+', label: 'Companies Covered' },
    { value: 4.9,   suffix: '★', label: 'Average Rating' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'SDE @ Google',
      avatar: '👩‍💻',
      text: 'InterviewX completely transformed my preparation. The AI feedback was spot-on and I landed my dream job at Google after just 3 weeks!',
      stars: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Software Engineer @ Microsoft',
      avatar: '👨‍💼',
      text: 'The voice practice mode felt exactly like a real interview. The coding rounds and resume analyzer are absolutely top-notch.',
      stars: 5,
    },
    {
      name: 'Ananya Patel',
      role: 'Product Manager @ Meta',
      avatar: '👩‍🎯',
      text: 'I was skeptical at first but the depth of AI feedback blew me away. Highly recommend to anyone serious about cracking tech interviews.',
      stars: 5,
    },
  ];

  const howItWorks = [
    { step: '01', icon: <FaRocket />, title: 'Create Your Profile', desc: 'Sign up and tell us your target role, experience level, and dream companies.' },
    { step: '02', icon: <FaBrain />, title: 'AI Curates Your Plan', desc: 'Get a personalized roadmap with questions, resources, and mock sessions.' },
    { step: '03', icon: <FaMicrophone />, title: 'Practice with AI', desc: 'Simulate real interviews with voice, text, and coding challenges.' },
    { step: '04', icon: <FaTrophy />, title: 'Land Your Dream Job', desc: 'Track progress, refine weak areas, and walk into interviews with confidence.' },
  ];

  return (
    <div ref={heroRef} className="min-h-screen hero-bg grid-pattern noise-overlay overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 pt-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <div className="z-10">
            <div ref={badgeRef} className="opacity-0 inline-flex items-center gap-2 badge mb-6">
              <HiSparkles className="text-indigo-400" />
              <span>AI-Powered Interview Preparation</span>
            </div>

            <h1
              ref={titleRef}
              className="opacity-0 text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span className="text-white">Crack Every</span>
              <br />
              <span className="shimmer-text">Interview.</span>
              <br />
              <span className="text-white">Every Time.</span>
            </h1>

            <p
              ref={subtitleRef}
              className="opacity-0 text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed"
            >
              Master technical and behavioral interviews with AI-powered mock sessions, instant feedback, live coding practice, and personalized roadmaps. Your dream job is one practice session away.
            </p>

            <div ref={ctaRef} className="opacity-0 flex flex-wrap gap-4 items-center">
              <Link
                to="/register"
                className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl btn-primary glow-btn"
              >
                Start Practicing Free
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-base font-semibold text-slate-300 rounded-2xl glass-card glow-border hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              {['No credit card required', 'Free forever plan', '10k+ users trust us'].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: 3D Canvas */}
          <div className="relative h-[420px] lg:h-[560px] rounded-3xl overflow-hidden">
            {/* Glow behind canvas */}
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
            <HeroScene />

            {/* Floating UI cards overlay */}
            <div className="absolute top-8 left-4 glass-card rounded-2xl p-3 flex items-center gap-3 float-anim shadow-xl border border-indigo-500/20">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm">
                <FaBrain />
              </div>
              <div>
                <p className="text-xs text-slate-400">AI Feedback</p>
                <p className="text-sm font-semibold text-white">Score: 94/100</p>
              </div>
            </div>

            <div className="absolute bottom-12 right-4 glass-card rounded-2xl p-3 flex items-center gap-3 float-anim-slow shadow-xl border border-cyan-500/20" style={{ animationDelay: '1.5s' }}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm">
                <FaTrophy />
              </div>
              <div>
                <p className="text-xs text-slate-400">Interview Cleared</p>
                <p className="text-sm font-semibold text-white">Google SDE-2 🎉</p>
              </div>
            </div>

            <div className="absolute top-1/2 right-6 glass-card rounded-2xl p-3 float-anim shadow-xl border border-purple-500/20" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-400 text-xs" />)}
              </div>
              <p className="text-xs text-slate-300 font-medium">Best practice tool!</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 text-xs">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-slate-700 flex justify-center pt-1">
            <div className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" ref={statsRef} className="py-20 relative">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.05) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)' }} />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="stat-item opacity-0 glass-card-bright rounded-2xl p-6 text-center glow-border">
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featuresRef} className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="section-title text-center mb-16 opacity-0">
            <div className="badge inline-flex items-center gap-2 mb-4">
              <FaShieldAlt className="text-indigo-400" /> Everything You Need
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              All Tools. <span className="gradient-text">One Platform.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From AI mock interviews to coding practice — everything a serious job seeker needs, powered by cutting-edge AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card-item feature-card opacity-0 glass-card rounded-2xl p-6 border border-white/5 cursor-default"
                style={{ '--glow': f.glow }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg`}
                  style={{ boxShadow: `0 8px 20px ${f.glow}` }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="section-title text-center mb-16 opacity-0">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">From sign-up to offer letter in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.4), transparent)' }} />
                )}
                <div className="glass-card rounded-2xl p-6 text-center relative z-10 border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 duration-300">
                  <div className="text-xs font-bold text-indigo-400 mb-3 tracking-widest">{item.step}</div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="section-title text-center mb-16 opacity-0">
            <div className="badge inline-flex items-center gap-2 mb-4">
              <FaStar className="text-yellow-400" /> Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Real People. <span className="gradient-text">Real Results.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-item opacity-0 glass-card-bright rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <FaStar key={s} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="glass-card-bright rounded-3xl p-12 border border-indigo-500/20"
            style={{ boxShadow: '0 0 80px rgba(99,102,241,0.15)' }}>
            <div className="text-5xl mb-6">🚀</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Ace Your <span className="gradient-text">Dream Interview?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join 50,000+ candidates who transformed their interview skills. Start free today — no credit card required.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white rounded-2xl btn-primary glow-btn"
            >
              Start for Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FaBolt className="text-white text-xs" />
            </div>
            <span className="font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewX AI</span>
          </div>
          <p className="text-slate-600 text-sm">© 2025 InterviewX AI. Built to help you succeed.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <a href="#" className="hover:text-indigo-400 transition-colors"><FaLinkedin className="text-lg" /></a>
            <a href="#" className="hover:text-indigo-400 transition-colors"><FaGithub className="text-lg" /></a>
            <a href="#" className="hover:text-indigo-400 transition-colors"><FaTwitter className="text-lg" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
