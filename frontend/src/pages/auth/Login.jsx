import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaEnvelope, FaLock, FaBolt, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { AuthContext } from '../../context/AuthContext';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';


const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login }    = useContext(AuthContext);
  const navigate     = useNavigate();
  const leftRef      = useRef();
  const rightRef     = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(leftRef.current,  { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9 })
      .fromTo(rightRef.current, { opacity: 0, x: 60  }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.7')
      .fromTo('.login-field', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, '-=0.4');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@gmail.com')) {
      setErrorMsg("Please use a valid @gmail.com address.");
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
      return;
    }
    const localPart = emailLower.split('@')[0];
    if (localPart.length < 6 || localPart.length > 30) {
      setErrorMsg("Gmail username must be between 6 and 30 characters.");
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
      return;
    }
    if (!/^[a-z0-9.]+$/.test(localPart)) {
      setErrorMsg("Gmail can only contain letters, numbers, and periods.");
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
      return;
    }
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
      setErrorMsg("Invalid Gmail address format.");
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed', err);
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '🤖', title: 'AI Interview Simulator', desc: 'Realistic mock interviews with instant AI feedback' },
    { icon: '🎤', title: 'Voice Practice Mode', desc: 'Practice speaking with confidence' },
    { icon: '📊', title: 'Smart Analytics', desc: 'Track every improvement in detail' },
    { icon: '📄', title: 'Resume Analyzer', desc: 'ATS-optimized resume scoring' },
  ];

  return (
    <div className="flex h-screen w-full hero-bg overflow-hidden">

      {/* ── Left Panel ── */}
      <div
        ref={leftRef}
        className="hidden lg:flex flex-1 flex-col justify-center px-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(10,10,40,0.95) 0%, rgba(30,27,75,0.9) 100%)' }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaBolt className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewX</span>
          </Link>

          <div className="badge inline-flex items-center gap-2 mb-5">
            <HiSparkles className="text-indigo-400" />
            <span>AI-Powered Practice Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome Back to Your{' '}
            <span className="shimmer-text">Interview Journey</span>
          </h1>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Continue your preparation and land that dream offer. Every practice session brings you closer.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 glass-card rounded-xl px-4 py-3 border border-white/5 hover:border-indigo-500/30 transition-all">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 h-full relative overflow-hidden" style={{ background: 'rgba(5,5,20,0.97)' }}>
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />

        <div className="min-h-full w-full flex items-center justify-center p-4 lg:p-8">
          <div ref={rightRef} className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FaBolt className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewX</span>
          </Link>

          <div className="glass-card-bright rounded-3xl p-6 border border-indigo-500/15"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Sign In 👋
              </h2>
              <p className="text-slate-400 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  {errorMsg}
                </div>
              )}
              {/* Email */}
              <div className="login-field opacity-0">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="email"
                    className="input-dark w-full rounded-xl pl-11 pr-4 py-3 text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field opacity-0">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-dark w-full rounded-xl pl-11 pr-12 py-3 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="login-field opacity-0 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-600 accent-indigo-500" />
                  Remember me
                </label>
                <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot password?</a>
              </div>

              {/* Submit */}
              <div className="login-field opacity-0 pt-1">
                <button type="submit" disabled={loading}
                  className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white btn-primary glow-btn disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ── Google Sign-In Divider ── */}
            <div className="mt-4">
              <div className="relative flex items-center justify-center mb-3">
                <div className="flex-1 border-t border-white/8" />
                <span className="mx-3 text-xs text-slate-600 font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-white/8" />
              </div>
              <GoogleAuthButton label="Continue with Google" />
              <p className="mt-3 text-center text-slate-600 text-xs">
                Only real Gmail accounts can sign in with Google
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Create one free →
                </Link>
              </p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
