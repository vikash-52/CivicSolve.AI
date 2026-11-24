import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-2.5">
            <Link to="/" className="inline-block group">
              <img 
                src="/logo.png" 
                alt="CivicSolve AI" 
                className="h-8 sm:h-9 w-auto object-contain block dark:hidden transition-transform group-hover:scale-[1.02]" 
              />
              <img 
                src="/logo-dark.png" 
                alt="CivicSolve AI" 
                className="h-8 sm:h-9 w-auto object-contain hidden dark:block transition-transform group-hover:scale-[1.02]" 
              />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              AI-Powered Societal Problem Solving & Collaborative Innovation Platform bridging citizens, municipal authorities, and university research teams.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Smart India Hackathon & College Demonstration Model</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Platform</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/issues" className="hover:text-brand-600 dark:hover:text-brand-400">Discover Issues</Link></li>
              <li><Link to="/report" className="hover:text-brand-600 dark:hover:text-brand-400">Report a Problem</Link></li>
              <li><Link to="/solutions" className="hover:text-brand-600 dark:hover:text-brand-400">Solution Hub</Link></li>
              <li><Link to="/impact" className="hover:text-brand-600 dark:hover:text-brand-400">Government Impact</Link></li>
            </ul>
          </div>

          {/* Roles & Dashboards */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Role Consoles</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Citizen Dashboard</Link></li>
              <li><Link to="/officer-dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Officer Console</Link></li>
              <li><Link to="/admin-dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Admin Control Panel</Link></li>
              <li><Link to="/student-dashboard" className="hover:text-brand-600 dark:hover:text-brand-400">Student Innovation Hub</Link></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">Governance</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400">About CivicSolve</Link></li>
              <li><Link to="/about#privacy" className="hover:text-brand-600 dark:hover:text-brand-400">Privacy & Transparency</Link></li>
              <li><Link to="/about#security" className="hover:text-brand-600 dark:hover:text-brand-400">RBAC Security Policy</Link></li>
              <li><span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All Services Operational</span></li>
            </ul>
          </div>

        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <p>© 2026 CivicSolve AI Platform. Developed for Public Good & Academic Demonstration.</p>
          <p className="mt-1 sm:mt-0 flex items-center space-x-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">FastAPI, Scikit-Learn & React</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

