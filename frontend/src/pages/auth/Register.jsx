import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FaUser, FaEnvelope, FaLock, FaBolt, FaArrowRight, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { AuthContext } from '../../context/AuthContext';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';

const Register = () => {
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');
  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();
  const leftRef      = useRef();
  const rightRef     = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(leftRef.current,  { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9 })
      .fromTo(rightRef.current, { opacity: 0, x: 60  }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.7')
      .fromTo('.reg-field', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 }, '-=0.4');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      gsap.fromTo(rightRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', repeat: 3, yoyo: true });
      return;
    }

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
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed', err);
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    '10,000+ curated interview questions',
    'Personalized AI roadmap for your role',
    'Real-time voice & text mock interviews',
    'Company-specific question banks',
    'Resume ATS scoring & optimization',
    'Active community of 50k+ learners',
  ];

  const strengthLevel = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="flex h-screen w-full hero-bg overflow-hidden">

      {/* ── Left Panel ── */}
      <div
        ref={leftRef}
        className="auth-left-panel hidden lg:flex flex-1 flex-col justify-center px-14 relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-10 left-0 w-60 h-60 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

        <div className="relative z-10 max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaBolt className="text-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewX</span>
          </Link>

          <div className="badge inline-flex items-center gap-2 mb-5">
            <HiSparkles className="text-indigo-400" />
            <span>Join 50,000+ Candidates</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-foreground mb-5 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Start Your Path to{' '}
            <span className="shimmer-text">Your Dream Job</span>
          </h1>
          <p className="text-muted-foreground text-base mb-10 leading-relaxed">
            Everything you need to ace technical and behavioral interviews — all in one powerful platform.
          </p>

          <div className="space-y-3">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground text-sm">
                <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
                {perk}
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-10 bg-card border border-border shadow-sm rounded-2xl p-4 border border-border flex items-center gap-4">
            <div className="flex -space-x-2">
              {['👨‍💻','👩‍💼','🧑‍🎓','👩‍💻'].map((a, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm border-2 border-slate-900">
                  {a}
                </div>
              ))}
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">1,200+ joined this week</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xs">★</span>)}
                <span className="text-muted-foreground text-xs ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right-panel flex-1 h-full relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none auth-radial-glow" />

        <div className="min-h-full w-full flex items-center justify-center p-4 lg:p-6">
          <div ref={rightRef} className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FaBolt className="text-foreground text-sm" />
            </div>
            <span className="text-lg font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>InterviewX</span>
          </Link>

          <div className="bg-card border border-border shadow-md rounded-3xl p-6 border border-indigo-500/15"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

            <div className="mb-4">
              <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Create Your Account 🚀
              </h2>
              <p className="text-muted-foreground text-sm">Start practicing for free — no card required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMsg && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  {errorMsg}
                </div>
              )}
              {/* Name */}
              <div className="reg-field opacity-0">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type="text"
                    className="input-dark w-full rounded-xl pl-11 pr-4 py-2.5 text-sm"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="reg-field opacity-0">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type="email"
                    className="input-dark w-full rounded-xl pl-11 pr-4 py-2.5 text-sm"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reg-field opacity-0">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-dark w-full rounded-xl pl-11 pr-12 py-2.5 text-sm"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-card overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(strengthLevel / 3) * 100}%`, background: strengthColors[strengthLevel] }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: strengthColors[strengthLevel] }}>
                      {strengthLabels[strengthLevel]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="reg-field opacity-0">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-dark w-full rounded-xl pl-11 pr-4 py-2.5 text-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm" />
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="reg-field opacity-0 pt-2">
                <button type="submit" disabled={loading}
                  className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-foreground btn-primary glow-btn disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Start Practicing Free
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-slate-600 text-xs">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* ── Google Sign-Up ── */}
            <div className="mt-4">
              <div className="relative flex items-center justify-center mb-3">
                <div className="flex-1 border-t border-border" />
                <span className="mx-3 text-xs text-slate-600 font-medium uppercase tracking-wider">or sign up with</span>
                <div className="flex-1 border-t border-border" />
              </div>
              <GoogleAuthButton label="Sign up with Google" />
              <p className="mt-3 text-center text-slate-600 text-xs">
                🔒 Only real, verified Google accounts are accepted
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in →
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

export default Register;
