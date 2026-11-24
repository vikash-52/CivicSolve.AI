import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, Sparkles, LogIn, ArrowRight, CheckCircle2,
  AlertCircle, Lock, Mail, User, Building2, Landmark, GraduationCap
} from 'lucide-react';

const QUICK_DEMO_ACCOUNTS = [
  { role: 'CITIZEN', email: 'citizen@civicsolve.demo', label: 'Citizen', desc: 'Rajesh Sharma' },
  { role: 'AUTHORITY_OFFICER', email: 'officer@civicsolve.demo', label: 'Officer', desc: 'Inspector Nair' },
  { role: 'SYSTEM_ADMIN', email: 'admin@civicsolve.demo', label: 'Admin', desc: 'Vikramaditya Rao' },
  { role: 'GOVERNMENT_OFFICIAL', email: 'official@civicsolve.demo', label: 'Official', desc: 'Dr. Sundaram, IAS' },
  { role: 'STUDENT_TEAM', email: 'student@civicsolve.demo', label: 'Student', desc: 'Team SmartRoads' },
  { role: 'FACULTY_MENTOR', email: 'faculty@civicsolve.demo', label: 'Faculty', desc: 'Prof. Banerjee' },
  { role: 'INDUSTRY_PARTNER', email: 'partner@civicsolve.demo', label: 'Partner', desc: 'UrbanInfra Ltd.' },
  { role: 'UNIVERSITY_TEAM', email: 'university@civicsolve.demo', label: 'University', desc: 'NIT Innovation Cell' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  useEffect(() => {
    resetForm();
    const handlePageShow = () => {
      resetForm();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      resetForm();
      redirectRole(user.role);
    } catch (err) {
      setPassword('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError(null);
    resetForm();
    try {
      const user = await switchDemoRole(role);
      redirectRole(user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectRole = (role) => {
    if (redirectUrl) {
      navigate(redirectUrl);
      return;
    }
    if (role === 'SYSTEM_ADMIN') navigate('/admin-dashboard');
    else if (role === 'AUTHORITY_OFFICER') navigate('/officer-dashboard');
    else if (role === 'GOVERNMENT_OFFICIAL') navigate('/government-dashboard');
    else if (role === 'STUDENT_TEAM') navigate('/student-dashboard');
    else if (role === 'FACULTY_MENTOR') navigate('/faculty-dashboard');
    else if (role === 'INDUSTRY_PARTNER') navigate('/industry-dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link to="/" className="inline-block mx-auto group">
          <img 
            src="/logo.png" 
            alt="CivicSolve AI" 
            className="h-16 sm:h-20 w-auto object-contain mx-auto block dark:hidden transition-transform group-hover:scale-[1.02]" 
          />
          <img 
            src="/logo-dark.png" 
            alt="CivicSolve AI" 
            className="h-16 sm:h-20 w-auto object-contain mx-auto hidden dark:block transition-transform group-hover:scale-[1.02]" 
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Sign In to CivicSolve AI
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your personal grievances, administrative queues, or student proposals.
        </p>
      </div>

      {/* Redirect Notice */}
      {redirectUrl && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl flex items-start space-x-3 shadow-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Sign In Required to Report a Problem
            </p>
            <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
              Civic problem submissions require a verified citizen session. Please sign in below — you will be redirected to the report form immediately.
            </p>
          </div>
        </div>
      )}

      {/* Evaluator Quick Access Box */}
      <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
        <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Evaluator 1-Click Role Switcher</span>
        </div>
        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-tight">
          Click any role below to instantly authenticate into its pre-seeded verified account:
        </p>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {QUICK_DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleDemoLogin(acc.role)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 text-left hover:border-indigo-500 transition-colors text-xs"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">{acc.label}</span>
              <span className="text-[10px] text-slate-400 truncate block">{acc.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleStandardLogin} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                autoComplete="off"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link 
            to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} 
            className="text-brand-600 font-semibold hover:underline"
          >
            Register as a Citizen
          </Link>
        </div>

      </div>

    </div>
  );
}

